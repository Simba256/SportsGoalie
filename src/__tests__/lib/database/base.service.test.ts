import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseDatabaseService, DatabaseError } from '@/lib/database/base.service';
import { createMockFirestoreDoc, createMockFirestoreQuerySnapshot, createMockApiResponse } from '../../setup';
import * as firestore from 'firebase/firestore';

// Mock firestore functions
const mockAddDoc = vi.mocked(firestore.addDoc);
const mockGetDoc = vi.mocked(firestore.getDoc);
const mockGetDocs = vi.mocked(firestore.getDocs);
const mockUpdateDoc = vi.mocked(firestore.updateDoc);
const mockDeleteDoc = vi.mocked(firestore.deleteDoc);
const mockCollection = vi.mocked(firestore.collection);
const mockDoc = vi.mocked(firestore.doc);
const mockQuery = vi.mocked(firestore.query);
const mockWhere = vi.mocked(firestore.where);
const mockOrderBy = vi.mocked(firestore.orderBy);
const mockLimit = vi.mocked(firestore.limit);
const mockWriteBatch = vi.mocked(firestore.writeBatch);
const mockOnSnapshot = vi.mocked(firestore.onSnapshot);

describe('BaseDatabaseService', () => {
  let service: BaseDatabaseService;

  beforeEach(() => {
    service = new BaseDatabaseService();
    service.clearCache(); // Clear cache before each test
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a document successfully', async () => {
      const testData = { name: 'Test Item', value: 123 };
      const mockDocRef = { id: 'test-doc-id' };

      mockAddDoc.mockResolvedValue(mockDocRef as any);

      const result = await service.create('test-collection', testData);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('test-doc-id');
      expect(result.message).toBe('Document created successfully');
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          name: 'Test Item',
          value: 123,
          createdAt: expect.anything(),
          updatedAt: expect.anything(),
        })
      );
    });

    it('should handle creation errors', async () => {
      const testData = { name: 'Test Item' };
      const error = new Error('Firestore error');

      mockAddDoc.mockRejectedValue(error);

      await expect(service.create('test-collection', testData)).rejects.toThrow();
    }, 10000);

    it('should retry on retryable errors', async () => {
      const testData = { name: 'Test Item' };
      const mockDocRef = { id: 'test-doc-id' };

      // First call fails, second succeeds
      mockAddDoc
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockDocRef as any);

      const result = await service.create('test-collection', testData);

      expect(result.success).toBe(true);
      expect(mockAddDoc).toHaveBeenCalledTimes(2);
    });
  });

  describe('getById', () => {
    it('should retrieve a document by ID', async () => {
      const testData = { id: 'test-id', name: 'Test Item' };
      const mockDocSnap = createMockFirestoreDoc('test-id', testData);

      mockGetDoc.mockResolvedValue(mockDocSnap as any);

      const result = await service.getById('test-collection', 'test-id');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 'test-id', ...testData });
    });

    it('should return null for non-existent document', async () => {
      const mockDocSnap = {
        exists: () => false,
      };

      mockGetDoc.mockResolvedValue(mockDocSnap as any);

      const result = await service.getById('test-collection', 'non-existent');

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
      expect(result.message).toBe('Document not found');
    });

    it('should use cache when available', async () => {
      const testData = { id: 'test-id', name: 'Test Item' };
      const mockDocSnap = createMockFirestoreDoc('test-id', testData);

      mockGetDoc.mockResolvedValue(mockDocSnap as any);

      // First call should hit database
      await service.getById('test-collection', 'test-id');
      expect(mockGetDoc).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const result = await service.getById('test-collection', 'test-id');
      expect(mockGetDoc).toHaveBeenCalledTimes(1); // No additional call
      expect(result.success).toBe(true);
    });

    it('should skip cache when useCache is false', async () => {
      const testData = { id: 'test-id', name: 'Test Item' };
      const mockDocSnap = createMockFirestoreDoc('test-id', testData);

      mockGetDoc.mockResolvedValue(mockDocSnap as any);

      // Both calls should hit database
      await service.getById('test-collection', 'test-id', { useCache: false });
      await service.getById('test-collection', 'test-id', { useCache: false });

      expect(mockGetDoc).toHaveBeenCalledTimes(2);
    });
  });

  describe('update', () => {
    it('should update a document successfully', async () => {
      const updateData = { name: 'Updated Item' };

      mockUpdateDoc.mockResolvedValue(undefined);

      const result = await service.update('test-collection', 'test-id', updateData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Document updated successfully');
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          name: 'Updated Item',
          updatedAt: expect.anything(),
        })
      );
    });

    it('should handle update errors', async () => {
      const updateData = { name: 'Updated Item' };
      const error = new Error('Update failed');

      mockUpdateDoc.mockRejectedValue(error);

      await expect(service.update('test-collection', 'test-id', updateData)).rejects.toThrow();
    }, 10000);
  });

  describe('delete', () => {
    it('should delete a document successfully', async () => {
      mockDeleteDoc.mockResolvedValue(undefined);

      const result = await service.delete('test-collection', 'test-id');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Document deleted successfully');
      expect(mockDeleteDoc).toHaveBeenCalledWith(expect.anything());
    });

    it('should perform soft delete when requested', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      const result = await service.delete('test-collection', 'test-id', { softDelete: true });

      expect(result.success).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          isDeleted: true,
          deletedAt: expect.anything(),
          updatedAt: expect.anything(),
        })
      );
    });
  });

  describe('query', () => {
    it('should query documents with basic options', async () => {
      const testDocs = [
        createMockFirestoreDoc('doc1', { name: 'Item 1' }),
        createMockFirestoreDoc('doc2', { name: 'Item 2' }),
      ];
      const mockSnapshot = createMockFirestoreQuerySnapshot(testDocs);

      mockGetDocs.mockResolvedValue(mockSnapshot as any);

      const result = await service.query('test-collection', {
        limit: 10,
        orderBy: [{ field: 'name', direction: 'asc' }],
      });

      expect(result.success).toBe(true);
      expect(result.data?.items).toHaveLength(2);
      expect(result.data?.total).toBe(2);
      expect(result.data?.hasMore).toBe(false);
    });

    it('should apply where conditions', async () => {
      const testDocs = [createMockFirestoreDoc('doc1', { name: 'Item 1', active: true })];
      const mockSnapshot = createMockFirestoreQuerySnapshot(testDocs);

      mockGetDocs.mockResolvedValue(mockSnapshot as any);

      await service.query('test-collection', {
        where: [{ field: 'active', operator: '==', value: true }],
      });

      expect(mockWhere).toHaveBeenCalledWith('active', '==', true);
    });

    it('should apply ordering', async () => {
      const testDocs = [createMockFirestoreDoc('doc1', { name: 'Item 1' })];
      const mockSnapshot = createMockFirestoreQuerySnapshot(testDocs);

      mockGetDocs.mockResolvedValue(mockSnapshot as any);

      await service.query('test-collection', {
        orderBy: [
          { field: 'createdAt', direction: 'desc' },
          { field: 'name', direction: 'asc' },
        ],
      });

      expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(mockOrderBy).toHaveBeenCalledWith('name', 'asc');
    });

    it('should apply limit', async () => {
      const testDocs = [createMockFirestoreDoc('doc1', { name: 'Item 1' })];
      const mockSnapshot = createMockFirestoreQuerySnapshot(testDocs);

      mockGetDocs.mockResolvedValue(mockSnapshot as any);

      await service.query('test-collection', { limit: 5 });

      expect(mockLimit).toHaveBeenCalledWith(5);
    });
  });

  describe('subscribeToDocument', () => {
    it('should set up document subscription', () => {
      const callback = vi.fn();
      const mockUnsubscribe = vi.fn();

      mockOnSnapshot.mockReturnValue(mockUnsubscribe);

      const unsubscribe = service.subscribeToDocument('test-collection', 'test-id', callback);

      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(unsubscribe).toBe(mockUnsubscribe);
    });

    it('should call callback with document updates', () => {
      const callback = vi.fn();
      const mockUnsubscribe = vi.fn();

      mockOnSnapshot.mockReturnValue(mockUnsubscribe);

      service.subscribeToDocument('test-collection', 'test-id', callback);

      expect(mockOnSnapshot).toHaveBeenCalled();
    });
  });

  describe('subscribeToCollection', () => {
    it('should set up collection subscription', () => {
      const callback = vi.fn();
      const mockUnsubscribe = vi.fn();

      mockOnSnapshot.mockReturnValue(mockUnsubscribe);

      const unsubscribe = service.subscribeToCollection('test-collection', {}, callback);

      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });

  describe('batchWrite', () => {
    it('should execute batch operations', async () => {
      const mockBatch = {
        set: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        commit: vi.fn().mockResolvedValue(undefined),
      };

      mockWriteBatch.mockReturnValue(mockBatch as any);

      const operations = [
        { type: 'create' as const, collection: 'test', id: 'id1', data: { name: 'Item 1' } },
        { type: 'update' as const, collection: 'test', id: 'id2', data: { name: 'Updated' } },
        { type: 'delete' as const, collection: 'test', id: 'id3' },
      ];

      const result = await service.batchWrite(operations);

      expect(result.success).toBe(true);
      expect(mockBatch.set).toHaveBeenCalled();
      expect(mockBatch.update).toHaveBeenCalled();
      expect(mockBatch.delete).toHaveBeenCalled();
      expect(mockBatch.commit).toHaveBeenCalled();
    });
  });

  describe('incrementField', () => {
    it('should increment a field value', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      const result = await service.incrementField('test-collection', 'test-id', 'counter', 5);

      expect(result.success).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          counter: expect.objectContaining({ _methodName: 'increment', _value: 5 }),
          updatedAt: expect.anything(),
        })
      );
    });
  });

  describe('arrayOperations', () => {
    it('should perform array operations', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      const operations = [
        { field: 'tags', operation: 'add' as const, value: 'new-tag' },
        { field: 'oldTags', operation: 'remove' as const, value: 'old-tag' },
      ];

      const result = await service.arrayOperations('test-collection', 'test-id', operations);

      expect(result.success).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          tags: expect.objectContaining({ _methodName: 'arrayUnion', _value: 'new-tag' }),
          oldTags: expect.objectContaining({ _methodName: 'arrayRemove', _value: 'old-tag' }),
          updatedAt: expect.anything(),
        })
      );
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status when database is accessible', async () => {
      const mockSnapshot = createMockFirestoreQuerySnapshot([]);
      mockGetDocs.mockResolvedValue(mockSnapshot as any);

      const result = await service.healthCheck();

      expect(result.status).toBe('healthy');
      expect(result.latency).toBeGreaterThanOrEqual(0);
      expect(result.cacheStats).toBeDefined();
    });

    it('should return unhealthy status on database error', async () => {
      mockGetDocs.mockRejectedValue(new Error('Database unavailable'));

      const result = await service.healthCheck();

      expect(result.status).toBe('unhealthy');
      expect(result.latency).toBeGreaterThanOrEqual(0);
    });
  });

  describe('cache management', () => {
    it('should clear cache when requested', () => {
      // This is a synchronous operation, no mocking needed
      expect(() => service.clearCache()).not.toThrow();
    });

    it('should return cache stats', () => {
      const stats = service.getCacheStats();

      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('maxSize');
      expect(stats).toHaveProperty('hitRate');
    });
  });

  describe('helper methods', () => {
    it('should check if document exists', async () => {
      const mockDocSnap = createMockFirestoreDoc('test-id', { name: 'Test' });
      mockGetDoc.mockResolvedValue(mockDocSnap as any);

      const exists = await service.exists('test-collection', 'test-id');

      expect(exists).toBe(true);
    });

    it('should return false for non-existent document', async () => {
      const mockDocSnap = { exists: () => false };
      mockGetDoc.mockResolvedValue(mockDocSnap as any);

      const exists = await service.exists('test-collection', 'non-existent');

      expect(exists).toBe(false);
    });

    it('should count documents', async () => {
      const mockSnapshot = createMockFirestoreQuerySnapshot([
        createMockFirestoreDoc('doc1', {}),
        createMockFirestoreDoc('doc2', {}),
      ]);
      mockGetDocs.mockResolvedValue(mockSnapshot as any);

      const count = await service.count('test-collection');

      expect(count).toBe(2);
    });
  });

  describe('error handling', () => {
    it('should create DatabaseError with correct properties', () => {
      const error = new DatabaseError('Test error', 'TEST_CODE', { detail: 'test' }, true);

      expect(error.name).toBe('DatabaseError');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.details).toEqual({ detail: 'test' });
      expect(error.retryable).toBe(true);
    });

    it('should handle network errors with retry', async () => {
      const testData = { name: 'Test Item' };

      // Simulate network error followed by success
      mockAddDoc
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ id: 'test-id' } as any);

      const result = await service.create('test-collection', testData);

      expect(result.success).toBe(true);
      expect(mockAddDoc).toHaveBeenCalledTimes(2);
    });

    it('should not retry non-retryable errors', async () => {
      const testData = { name: 'Test Item' };
      const error = new Error('Permission denied');
      (error as any).code = 'permission-denied';

      mockAddDoc.mockRejectedValue(error);

      await expect(service.create('test-collection', testData)).rejects.toThrow();
      expect(mockAddDoc).toHaveBeenCalledTimes(1); // No retry
    });
  });
});
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomContentService } from '@/lib/database/services/custom-content.service';
import { Timestamp } from 'firebase/firestore';
import * as firestore from 'firebase/firestore';
import * as storage from 'firebase/storage';

// Mock Firebase Firestore functions
const mockGetDoc = vi.mocked(firestore.getDoc);
const mockGetDocs = vi.mocked(firestore.getDocs);
const mockSetDoc = vi.mocked(firestore.setDoc);
const mockUpdateDoc = vi.mocked(firestore.updateDoc);
const mockDeleteDoc = vi.mocked(firestore.deleteDoc);

// Mock Firebase Storage functions
const mockUploadBytes = vi.mocked(storage.uploadBytes);
const mockGetDownloadURL = vi.mocked(storage.getDownloadURL);
const mockDeleteObject = vi.mocked(storage.deleteObject);
const mockRef = vi.mocked(storage.ref);

// Mock cache service
vi.mock('@/lib/utils/cache.service', () => ({
  cacheService: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

// Import mocked cache service
import { cacheService } from '@/lib/utils/cache.service';
const mockCacheGet = vi.mocked(cacheService.get);
const mockCacheSet = vi.mocked(cacheService.set);
const mockCacheDelete = vi.mocked(cacheService.delete);

// Helper to create mock Timestamp
const createMockTimestamp = (millis: number = Date.now()) => ({
  toMillis: () => millis,
  toDate: () => new Date(millis),
  seconds: Math.floor(millis / 1000),
  nanoseconds: 0,
} as unknown as Timestamp);

// Helper to create mock custom content data
const createMockContent = (overrides: any = {}) => ({
  id: 'content_123456789',
  createdBy: 'coach123',
  title: 'Test Content',
  description: 'A test custom content',
  type: 'lesson' as const,
  content: '<p>Test lesson content</p>',
  videoUrl: 'https://example.com/video.mp4',
  attachments: [],
  pillarId: 'pillar_1',
  levelId: 'level_1',
  tags: ['test', 'unit'],
  isPublic: false,
  usageCount: 0,
  estimatedTimeMinutes: 30,
  learningObjectives: ['Objective 1', 'Objective 2'],
  metadata: {
    views: 0,
    completions: 0,
    totalRatings: 0,
  },
  createdAt: createMockTimestamp(),
  updatedAt: createMockTimestamp(),
  ...overrides,
});

// Helper to create mock Firestore document
const createMockFirestoreDoc = (id: string, data: any, exists = true) => ({
  id,
  data: () => data,
  exists: () => exists,
  ref: { id },
});

// Helper to create mock Firestore query snapshot
const createMockQuerySnapshot = (docs: any[]) => ({
  docs: docs.map((d, i) => ({
    id: d.id || `doc_${i}`,
    data: () => d,
    exists: () => true,
    ref: { id: d.id || `doc_${i}` },
  })),
  size: docs.length,
  empty: docs.length === 0,
  forEach: (cb: (doc: any) => void) =>
    docs.forEach((d, i) => cb({ id: d.id || `doc_${i}`, data: () => d })),
});

// Helper to create mock File
const createMockFile = (name: string, size: number = 1024): File => {
  const blob = new Blob(['test content'], { type: 'application/octet-stream' });
  return new File([blob], name, { type: 'application/octet-stream' });
};

describe('CustomContentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCacheGet.mockReturnValue(null);
    mockRef.mockReturnValue({ fullPath: 'test/path' } as any);
  });

  describe('createContent', () => {
    it('should create content successfully', async () => {
      const inputData = {
        title: 'New Content',
        description: 'Test description',
        type: 'lesson' as const,
        content: '<p>Lesson content</p>',
        pillarId: 'pillar_1',
        levelId: 'level_1',
      };

      mockSetDoc.mockResolvedValue(undefined);

      const result = await CustomContentService.createContent('coach123', inputData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.title).toBe('New Content');
      expect(result.data?.createdBy).toBe('coach123');
      expect(mockSetDoc).toHaveBeenCalled();
      expect(mockCacheDelete).toHaveBeenCalledWith('coach_content_coach123');
    });

    it('should upload attachments when provided', async () => {
      const mockFile = createMockFile('test.pdf');
      const inputData = {
        title: 'Content with Attachment',
        description: 'Test description',
        type: 'lesson' as const,
        content: '<p>Lesson content</p>',
        pillarId: 'pillar_1',
        attachments: [mockFile],
      };

      mockUploadBytes.mockResolvedValue({ ref: {} } as any);
      mockGetDownloadURL.mockResolvedValue('https://storage.example.com/test.pdf');
      mockSetDoc.mockResolvedValue(undefined);

      const result = await CustomContentService.createContent('coach123', inputData);

      expect(result.success).toBe(true);
      expect(result.data?.attachments).toContain('https://storage.example.com/test.pdf');
    });

    it('should set default values for optional fields', async () => {
      const inputData = {
        title: 'Minimal Content',
        description: 'Minimal description',
        type: 'quiz' as const,
        content: null,
        pillarId: 'pillar_1',
      };

      mockSetDoc.mockResolvedValue(undefined);

      const result = await CustomContentService.createContent('coach123', inputData);

      expect(result.success).toBe(true);
      expect(result.data?.tags).toEqual([]);
      expect(result.data?.isPublic).toBe(false);
      expect(result.data?.usageCount).toBe(0);
    });

    it('should handle creation errors', async () => {
      const inputData = {
        title: 'Failed Content',
        description: 'Test description',
        type: 'lesson' as const,
        content: '<p>Content</p>',
        pillarId: 'pillar_1',
      };

      mockSetDoc.mockRejectedValue(new Error('Firestore error'));

      const result = await CustomContentService.createContent('coach123', inputData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CONTENT_CREATE_ERROR');
    });
  });

  describe('uploadAttachment', () => {
    it('should upload file successfully', async () => {
      const mockFile = createMockFile('document.pdf');
      mockUploadBytes.mockResolvedValue({ ref: {} } as any);
      mockGetDownloadURL.mockResolvedValue('https://storage.example.com/document.pdf');

      const result = await CustomContentService.uploadAttachment(
        mockFile,
        'coach123',
        'content_123'
      );

      expect(result).toBe('https://storage.example.com/document.pdf');
      expect(mockUploadBytes).toHaveBeenCalled();
      expect(mockGetDownloadURL).toHaveBeenCalled();
    });

    it('should return null on upload error', async () => {
      const mockFile = createMockFile('document.pdf');
      mockUploadBytes.mockRejectedValue(new Error('Upload failed'));

      const result = await CustomContentService.uploadAttachment(
        mockFile,
        'coach123',
        'content_123'
      );

      expect(result).toBeNull();
    });
  });

  describe('getContent', () => {
    it('should retrieve content by ID', async () => {
      const content = createMockContent();
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('content_123', content) as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      const result = await CustomContentService.getContent('content_123');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.title).toBe('Test Content');
    });

    it('should increment view count', async () => {
      const content = createMockContent();
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('content_123', content) as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      await CustomContentService.getContent('content_123');

      expect(mockUpdateDoc).toHaveBeenCalledWith(expect.anything(), {
        'metadata.views': expect.anything(),
      });
    });

    it('should return null for non-existent content', async () => {
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('content_123', null, false) as any);

      const result = await CustomContentService.getContent('content_123');

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should handle fetch errors', async () => {
      mockGetDoc.mockRejectedValue(new Error('Firestore error'));

      const result = await CustomContentService.getContent('content_123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CONTENT_FETCH_ERROR');
    });
  });

  describe('getCoachContent', () => {
    it('should return cached content if available', async () => {
      const cachedContent = [createMockContent()];
      mockCacheGet.mockReturnValue(cachedContent);

      const result = await CustomContentService.getCoachContent('coach123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(cachedContent);
      expect(mockGetDocs).not.toHaveBeenCalled();
    });

    it('should fetch from Firestore when cache miss', async () => {
      const content = [createMockContent()];
      mockCacheGet.mockReturnValue(null);
      mockGetDocs.mockResolvedValue(createMockQuerySnapshot(content) as any);

      const result = await CustomContentService.getCoachContent('coach123');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockCacheSet).toHaveBeenCalled();
    });

    it('should return empty array when no content exists', async () => {
      mockCacheGet.mockReturnValue(null);
      mockGetDocs.mockResolvedValue(createMockQuerySnapshot([]) as any);

      const result = await CustomContentService.getCoachContent('coach123');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });

    it('should handle fetch errors', async () => {
      mockCacheGet.mockReturnValue(null);
      mockGetDocs.mockRejectedValue(new Error('Firestore error'));

      const result = await CustomContentService.getCoachContent('coach123');

      expect(result.success).toBe(false);
    });
  });

  describe('getPublicContent', () => {
    it('should return cached public content if available', async () => {
      const cachedContent = [createMockContent({ isPublic: true })];
      mockCacheGet.mockReturnValue(cachedContent);

      const result = await CustomContentService.getPublicContent();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(cachedContent);
      expect(mockGetDocs).not.toHaveBeenCalled();
    });

    it('should fetch public content from Firestore', async () => {
      const publicContent = [createMockContent({ isPublic: true, usageCount: 10 })];
      mockCacheGet.mockReturnValue(null);
      mockGetDocs.mockResolvedValue(createMockQuerySnapshot(publicContent) as any);

      const result = await CustomContentService.getPublicContent();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockCacheSet).toHaveBeenCalledWith('public_content', expect.anything(), 300000);
    });

    it('should handle fetch errors', async () => {
      mockCacheGet.mockReturnValue(null);
      mockGetDocs.mockRejectedValue(new Error('Firestore error'));

      const result = await CustomContentService.getPublicContent();

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CONTENT_FETCH_ERROR');
    });
  });

  describe('getContentByPillarLevel', () => {
    it('should fetch content by pillar only', async () => {
      const content = [createMockContent({ pillarId: 'pillar_1' })];
      mockGetDocs.mockResolvedValue(createMockQuerySnapshot(content) as any);

      const result = await CustomContentService.getContentByPillarLevel('pillar_1');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should fetch content by pillar and level', async () => {
      const content = [createMockContent({ pillarId: 'pillar_1', levelId: 'level_2' })];
      mockGetDocs.mockResolvedValue(createMockQuerySnapshot(content) as any);

      const result = await CustomContentService.getContentByPillarLevel('pillar_1', 'level_2');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should handle fetch errors', async () => {
      mockGetDocs.mockRejectedValue(new Error('Firestore error'));

      const result = await CustomContentService.getContentByPillarLevel('pillar_1');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CONTENT_FETCH_ERROR');
    });
  });

  describe('updateContent', () => {
    it('should update content successfully', async () => {
      const content = createMockContent();
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('content_123', content) as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      const result = await CustomContentService.updateContent(
        'content_123',
        { title: 'Updated Title' },
        'coach123'
      );

      expect(result.success).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalled();
      expect(mockCacheDelete).toHaveBeenCalledWith('coach_content_coach123');
    });

    it('should return error when content not found', async () => {
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('content_123', null, false) as any);

      const result = await CustomContentService.updateContent(
        'content_123',
        { title: 'Updated Title' },
        'coach123'
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CONTENT_NOT_FOUND');
    });

    it('should return error when user is not owner', async () => {
      const content = createMockContent({ createdBy: 'other_coach' });
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('content_123', content) as any);

      const result = await CustomContentService.updateContent(
        'content_123',
        { title: 'Updated Title' },
        'coach123'
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('UNAUTHORIZED');
    });

    it('should clear public cache when updating public content', async () => {
      const content = createMockContent({ isPublic: true });
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('content_123', content) as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      await CustomContentService.updateContent(
        'content_123',
        { title: 'Updated Title' },
        'coach123'
      );

      expect(mockCacheDelete).toHaveBeenCalledWith('public_content');
    });

    it('should handle update errors', async () => {
      const content = createMockContent();
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('content_123', content) as any);
      mockUpdateDoc.mockRejectedValue(new Error('Firestore error'));

      const result = await CustomContentService.updateContent(
        'content_123',
        { title: 'Updated Title' },
        'coach123'
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CONTENT_UPDATE_ERROR');
    });
  });

  describe('deleteContent', () => {
    it('should delete content successfully', async () => {
      const content = createMockContent();
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('content_123', content) as any);
      mockDeleteDoc.mockResolvedValue(undefined);

      const result = await CustomContentService.deleteContent('content_123', 'coach123');

      expect(result.success).toBe(true);
      expect(mockDeleteDoc).toHaveBeenCalled();
      expect(mockCacheDelete).toHaveBeenCalledWith('coach_content_coach123');
    });

    it('should delete attachments when present', async () => {
      const content = createMockContent({
        attachments: [
          'https://storage.example.com/file1.pdf',
          'https://storage.example.com/file2.pdf',
        ],
      });
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('content_123', content) as any);
      mockDeleteDoc.mockResolvedValue(undefined);
      mockDeleteObject.mockResolvedValue(undefined);

      await CustomContentService.deleteContent('content_123', 'coach123');

      expect(mockDeleteObject).toHaveBeenCalledTimes(2);
    });

    it('should return error when content not found', async () => {
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('content_123', null, false) as any);

      const result = await CustomContentService.deleteContent('content_123', 'coach123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CONTENT_NOT_FOUND');
    });

    it('should return error when user is not owner', async () => {
      const content = createMockContent({ createdBy: 'other_coach' });
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('content_123', content) as any);

      const result = await CustomContentService.deleteContent('content_123', 'coach123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('UNAUTHORIZED');
    });

    it('should handle delete errors', async () => {
      const content = createMockContent();
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('content_123', content) as any);
      mockDeleteDoc.mockRejectedValue(new Error('Firestore error'));

      const result = await CustomContentService.deleteContent('content_123', 'coach123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CONTENT_DELETE_ERROR');
    });
  });

  describe('cloneContent', () => {
    it('should clone public content successfully', async () => {
      const sourceContent = createMockContent({ isPublic: true });
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('source_123', sourceContent) as any);
      mockSetDoc.mockResolvedValue(undefined);
      mockUpdateDoc.mockResolvedValue(undefined);

      const result = await CustomContentService.cloneContent('source_123', 'new_coach');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.createdBy).toBe('new_coach');
      expect(result.data?.isPublic).toBe(false); // Cloned content should be private
      expect(result.data?.usageCount).toBe(0);
    });

    it('should allow cloning own content', async () => {
      const sourceContent = createMockContent({ isPublic: false });
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('source_123', sourceContent) as any);
      mockSetDoc.mockResolvedValue(undefined);

      const result = await CustomContentService.cloneContent('source_123', 'coach123');

      expect(result.success).toBe(true);
    });

    it('should increment source usage count when cloning from another coach', async () => {
      const sourceContent = createMockContent({ isPublic: true, createdBy: 'other_coach' });
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('source_123', sourceContent) as any);
      mockSetDoc.mockResolvedValue(undefined);
      mockUpdateDoc.mockResolvedValue(undefined);

      await CustomContentService.cloneContent('source_123', 'coach123');

      expect(mockUpdateDoc).toHaveBeenCalled();
    });

    it('should return error for non-existent content', async () => {
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('source_123', null, false) as any);

      const result = await CustomContentService.cloneContent('source_123', 'coach123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CONTENT_NOT_FOUND');
    });

    it('should return error when cloning private content from another coach', async () => {
      const sourceContent = createMockContent({ isPublic: false, createdBy: 'other_coach' });
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('source_123', sourceContent) as any);

      const result = await CustomContentService.cloneContent('source_123', 'coach123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('UNAUTHORIZED');
    });

    it('should handle clone errors', async () => {
      const sourceContent = createMockContent({ isPublic: true });
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('source_123', sourceContent) as any);
      mockSetDoc.mockRejectedValue(new Error('Firestore error'));

      const result = await CustomContentService.cloneContent('source_123', 'coach123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CONTENT_CLONE_ERROR');
    });
  });

  describe('markContentUsed', () => {
    it('should increment usage count', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      const result = await CustomContentService.markContentUsed('content_123');

      expect(result.success).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalledWith(expect.anything(), {
        usageCount: expect.anything(),
        'metadata.lastUsedAt': expect.anything(),
      });
    });

    it('should handle errors', async () => {
      mockUpdateDoc.mockRejectedValue(new Error('Firestore error'));

      const result = await CustomContentService.markContentUsed('content_123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CONTENT_UPDATE_ERROR');
    });
  });

  describe('markContentCompleted', () => {
    it('should increment completion count', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      const result = await CustomContentService.markContentCompleted('content_123');

      expect(result.success).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalledWith(expect.anything(), {
        'metadata.completions': expect.anything(),
      });
    });

    it('should handle errors', async () => {
      mockUpdateDoc.mockRejectedValue(new Error('Firestore error'));

      const result = await CustomContentService.markContentCompleted('content_123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CONTENT_UPDATE_ERROR');
    });
  });
});

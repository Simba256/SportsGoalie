import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomCurriculumService } from '@/lib/database/services/custom-curriculum.service';
import { Timestamp, getDoc, getDocs, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

// Get mocked Firebase Firestore functions from setup
const mockGetDoc = vi.mocked(getDoc);
const mockGetDocs = vi.mocked(getDocs);
const mockSetDoc = vi.mocked(setDoc);
const mockUpdateDoc = vi.mocked(updateDoc);
const mockDeleteDoc = vi.mocked(deleteDoc);

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

// Helper to create mock curriculum data
const createMockCurriculum = (overrides: any = {}) => ({
  id: 'curr_student123_123456789',
  studentId: 'student123',
  coachId: 'coach123',
  items: [
    {
      id: 'item_1',
      type: 'lesson' as const,
      contentId: 'content_1',
      pillarId: 'pillar_1',
      levelId: 'level_1',
      order: 0,
      status: 'unlocked' as const,
      assignedAt: createMockTimestamp(),
    },
    {
      id: 'item_2',
      type: 'quiz' as const,
      contentId: 'content_2',
      pillarId: 'pillar_1',
      levelId: 'level_1',
      order: 1,
      status: 'locked' as const,
      assignedAt: createMockTimestamp(),
    },
  ],
  createdAt: createMockTimestamp(),
  updatedAt: createMockTimestamp(),
  lastModifiedBy: 'coach123',
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

describe('CustomCurriculumService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCacheGet.mockReturnValue(null);
  });

  describe('createCurriculum', () => {
    it('should create a curriculum successfully', async () => {
      const inputData = {
        studentId: 'student123',
        coachId: 'coach123',
        items: [
          {
            type: 'lesson' as const,
            contentId: 'content_1',
            pillarId: 'pillar_1',
          },
        ],
      };

      mockSetDoc.mockResolvedValue(undefined);

      const result = await CustomCurriculumService.createCurriculum(inputData, 'coach123');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.studentId).toBe('student123');
      expect(result.data?.coachId).toBe('coach123');
      expect(result.data?.items).toHaveLength(1);
      expect(mockSetDoc).toHaveBeenCalled();
      expect(mockCacheDelete).toHaveBeenCalledWith('curriculum_student_student123');
    });

    it('should create curriculum with empty items when none provided', async () => {
      const inputData = {
        studentId: 'student123',
        coachId: 'coach123',
      };

      mockSetDoc.mockResolvedValue(undefined);

      const result = await CustomCurriculumService.createCurriculum(inputData, 'coach123');

      expect(result.success).toBe(true);
      expect(result.data?.items).toHaveLength(0);
    });

    it('should handle creation errors', async () => {
      const inputData = {
        studentId: 'student123',
        coachId: 'coach123',
      };

      mockSetDoc.mockRejectedValue(new Error('Firestore error'));

      const result = await CustomCurriculumService.createCurriculum(inputData, 'coach123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CURRICULUM_CREATE_ERROR');
    });
  });

  describe('getStudentCurriculum', () => {
    it('should return cached curriculum if available', async () => {
      const cachedCurriculum = createMockCurriculum();
      mockCacheGet.mockReturnValue(cachedCurriculum);

      const result = await CustomCurriculumService.getStudentCurriculum('student123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(cachedCurriculum);
      expect(mockGetDocs).not.toHaveBeenCalled();
    });

    it('should fetch from Firestore when cache miss', async () => {
      const curriculum = createMockCurriculum();
      mockCacheGet.mockReturnValue(null);
      mockGetDocs.mockResolvedValue(createMockQuerySnapshot([curriculum]) as any);

      const result = await CustomCurriculumService.getStudentCurriculum('student123');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockCacheSet).toHaveBeenCalled();
    });

    it('should return null for non-existent curriculum', async () => {
      mockCacheGet.mockReturnValue(null);
      mockGetDocs.mockResolvedValue(createMockQuerySnapshot([]) as any);

      const result = await CustomCurriculumService.getStudentCurriculum('nonexistent');

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should handle fetch errors', async () => {
      mockCacheGet.mockReturnValue(null);
      mockGetDocs.mockRejectedValue(new Error('Firestore error'));

      const result = await CustomCurriculumService.getStudentCurriculum('student123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CURRICULUM_FETCH_ERROR');
    });
  });

  describe('getCurriculum', () => {
    it('should retrieve curriculum by ID', async () => {
      const curriculum = createMockCurriculum();
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('curr_123', curriculum) as any);

      const result = await CustomCurriculumService.getCurriculum('curr_123');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should return null for non-existent curriculum', async () => {
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('curr_123', null, false) as any);

      const result = await CustomCurriculumService.getCurriculum('curr_123');

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should handle fetch errors', async () => {
      mockGetDoc.mockRejectedValue(new Error('Firestore error'));

      const result = await CustomCurriculumService.getCurriculum('curr_123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CURRICULUM_FETCH_ERROR');
    });
  });

  describe('getCoachCurricula', () => {
    it('should retrieve all curricula for a coach', async () => {
      const curricula = [
        createMockCurriculum({ id: 'curr_1' }),
        createMockCurriculum({ id: 'curr_2', studentId: 'student456' }),
      ];
      mockGetDocs.mockResolvedValue(createMockQuerySnapshot(curricula) as any);

      const result = await CustomCurriculumService.getCoachCurricula('coach123');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should return empty array when no curricula exist', async () => {
      mockGetDocs.mockResolvedValue(createMockQuerySnapshot([]) as any);

      const result = await CustomCurriculumService.getCoachCurricula('coach123');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });

    it('should handle fetch errors', async () => {
      mockGetDocs.mockRejectedValue(new Error('Firestore error'));

      const result = await CustomCurriculumService.getCoachCurricula('coach123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CURRICULUM_FETCH_ERROR');
    });
  });

  describe('addItem', () => {
    it('should add an item to curriculum', async () => {
      const curriculum = createMockCurriculum();
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('curr_123', curriculum) as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      const itemData = {
        type: 'lesson' as const,
        contentId: 'content_new',
        pillarId: 'pillar_1',
        levelId: 'level_1',
      };

      const result = await CustomCurriculumService.addItem('curr_123', itemData, 'coach123');

      expect(result.success).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalled();
      expect(mockCacheDelete).toHaveBeenCalledWith('curriculum_student_student123');
    });

    it('should auto-set order when not provided', async () => {
      const curriculum = createMockCurriculum();
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('curr_123', curriculum) as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      const itemData = {
        type: 'lesson' as const,
        contentId: 'content_new',
        pillarId: 'pillar_1',
      };

      const result = await CustomCurriculumService.addItem('curr_123', itemData, 'coach123');

      expect(result.success).toBe(true);
      // Item order should be set to length of existing items (2)
      expect(mockUpdateDoc).toHaveBeenCalled();
    });

    it('should return error when curriculum not found', async () => {
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('curr_123', null, false) as any);

      const itemData = {
        type: 'lesson' as const,
        contentId: 'content_new',
        pillarId: 'pillar_1',
      };

      const result = await CustomCurriculumService.addItem('curr_123', itemData, 'coach123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CURRICULUM_NOT_FOUND');
    });

    it('should handle add errors', async () => {
      const curriculum = createMockCurriculum();
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('curr_123', curriculum) as any);
      mockUpdateDoc.mockRejectedValue(new Error('Firestore error'));

      const itemData = {
        type: 'lesson' as const,
        contentId: 'content_new',
        pillarId: 'pillar_1',
      };

      const result = await CustomCurriculumService.addItem('curr_123', itemData, 'coach123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CURRICULUM_UPDATE_ERROR');
    });
  });

  describe('removeItem', () => {
    it('should remove an item from curriculum', async () => {
      const curriculum = createMockCurriculum();
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('curr_123', curriculum) as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      const result = await CustomCurriculumService.removeItem('curr_123', 'item_1', 'coach123');

      expect(result.success).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalled();
      expect(mockCacheDelete).toHaveBeenCalledWith('curriculum_student_student123');
    });

    it('should return error when curriculum not found', async () => {
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('curr_123', null, false) as any);

      const result = await CustomCurriculumService.removeItem('curr_123', 'item_1', 'coach123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CURRICULUM_NOT_FOUND');
    });

    it('should handle remove errors', async () => {
      const curriculum = createMockCurriculum();
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('curr_123', curriculum) as any);
      mockUpdateDoc.mockRejectedValue(new Error('Firestore error'));

      const result = await CustomCurriculumService.removeItem('curr_123', 'item_1', 'coach123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CURRICULUM_UPDATE_ERROR');
    });
  });

  describe('reorderItems', () => {
    it('should reorder items successfully', async () => {
      const curriculum = createMockCurriculum();
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('curr_123', curriculum) as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      const result = await CustomCurriculumService.reorderItems(
        'curr_123',
        ['item_2', 'item_1'],
        'coach123'
      );

      expect(result.success).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalled();
      expect(mockCacheDelete).toHaveBeenCalledWith('curriculum_student_student123');
    });

    it('should return error when curriculum not found', async () => {
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('curr_123', null, false) as any);

      const result = await CustomCurriculumService.reorderItems(
        'curr_123',
        ['item_2', 'item_1'],
        'coach123'
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CURRICULUM_NOT_FOUND');
    });

    it('should handle error when item not found in curriculum', async () => {
      const curriculum = createMockCurriculum();
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('curr_123', curriculum) as any);

      const result = await CustomCurriculumService.reorderItems(
        'curr_123',
        ['item_nonexistent', 'item_1'],
        'coach123'
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CURRICULUM_UPDATE_ERROR');
    });
  });

  describe('unlockItem', () => {
    it('should unlock a specific item', async () => {
      const curriculum = createMockCurriculum();
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('curr_123', curriculum) as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      const result = await CustomCurriculumService.unlockItem('curr_123', 'item_2', 'coach123');

      expect(result.success).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalled();
      expect(mockCacheDelete).toHaveBeenCalledWith('curriculum_student_student123');
    });

    it('should return error when curriculum not found', async () => {
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('curr_123', null, false) as any);

      const result = await CustomCurriculumService.unlockItem('curr_123', 'item_2', 'coach123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CURRICULUM_NOT_FOUND');
    });

    it('should return error when item not found', async () => {
      const curriculum = createMockCurriculum();
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('curr_123', curriculum) as any);

      const result = await CustomCurriculumService.unlockItem(
        'curr_123',
        'item_nonexistent',
        'coach123'
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('ITEM_NOT_FOUND');
    });
  });

  describe('unlockAllItems', () => {
    it('should unlock all items in curriculum', async () => {
      const curriculum = createMockCurriculum();
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('curr_123', curriculum) as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      const result = await CustomCurriculumService.unlockAllItems('curr_123', 'coach123');

      expect(result.success).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalled();
      expect(mockCacheDelete).toHaveBeenCalledWith('curriculum_student_student123');
    });

    it('should return error when curriculum not found', async () => {
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('curr_123', null, false) as any);

      const result = await CustomCurriculumService.unlockAllItems('curr_123', 'coach123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CURRICULUM_NOT_FOUND');
    });

    it('should handle unlock all errors', async () => {
      const curriculum = createMockCurriculum();
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('curr_123', curriculum) as any);
      mockUpdateDoc.mockRejectedValue(new Error('Firestore error'));

      const result = await CustomCurriculumService.unlockAllItems('curr_123', 'coach123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CURRICULUM_UPDATE_ERROR');
    });
  });

  describe('markItemComplete', () => {
    it('should mark an item as completed', async () => {
      const curriculum = createMockCurriculum();
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('curr_123', curriculum) as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      const result = await CustomCurriculumService.markItemComplete(
        'curr_123',
        'item_1',
        'student123'
      );

      expect(result.success).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalled();
      expect(mockCacheDelete).toHaveBeenCalledWith('curriculum_student_student123');
    });

    it('should return error when curriculum not found', async () => {
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('curr_123', null, false) as any);

      const result = await CustomCurriculumService.markItemComplete(
        'curr_123',
        'item_1',
        'student123'
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CURRICULUM_NOT_FOUND');
    });

    it('should return error when item not found', async () => {
      const curriculum = createMockCurriculum();
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('curr_123', curriculum) as any);

      const result = await CustomCurriculumService.markItemComplete(
        'curr_123',
        'item_nonexistent',
        'student123'
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('ITEM_NOT_FOUND');
    });
  });

  describe('getNextItem', () => {
    it('should return next unlocked incomplete item', async () => {
      const curriculum = createMockCurriculum();
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('curr_123', curriculum) as any);

      const result = await CustomCurriculumService.getNextItem('curr_123');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe('item_1'); // First unlocked item
    });

    it('should return null when curriculum not found', async () => {
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('curr_123', null, false) as any);

      const result = await CustomCurriculumService.getNextItem('curr_123');

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should return null when all items are completed', async () => {
      const curriculum = createMockCurriculum({
        items: [
          {
            id: 'item_1',
            status: 'completed',
            completedAt: createMockTimestamp(),
            order: 0,
          },
          {
            id: 'item_2',
            status: 'completed',
            completedAt: createMockTimestamp(),
            order: 1,
          },
        ],
      });
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('curr_123', curriculum) as any);

      const result = await CustomCurriculumService.getNextItem('curr_123');

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should handle fetch errors', async () => {
      mockGetDoc.mockRejectedValue(new Error('Firestore error'));

      const result = await CustomCurriculumService.getNextItem('curr_123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CURRICULUM_FETCH_ERROR');
    });
  });

  describe('getCurriculumProgress', () => {
    it('should calculate progress correctly', async () => {
      const curriculum = createMockCurriculum({
        items: [
          {
            id: 'item_1',
            status: 'completed',
            completedAt: createMockTimestamp(),
            order: 0,
          },
          {
            id: 'item_2',
            status: 'unlocked',
            order: 1,
          },
          {
            id: 'item_3',
            status: 'locked',
            order: 2,
          },
          {
            id: 'item_4',
            status: 'in_progress',
            order: 3,
          },
        ],
      });
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('curr_123', curriculum) as any);

      const result = await CustomCurriculumService.getCurriculumProgress('curr_123');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.totalItems).toBe(4);
      expect(result.data?.completedItems).toBe(1);
      expect(result.data?.lockedItems).toBe(1);
      expect(result.data?.inProgressItems).toBe(1);
      expect(result.data?.progressPercentage).toBe(25);
    });

    it('should return null when curriculum not found', async () => {
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('curr_123', null, false) as any);

      const result = await CustomCurriculumService.getCurriculumProgress('curr_123');

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should return 0% progress for empty curriculum', async () => {
      const curriculum = createMockCurriculum({ items: [] });
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('curr_123', curriculum) as any);

      const result = await CustomCurriculumService.getCurriculumProgress('curr_123');

      expect(result.success).toBe(true);
      expect(result.data?.progressPercentage).toBe(0);
    });

    it('should handle fetch errors', async () => {
      mockGetDoc.mockRejectedValue(new Error('Firestore error'));

      const result = await CustomCurriculumService.getCurriculumProgress('curr_123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CURRICULUM_FETCH_ERROR');
    });
  });

  describe('deleteCurriculum', () => {
    it('should delete curriculum successfully', async () => {
      const curriculum = createMockCurriculum();
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('curr_123', curriculum) as any);
      mockDeleteDoc.mockResolvedValue(undefined);

      const result = await CustomCurriculumService.deleteCurriculum('curr_123');

      expect(result.success).toBe(true);
      expect(mockDeleteDoc).toHaveBeenCalled();
      expect(mockCacheDelete).toHaveBeenCalledWith('curriculum_student_student123');
    });

    it('should return error when curriculum not found', async () => {
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('curr_123', null, false) as any);

      const result = await CustomCurriculumService.deleteCurriculum('curr_123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CURRICULUM_NOT_FOUND');
    });

    it('should handle delete errors', async () => {
      const curriculum = createMockCurriculum();
      mockGetDoc.mockResolvedValue(createMockFirestoreDoc('curr_123', curriculum) as any);
      mockDeleteDoc.mockRejectedValue(new Error('Firestore error'));

      const result = await CustomCurriculumService.deleteCurriculum('curr_123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CURRICULUM_DELETE_ERROR');
    });
  });
});

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  DocumentSnapshot,
  QuerySnapshot,
  Timestamp,
  serverTimestamp,
  writeBatch,
  increment,
  arrayUnion,
  arrayRemove,
  runTransaction,
  enableNetwork,
  disableNetwork,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { logger } from '../utils/logger';
import {
  ApiResponse,
  PaginatedResponse,
  QueryOptions,
  RealtimeListener,
  RealtimeUpdate,
  CacheEntry,
  CacheOptions,
  ErrorDetails,
} from '@/types';

// Enhanced error handling
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Enhanced cache implementation with LRU eviction
class EnhancedCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private accessOrder = new Map<string, number>();
  private accessCounter = 0;
  private readonly maxSize: number;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.timestamp + entry.ttl) {
      this.delete(key);
      return null;
    }

    // Update access order and hit count
    entry.hits++;
    this.accessOrder.set(key, this.accessCounter++);

    return entry.data;
  }

  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const ttl = options.ttl || 300000; // 5 minutes default

    // Evict if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 1,
    });
    this.accessOrder.set(key, this.accessCounter++);
  }

  delete(key: string): void {
    this.cache.delete(key);
    this.accessOrder.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder.clear();
    this.accessCounter = 0;
  }

  private evictLRU(): void {
    let oldestKey = '';
    let oldestAccess = Infinity;

    this.accessOrder.forEach((access, key) => {
      if (access < oldestAccess) {
        oldestAccess = access;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  // Cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate(),
    };
  }

  private calculateHitRate(): number {
    const entries = Array.from(this.cache.values());
    if (entries.length === 0) return 0;

    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0);
    return totalHits / entries.length;
  }
}

const cache = new EnhancedCache();

// Circuit breaker for handling failures
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private readonly threshold: number = 5,
    private readonly timeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime < this.timeout) {
        throw new DatabaseError(
          'Circuit breaker is open',
          'CIRCUIT_BREAKER_OPEN',
          undefined,
          true
        );
      }
      this.state = 'half-open';
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'open';
    }
  }
}

// Enhanced base database service
export class BaseDatabaseService {
  private circuitBreaker = new CircuitBreaker();
  private retryDelays = [1000, 2000, 4000]; // exponential backoff

  // Enhanced CRUD operations with retry logic
  async create<T>(
    collectionName: string,
    data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>,
    options: { validateSchema?: boolean; retries?: number } = {}
  ): Promise<ApiResponse<{ id: string }>> {
    return this.executeWithRetry(async () => {
      const docData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, collectionName), docData);

      // Invalidate related cache
      this.invalidateCache(`${collectionName}:*`);

      return {
        success: true,
        data: { id: docRef.id },
        message: 'Document created successfully',
        timestamp: new Date(),
      };
    }, options.retries);
  }

  /**
   * Creates a document with a specific ID (useful for user progress where ID should match userId)
   */
  async createWithId<T>(
    collectionName: string,
    id: string,
    data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>,
    options: { validateSchema?: boolean; retries?: number } = {}
  ): Promise<ApiResponse<{ id: string }>> {
    return this.executeWithRetry(async () => {
      const docData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = doc(db, collectionName, id);
      await setDoc(docRef, docData);

      // Invalidate related cache
      this.invalidateCache(`${collectionName}:*`);

      return {
        success: true,
        data: { id },
        message: 'Document created successfully',
        timestamp: new Date(),
      };
    }, options.retries);
  }

  async getById<T>(
    collectionName: string,
    id: string,
    options: {
      useCache?: boolean;
      cacheOptions?: CacheOptions;
      includeMetadata?: boolean;
    } = {}
  ): Promise<ApiResponse<T | null>> {
    return this.executeWithRetry(async () => {
      const { useCache = true, cacheOptions, includeMetadata = false } = options;
      const cacheKey = `${collectionName}:${id}`;

      if (useCache) {
        const cached = cache.get<T>(cacheKey);
        if (cached) {
          return {
            success: true,
            data: cached,
            timestamp: new Date(),
          };
        }
      }

      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return {
          success: true,
          data: null,
          message: 'Document not found',
          timestamp: new Date(),
        };
      }

      let data = { id: docSnap.id, ...docSnap.data() } as T;

      if (includeMetadata) {
        const metadata = docSnap.metadata;
        (data as any)._metadata = {
          hasPendingWrites: metadata.hasPendingWrites,
          fromCache: metadata.fromCache,
        };
      }

      if (useCache) {
        cache.set(cacheKey, data, cacheOptions);
      }

      return {
        success: true,
        data,
        timestamp: new Date(),
      };
    });
  }

  async update<T>(
    collectionName: string,
    id: string,
    data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>,
    options: { merge?: boolean; validateSchema?: boolean } = {}
  ): Promise<ApiResponse<void>> {
    return this.executeWithRetry(async () => {
      const docRef = doc(db, collectionName, id);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(docRef, updateData);

      // Invalidate cache
      this.invalidateCache(`${collectionName}:${id}`);
      this.invalidateCache(`${collectionName}:*`);

      return {
        success: true,
        message: 'Document updated successfully',
        timestamp: new Date(),
      };
    });
  }

  async delete(
    collectionName: string,
    id: string,
    options: { softDelete?: boolean } = {}
  ): Promise<ApiResponse<void>> {
    return this.executeWithRetry(async () => {
      const docRef = doc(db, collectionName, id);

      if (options.softDelete) {
        await updateDoc(docRef, {
          isDeleted: true,
          deletedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await deleteDoc(docRef);
      }

      // Invalidate cache
      this.invalidateCache(`${collectionName}:${id}`);
      this.invalidateCache(`${collectionName}:*`);

      return {
        success: true,
        message: 'Document deleted successfully',
        timestamp: new Date(),
      };
    });
  }

  async query<T>(
    collectionName: string,
    options: QueryOptions & {
      useCache?: boolean;
      cacheOptions?: CacheOptions;
      includeCount?: boolean;
    } = {}
  ): Promise<ApiResponse<PaginatedResponse<T>>> {
    return this.executeWithRetry(async () => {
      const {
        useCache = true,
        cacheOptions,
        includeCount = false,
        ...queryOptions
      } = options;

      const cacheKey = `${collectionName}:query:${JSON.stringify(queryOptions)}`;

      if (useCache) {
        const cached = cache.get<PaginatedResponse<T>>(cacheKey);
        if (cached) {
          return {
            success: true,
            data: cached,
            timestamp: new Date(),
          };
        }
      }

      let q: any = collection(db, collectionName);

      // Apply where clauses
      if (queryOptions.where) {
        queryOptions.where.forEach((condition) => {
          q = query(q, where(condition.field, condition.operator, condition.value));
        });
      }

      // Apply ordering
      if (queryOptions.orderBy) {
        queryOptions.orderBy.forEach((order) => {
          q = query(q, orderBy(order.field, order.direction));
        });
      }

      // Apply pagination
      if (queryOptions.cursor) {
        // Cursor-based pagination
        const lastDoc = await getDoc(doc(db, collectionName, queryOptions.cursor));
        if (lastDoc.exists()) {
          q = query(q, startAfter(lastDoc));
        }
      }

      if (queryOptions.limit) {
        q = query(q, limit(queryOptions.limit));
      }

      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })) as T[];

      // Calculate total count if requested (expensive operation)
      let total = items.length;
      if (includeCount && !queryOptions.limit) {
        // If no limit, current items length is the total
        total = items.length;
      } else if (includeCount && queryOptions.limit) {
        // Need separate query for total count
        let countQuery: any = collection(db, collectionName);
        if (queryOptions.where) {
          queryOptions.where.forEach((condition) => {
            countQuery = query(countQuery, where(condition.field, condition.operator, condition.value));
          });
        }
        const countSnapshot = await getDocs(countQuery);
        total = countSnapshot.size;
      }

      const limit_value = queryOptions.limit || items.length;
      const totalPages = Math.ceil(total / limit_value);
      const currentPage = Math.floor((queryOptions.offset || 0) / limit_value) + 1;

      const result: PaginatedResponse<T> = {
        items,
        total,
        page: currentPage,
        limit: limit_value,
        hasMore: items.length === limit_value,
        totalPages,
      };

      if (useCache) {
        cache.set(cacheKey, result, cacheOptions);
      }

      return {
        success: true,
        data: result,
        timestamp: new Date(),
      };
    });
  }

  // Enhanced real-time subscriptions
  subscribeToDocument<T>(
    collectionName: string,
    id: string,
    callback: RealtimeListener<T>,
    options: { includeMetadataChanges?: boolean } = {}
  ): () => void {
    const docRef = doc(db, collectionName, id);

    return onSnapshot(
      docRef,
      { includeMetadataChanges: options.includeMetadataChanges || false },
      (doc) => {
        if (doc.exists()) {
          const data = { id: doc.id, ...doc.data() } as T;
          callback({
            type: 'modified',
            data,
            timestamp: new Date(),
          });

          // Update cache
          cache.set(`${collectionName}:${id}`, data);
        }
      },
      (error) => {
        logger.error(`Error in document subscription for ${collectionName}:${id}`, 'BaseDatabaseService', error);
        callback({
          type: 'removed',
          data: {} as T,
          timestamp: new Date(),
        });
      }
    );
  }

  subscribeToCollection<T>(
    collectionName: string,
    options: QueryOptions & { includeMetadataChanges?: boolean } = {},
    callback: RealtimeListener<T[]>
  ): () => void {
    let q: any = collection(db, collectionName);

    // Apply where clauses
    if (options.where) {
      options.where.forEach((condition) => {
        q = query(q, where(condition.field, condition.operator, condition.value));
      });
    }

    // Apply ordering
    if (options.orderBy) {
      options.orderBy.forEach((order) => {
        q = query(q, orderBy(order.field, order.direction));
      });
    }

    // Apply limit
    if (options.limit) {
      q = query(q, limit(options.limit));
    }

    return onSnapshot(
      q,
      { includeMetadataChanges: options.includeMetadataChanges || false },
      (querySnapshot: any) => {
        const items = querySnapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data()
        })) as T[];

        callback({
          type: 'modified',
          data: items,
          timestamp: new Date(),
        });

        // Update cache for individual items
        items.forEach(item => {
          cache.set(`${collectionName}:${(item as any).id}`, item);
        });
      },
      (error: any) => {
        logger.error(`Error in collection subscription for ${collectionName}`, 'BaseDatabaseService', error);
      }
    );
  }

  // Enhanced batch operations with transactions
  async batchWrite(
    operations: Array<{
      type: 'create' | 'update' | 'delete';
      collection: string;
      id?: string;
      data?: unknown;
    }>,
    options: { useTransaction?: boolean } = {}
  ): Promise<ApiResponse<void>> {
    return this.executeWithRetry(async () => {
      if (options.useTransaction) {
        return this.transactionWrite(operations);
      }

      const batch = writeBatch(db);

      operations.forEach((operation) => {
        const docRef = operation.id
          ? doc(db, operation.collection, operation.id)
          : doc(collection(db, operation.collection));

        switch (operation.type) {
          case 'create':
            batch.set(docRef, {
              ...(operation.data as object),
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            break;
          case 'update':
            batch.update(docRef, {
              ...(operation.data as object),
              updatedAt: serverTimestamp(),
            });
            break;
          case 'delete':
            batch.delete(docRef);
            break;
        }
      });

      await batch.commit();

      // Invalidate related cache
      const collections = [...new Set(operations.map(op => op.collection))];
      collections.forEach(col => this.invalidateCache(`${col}:*`));

      return {
        success: true,
        message: 'Batch operation completed successfully',
        timestamp: new Date(),
      };
    });
  }

  // Transaction-based write operations
  private async transactionWrite(
    operations: Array<{
      type: 'create' | 'update' | 'delete';
      collection: string;
      id?: string;
      data?: unknown;
    }>
  ): Promise<ApiResponse<void>> {
    return runTransaction(db, async (transaction) => {
      operations.forEach((operation) => {
        const docRef = operation.id
          ? doc(db, operation.collection, operation.id)
          : doc(collection(db, operation.collection));

        switch (operation.type) {
          case 'create':
            transaction.set(docRef, {
              ...(operation.data as object),
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            break;
          case 'update':
            transaction.update(docRef, {
              ...(operation.data as object),
              updatedAt: serverTimestamp(),
            });
            break;
          case 'delete':
            transaction.delete(docRef);
            break;
        }
      });

      return {
        success: true,
        message: 'Transaction completed successfully',
        timestamp: new Date(),
      };
    });
  }

  // Atomic field operations
  async incrementField(
    collectionName: string,
    id: string,
    field: string,
    value: number = 1
  ): Promise<ApiResponse<void>> {
    return this.executeWithRetry(async () => {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        [field]: increment(value),
        updatedAt: serverTimestamp(),
      });

      this.invalidateCache(`${collectionName}:${id}`);

      return {
        success: true,
        message: 'Field incremented successfully',
        timestamp: new Date(),
      };
    });
  }

  async arrayOperations(
    collectionName: string,
    id: string,
    operations: Array<{
      field: string;
      operation: 'add' | 'remove';
      value: unknown;
    }>
  ): Promise<ApiResponse<void>> {
    return this.executeWithRetry(async () => {
      const docRef = doc(db, collectionName, id);
      const updateData: any = { updatedAt: serverTimestamp() };

      operations.forEach(({ field, operation, value }) => {
        updateData[field] = operation === 'add' ? arrayUnion(value) : arrayRemove(value);
      });

      await updateDoc(docRef, updateData);
      this.invalidateCache(`${collectionName}:${id}`);

      return {
        success: true,
        message: 'Array operations completed successfully',
        timestamp: new Date(),
      };
    });
  }

  // Network state management
  async enableOfflineSupport(): Promise<void> {
    await enableNetwork(db);
  }

  async disableOfflineSupport(): Promise<void> {
    await disableNetwork(db);
  }

  // Cache management
  private invalidateCache(pattern: string): void {
    if (pattern.includes('*')) {
      cache.clear(); // For now, clear all cache when using patterns
    } else {
      cache.delete(pattern);
    }
  }

  clearCache(): void {
    cache.clear();
  }

  getCacheStats() {
    return cache.getStats();
  }

  // Helper methods
  async exists(collectionName: string, id: string): Promise<boolean> {
    try {
      const result = await this.getById(collectionName, id, { useCache: false });
      return result.data !== null;
    } catch {
      return false;
    }
  }

  // Legacy helper methods for backward compatibility
  protected async documentExists(collectionName: string, id: string): Promise<boolean> {
    return this.exists(collectionName, id);
  }

  protected async getDocument<T>(collectionName: string, id: string): Promise<T | null> {
    const result = await this.getById<T>(collectionName, id);
    return result.data || null;
  }

  protected async addDocument<T = any>(
    collectionName: string,
    data: any
  ): Promise<string> {
    // Remove undefined fields before passing to Firestore
    const sanitizedData = this.removeUndefinedFields(data);

    const result = await this.create<T>(collectionName, sanitizedData);
    if (!result.success || !result.data) {
      throw new DatabaseError(
        result.error?.message || 'Failed to create document',
        result.error?.code || 'CREATE_FAILED'
      );
    }
    return result.data.id;
  }

  // Helper to remove undefined fields recursively
  private removeUndefinedFields(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.removeUndefinedFields(item));
    }

    const cleaned: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && obj[key] !== undefined) {
        cleaned[key] = this.removeUndefinedFields(obj[key]);
      }
    }
    return cleaned;
  }

  async count(
    collectionName: string,
    options: QueryOptions = {}
  ): Promise<number> {
    try {
      const result = await this.query(collectionName, { ...options, includeCount: true });
      return result.data?.total || 0;
    } catch {
      return 0;
    }
  }

  // Retry logic with exponential backoff
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    return this.circuitBreaker.execute(async () => {
      let lastError: Error;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await operation();
        } catch (error) {
          lastError = error as Error;

          // Don't retry on certain errors
          if (this.isNonRetryableError(error)) {
            throw error;
          }

          if (attempt < maxRetries) {
            const delay = this.retryDelays[Math.min(attempt, this.retryDelays.length - 1)];
            await this.sleep(delay);
          }
        }
      }

      throw new DatabaseError(
        `Operation failed after ${maxRetries + 1} attempts: ${lastError.message}`,
        'MAX_RETRIES_EXCEEDED',
        lastError,
        false
      );
    });
  }

  private isNonRetryableError(error: any): boolean {
    const nonRetryableCodes = [
      'permission-denied',
      'not-found',
      'invalid-argument',
      'already-exists',
    ];

    return nonRetryableCodes.includes(error?.code);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Health check
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    latency: number;
    cacheStats: any;
  }> {
    const startTime = Date.now();

    try {
      // Simple read operation to test connectivity
      await getDocs(query(collection(db, 'health'), limit(1)));

      const latency = Date.now() - startTime;

      return {
        status: 'healthy',
        latency,
        cacheStats: this.getCacheStats(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - startTime,
        cacheStats: this.getCacheStats(),
      };
    }
  }
}

// Export singleton instance
export const baseDatabaseService = new BaseDatabaseService();
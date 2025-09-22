/**
 * Simple client-side cache service for improving performance
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class CacheService {
  private cache = new Map<string, CacheItem<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Set an item in the cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };
    this.cache.set(key, item);
  }

  /**
   * Get an item from the cache
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete an item from the cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cached items
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired items
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    totalItems: number;
    expiredItems: number;
    cacheHitRate: number;
  } {
    const totalItems = this.cache.size;
    const now = Date.now();
    let expiredItems = 0;

    for (const item of this.cache.values()) {
      if (now - item.timestamp > item.ttl) {
        expiredItems++;
      }
    }

    return {
      totalItems,
      expiredItems,
      cacheHitRate: 0, // Would need hit/miss tracking for this
    };
  }

  /**
   * Get cache size in memory (approximate)
   */
  getSize(): string {
    const size = new Blob([JSON.stringify(Array.from(this.cache.entries()))]).size;
    return this.formatBytes(size);
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export singleton instance
export const cacheService = new CacheService();

// Cache key builders for common patterns
export const CacheKeys = {
  // Sports
  allSports: () => 'sports:all',
  sport: (id: string) => `sport:${id}`,
  sportSkills: (sportId: string) => `sport:${sportId}:skills`,

  // Skills
  skill: (id: string) => `skill:${id}`,
  skillPrerequisites: (id: string) => `skill:${id}:prerequisites`,

  // Search
  sportsSearch: (query: string, filters: string) => `search:sports:${query}:${filters}`,

  // User data
  userProgress: (userId: string) => `user:${userId}:progress`,
  userSportProgress: (userId: string, sportId: string) => `user:${userId}:sport:${sportId}:progress`,

  // Static data
  categories: () => 'categories',
  difficulties: () => 'difficulties',
} as const;

// Cache TTL constants (in milliseconds)
export const CacheTTL = {
  SHORT: 1 * 60 * 1000,    // 1 minute
  MEDIUM: 5 * 60 * 1000,   // 5 minutes
  LONG: 15 * 60 * 1000,    // 15 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
} as const;

// Utility function for cache-or-fetch pattern
export async function cacheOrFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Try to get from cache first
  const cached = cacheService.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Not in cache, fetch the data
  const data = await fetchFn();

  // Store in cache
  cacheService.set(key, data, ttl);

  return data;
}

// Auto-cleanup expired items every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    cacheService.clearExpired();
  }, 10 * 60 * 1000);
}
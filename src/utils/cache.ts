/**
 * Caching Utility for Cloudflare Workers
 * Provides response caching strategy for performance optimization
 */

export interface CacheOptions {
  ttl: number; // Time to live in seconds
  key: string;
}

/**
 * Cache Manager using Cloudflare KV Storage
 * Falls back to in-memory cache if KV is not available
 */
export class CacheManager {
  private memoryCache: Map<string, { value: unknown; expiresAt: number }> = new Map();
  private kv?: {
    get(key: string, type?: 'json'): Promise<unknown | null>;
    put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
    delete(key: string): Promise<void>;
  } | null;

  constructor(kvBinding?: { get(key: string, type?: 'json'): Promise<unknown | null>; put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>; delete(key: string): Promise<void>; } | null) {
    this.kv = kvBinding ?? null;
  }

  /**
   * Generate cache key from endpoint and parameters
   */
  static generateKey(endpoint: string, params?: Record<string, unknown>): string {
    if (!params || Object.keys(params).length === 0) {
      return `cache:${endpoint}`;
    }

    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${String((params as Record<string, unknown>)[key])}`)
      .join('&');

    return `cache:${endpoint}?${sortedParams}`;
  }

  /**
   * Get value from cache
   */
  async get<T = unknown>(key: string): Promise<T | null> {
    // Check memory cache first
    const memCached = this.memoryCache.get(key);
    if (memCached && memCached.expiresAt > Date.now()) {
      return memCached.value as T;
    }

    // Try KV cache if available
    if (this.kv) {
      try {
        const kvCached = await this.kv.get(key, 'json');
        if (kvCached) {
          return kvCached as T;
        }
      } catch (error) {
        console.error('KV cache read error:', error);
      }
    }

    // Clean up expired memory cache entry
    this.memoryCache.delete(key);
    return null;
  }

  /**
   * Set value in cache
   */
  async set<T = unknown>(key: string, value: T, options: CacheOptions): Promise<void> {
    const expiresAt = Date.now() + options.ttl * 1000;

    // Always cache in memory
    this.memoryCache.set(key, { value, expiresAt });

    // Also cache in KV if available
    if (this.kv) {
      try {
        await this.kv.put(key, JSON.stringify(value), {
          expirationTtl: options.ttl,
        });
      } catch (error) {
        console.error('KV cache write error:', error);
      }
    }
  }

  /**
   * Delete cache entry
   */
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);

    if (this.kv) {
      try {
        await this.kv.delete(key);
      } catch (error) {
        console.error('KV cache delete error:', error);
      }
    }
  }

  /**
   * Clear all cache entries matching a pattern
   */
  async clearPattern(pattern: string): Promise<void> {
    // Clear memory cache
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
      }
    }

    // KV doesn't support pattern deletion, so we skip it
    // In production, you might want to maintain a set of keys
  }

  /**
   * Get cache statistics
   */
  getStats(): { memoryEntries: number; expiringMostSoon: string | null } {
    let expiringMostSoon: string | null = null;
    let earliestExpiry = Infinity;

    for (const [key, cached] of this.memoryCache.entries()) {
      if (cached.expiresAt < earliestExpiry) {
        earliestExpiry = cached.expiresAt;
        expiringMostSoon = key;
      }
    }

    return {
      memoryEntries: this.memoryCache.size,
      expiringMostSoon,
    };
  }
}

/**
 * Cache invalidation helper
 */
export class CacheInvalidator {
  private cache: CacheManager;

  constructor(cache: CacheManager) {
    this.cache = cache;
  }

  /**
   * Invalidate product-related caches
   */
  async invalidateProducts(productId?: number): Promise<void> {
    if (productId) {
      await this.cache.delete(CacheManager.generateKey(`/api/products/${productId}`));
    }
    await this.cache.clearPattern('products');
  }

  /**
   * Invalidate category-related caches
   */
  async invalidateCategories(categoryId?: number): Promise<void> {
    if (categoryId) {
      await this.cache.delete(CacheManager.generateKey(`/api/categories/${categoryId}`));
    }
    await this.cache.clearPattern('categories');
  }

  /**
   * Invalidate post-related caches
   */
  async invalidatePosts(postId?: number): Promise<void> {
    if (postId) {
      await this.cache.delete(CacheManager.generateKey(`/api/posts/${postId}`));
    }
    await this.cache.clearPattern('posts');
  }

  /**
   * Invalidate project-related caches
   */
  async invalidateProjects(projectId?: number): Promise<void> {
    if (projectId) {
      await this.cache.delete(CacheManager.generateKey(`/api/projects/${projectId}`));
    }
    await this.cache.clearPattern('projects');
  }
}

/**
 * Cache timing configuration
 */
export const CACHE_CONFIG = {
  // Public endpoints (can be cached longer)
  PRODUCTS: { ttl: 3600 }, // 1 hour
  CATEGORIES: { ttl: 7200 }, // 2 hours
  POSTS: { ttl: 3600 }, // 1 hour
  PROJECTS: { ttl: 3600 }, // 1 hour

  // Form submissions (short cache or no cache)
  INQUIRIES: { ttl: 0 }, // No cache
  CONTACTS: { ttl: 0 }, // No cache
} as const;

/**
 * Cache middleware for responses
 */
export function createCachedResponse(
  data: unknown,
  cacheKey: string,
  ttl: number = 3600
): Response {
  const response = new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${ttl}`,
      'X-Cache-Key': cacheKey,
      'X-Cache-TTL': ttl.toString(),
    },
  });

  return response;
}

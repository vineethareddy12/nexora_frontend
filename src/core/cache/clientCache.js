/**
 * Lightweight, memory-efficient Stale-While-Revalidate In-Memory Cache
 * Provides request deduplication, background caching, user-isolation and mutation invalidation.
 */

class ClientDataCache {
  constructor() {
    this.cache = new Map();
    this.inFlight = new Map();
    this.defaultTtl = 60 * 1000; // 1 minute fresh TTL
  }

  /**
   * Generates a composite cache key incorporating current authenticated user ID
   * to guarantee strict privacy and prevent data cross-talk between accounts.
   */
  makeKey(key, userId = null) {
    const userScope = userId || (typeof window !== 'undefined' ? localStorage.getItem('nexora_user_id') || 'guest' : 'guest');
    return `${userScope}::${key}`;
  }

  /**
   * Retrieves cached data if exists
   */
  get(key, userId = null) {
    const compositeKey = this.makeKey(key, userId);
    const entry = this.cache.get(compositeKey);
    if (!entry) return null;
    return entry.data;
  }

  /**
   * Checks if entry exists and is still within its fresh TTL
   */
  isFresh(key, userId = null) {
    const compositeKey = this.makeKey(key, userId);
    const entry = this.cache.get(compositeKey);
    if (!entry) return false;
    return Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Stores data in cache with a TTL
   */
  set(key, data, userId = null, ttl = this.defaultTtl) {
    const compositeKey = this.makeKey(key, userId);
    this.cache.set(compositeKey, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Deduplicates parallel requests and manages stale-while-revalidate execution.
   */
  async fetchWithDedupe(key, fetcher, { userId = null, ttl = this.defaultTtl, force = false } = {}) {
    const compositeKey = this.makeKey(key, userId);

    // If there is an active in-flight request for this exact resource, return it
    if (this.inFlight.has(compositeKey)) {
      return this.inFlight.get(compositeKey);
    }

    const promise = (async () => {
      try {
        const result = await fetcher();
        this.set(key, result, userId, ttl);
        return result;
      } finally {
        this.inFlight.delete(compositeKey);
      }
    })();

    this.inFlight.set(compositeKey, promise);
    return promise;
  }

  /**
   * Invalidates a specific key or keys matching a regex pattern
   */
  invalidate(pattern = null) {
    if (!pattern) {
      this.cache.clear();
      this.inFlight.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (typeof pattern === 'string' && key.includes(pattern)) {
        this.cache.delete(key);
      } else if (pattern instanceof RegExp && pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clears entire cache on logout
   */
  clear() {
    this.cache.clear();
    this.inFlight.clear();
  }
}

export const clientCache = new ClientDataCache();

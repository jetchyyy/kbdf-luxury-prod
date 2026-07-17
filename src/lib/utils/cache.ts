interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// In-memory cache fallback in case sessionStorage is not available or throws
const memoryCache = new Map<string, CacheEntry<any>>();

/**
 * Wraps an async function with a caching layer.
 * Caches the result in sessionStorage (and memory fallback) for `ttlMs` milliseconds.
 * 
 * @param key Unique key for this cache entry
 * @param ttlMs Time-to-live in milliseconds
 * @param fetcher Async function to fetch the data if not cached
 * @returns The cached or freshly fetched data
 */
export async function withCache<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const now = Date.now();

  // 1. Check in-memory cache first
  if (memoryCache.has(key)) {
    const entry = memoryCache.get(key)!;
    if (now - entry.timestamp < ttlMs) {
      return entry.data as T;
    } else {
      memoryCache.delete(key); // Expired
    }
  }

  // 2. Check sessionStorage
  try {
    const sessionEntryStr = sessionStorage.getItem(key);
    if (sessionEntryStr) {
      const entry: CacheEntry<T> = JSON.parse(sessionEntryStr);
      if (now - entry.timestamp < ttlMs) {
        // Hydrate memory cache
        memoryCache.set(key, entry);
        return entry.data;
      } else {
        sessionStorage.removeItem(key); // Expired
      }
    }
  } catch (err) {
    console.warn(`Error reading from sessionStorage for key ${key}:`, err);
  }

  // 3. Not found or expired, fetch new data
  const data = await fetcher();

  // 4. Save to cache
  const newEntry: CacheEntry<T> = { data, timestamp: now };
  memoryCache.set(key, newEntry);
  try {
    sessionStorage.setItem(key, JSON.stringify(newEntry));
  } catch (err) {
    console.warn(`Error writing to sessionStorage for key ${key}:`, err);
  }

  return data;
}

/**
 * Invalidates a specific cache entry from both in-memory and sessionStorage caches.
 * 
 * @param key The unique key of the cache entry to remove
 */
export function invalidateCache(key: string): void {
  memoryCache.delete(key);
  try {
    sessionStorage.removeItem(key);
  } catch (err) {
    console.warn(`Error invalidating cache key ${key}:`, err);
  }
}


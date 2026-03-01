import { LRUCache } from 'lru-cache';

// In-memory LRU cache
const cache = new LRUCache<string, any>({
    max: 500, // max 500 entries
    ttl: 1000 * 60 * 60, // 1 hour TTL default
});

// Cache with custom TTL
export function setCache(key: string, value: any, ttlMs?: number): void {
    cache.set(key, value, { ttl: ttlMs });
}

export function getCache<T>(key: string): T | undefined {
    return cache.get(key) as T | undefined;
}

export function deleteCache(key: string): void {
    cache.delete(key);
}

export function clearCache(): void {
    cache.clear();
}

// Cache keys generator
export function resultsCacheKey(date: string, region?: string, province?: string): string {
    return `results:${date}:${region || 'all'}:${province || 'all'}`;
}

export function latestCacheKey(region?: string, province?: string): string {
    return `latest:${region || 'all'}:${province || 'all'}`;
}

export function provincesCacheKey(region?: string): string {
    return `provinces:${region || 'all'}`;
}

// One-day TTL for old results (they don't change)
export const OLD_RESULT_TTL = 1000 * 60 * 60 * 24; // 24 hours
// Short TTL for latest results (may still update)
export const LATEST_RESULT_TTL = 1000 * 60 * 2; // 2 minutes
// Province list rarely changes
export const PROVINCE_TTL = 1000 * 60 * 60 * 24; // 24 hours

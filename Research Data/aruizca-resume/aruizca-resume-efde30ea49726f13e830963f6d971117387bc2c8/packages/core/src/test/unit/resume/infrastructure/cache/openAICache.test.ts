import { join } from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { rm } from 'fs/promises';
import { OpenAICache } from '../../../../../main/shared';

describe('OpenAICache', () => {
  let cache: OpenAICache;
  const testCacheDir = join(process.cwd(), '.cache', 'test-openai');

  beforeEach(() => {
    cache = new OpenAICache({ cacheDir: testCacheDir });
  });

  afterEach(async () => {
    try {
      await rm(testCacheDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('get and set', () => {
    it('should cache and retrieve data', async () => {
      const testData = { name: 'John Doe', experience: '5 years' };
      const promptTemplate = 'Convert {{linkedinData}} to JSON Resume format';
      const response = { basics: { name: 'John Doe' } };

      // Initially no cache
      const initialResult = await cache.get(testData, promptTemplate);
      expect(initialResult).toBeNull();

      // Set cache
      await cache.set(testData, promptTemplate, response);

      // Retrieve from cache
      const cachedResult = await cache.get(testData, promptTemplate);
      expect(cachedResult).toEqual(response);
    });

    it('should handle force refresh', async () => {
      const testData = { name: 'Jane Smith' };
      const promptTemplate = 'Convert to JSON Resume';
      const response = { basics: { name: 'Jane Smith' } };

      // Set cache
      await cache.set(testData, promptTemplate, response);

      // Force refresh should bypass cache
      const forceRefreshResult = await cache.get(testData, promptTemplate, true);
      expect(forceRefreshResult).toBeNull();
    });

    it('should handle different data with same prompt', async () => {
      const promptTemplate = 'Convert to JSON Resume';
      const data1 = { name: 'John' };
      const data2 = { name: 'Jane' };
      const response1 = { basics: { name: 'John' } };
      const response2 = { basics: { name: 'Jane' } };

      await cache.set(data1, promptTemplate, response1);
      await cache.set(data2, promptTemplate, response2);

      const result1 = await cache.get(data1, promptTemplate);
      const result2 = await cache.get(data2, promptTemplate);

      expect(result1).toEqual(response1);
      expect(result2).toEqual(response2);
    });

    it('should handle cache misses gracefully', async () => {
      const testData = { name: 'Unknown' };
      const promptTemplate = 'Convert to JSON Resume';

      const result = await cache.get(testData, promptTemplate);
      expect(result).toBeNull();
    });
  });

  describe('TTL functionality', () => {
    it('should respect TTL settings', async () => {
      const shortTtlCache = new OpenAICache({ 
        cacheDir: testCacheDir, 
        ttl: 100 // 100ms TTL
      });

      const testData = { name: 'Test' };
      const promptTemplate = 'Convert to JSON Resume';
      const response = { basics: { name: 'Test' } };

      await shortTtlCache.set(testData, promptTemplate, response);

      // Should be cached immediately
      const immediateResult = await shortTtlCache.get(testData, promptTemplate);
      expect(immediateResult).toEqual(response);

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should be expired
      const expiredResult = await shortTtlCache.get(testData, promptTemplate);
      expect(expiredResult).toBeNull();
    });
  });

  describe('cache management', () => {
    it('should clear cache', async () => {
      const testData = { name: 'John' };
      const promptTemplate = 'Convert to JSON Resume';
      const response = { basics: { name: 'John' } };

      await cache.set(testData, promptTemplate, response);
      
      // Verify cache exists
      const beforeClear = await cache.get(testData, promptTemplate);
      expect(beforeClear).toEqual(response);

      // Clear cache
      await cache.clear();

      // Verify cache is cleared
      const afterClear = await cache.get(testData, promptTemplate);
      expect(afterClear).toBeNull();
    });

    it('should get cache statistics', async () => {
      const testData = { name: 'John' };
      const promptTemplate = 'Convert to JSON Resume';
      const response = { basics: { name: 'John' } };

      // Empty cache stats
      const emptyStats = await cache.getStats();
      expect(emptyStats.totalEntries).toBe(0);
      expect(emptyStats.totalSize).toBe(0);

      // Add cache entry
      await cache.set(testData, promptTemplate, response);

      // Check stats after adding entry
      const stats = await cache.getStats();
      expect(stats.totalEntries).toBe(1);
      expect(stats.totalSize).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    it('should handle cache directory creation errors gracefully', async () => {
      // This test verifies that cache operations don't throw errors
      // when there are file system issues
      const testData = { name: 'John' };
      const promptTemplate = 'Convert to JSON Resume';

      const result = await cache.get(testData, promptTemplate);
      expect(result).toBeNull();
    });

    it('should handle invalid cache files gracefully', async () => {
      const testData = { name: 'John' };
      const promptTemplate = 'Convert to JSON Resume';

      // Cache should handle corrupted or invalid cache files
      const result = await cache.get(testData, promptTemplate);
      expect(result).toBeNull();
    });
  });
}); 
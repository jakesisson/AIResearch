import { createHash } from 'crypto';
import { access, mkdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

export interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  cacheDir?: string;
  forceRefresh?: boolean;
}

export class OpenAICache {
  private cacheDir: string;
  private defaultTtl: number;

  constructor(options: CacheOptions = {}) {
    this.cacheDir = options.cacheDir || join(process.cwd(), '.cache', 'openai');
    this.defaultTtl = options.ttl || 8 * 60 * 60 * 1000; // 8 hours in milliseconds
  }

  /**
   * Generate a cache key based on the input data
   */
  private generateCacheKey(data: any, promptTemplate: string): string {
    const content = JSON.stringify(data) + promptTemplate;
    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * Get the cache file path for a given key
   */
  private getCacheFilePath(key: string): string {
    return join(this.cacheDir, `${key}.json`);
  }

  /**
   * Ensure cache directory exists
   */
  private async ensureCacheDir(): Promise<void> {
    try {
      await access(this.cacheDir);
    } catch {
      await mkdir(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Get cached response if available and not expired
   */
  async get(data: any, promptTemplate: string, forceRefresh: boolean = false): Promise<any | null> {
    if (forceRefresh) {
      return null;
    }

    try {
      await this.ensureCacheDir();
      const key = this.generateCacheKey(data, promptTemplate);
      const cachePath = this.getCacheFilePath(key);
      
      const cacheData = await readFile(cachePath, 'utf8');
      const entry: CacheEntry = JSON.parse(cacheData);
      
      const now = Date.now();
      if (now - entry.timestamp < entry.ttl) {
        console.log('📋 Using cached OpenAI response');
        return entry.data;
      } else {
        console.log('⏰ Cached response expired, fetching fresh data');
        return null;
      }
    } catch (error) {
      // Cache miss or error - return null to fetch fresh data
      return null;
    }
  }

  /**
   * Store response in cache
   */
  async set(data: any, promptTemplate: string, response: any): Promise<void> {
    try {
      await this.ensureCacheDir();
      const key = this.generateCacheKey(data, promptTemplate);
      const cachePath = this.getCacheFilePath(key);
      
      const entry: CacheEntry = {
        data: response,
        timestamp: Date.now(),
        ttl: this.defaultTtl
      };
      
      await writeFile(cachePath, JSON.stringify(entry, null, 2));
      console.log('💾 Cached OpenAI response for future use');
    } catch (error) {
      console.warn('⚠️  Failed to cache response:', error);
      // Don't throw - caching is optional
    }
  }

  /**
   * Clear all cached responses
   */
  async clear(): Promise<void> {
    try {
      const { rm } = await import('fs/promises');
      await rm(this.cacheDir, { recursive: true, force: true });
      console.log('🗑️  Cleared OpenAI cache');
    } catch (error) {
      console.warn('⚠️  Failed to clear cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ totalEntries: number; totalSize: number }> {
    try {
      const { readdir, stat } = await import('fs/promises');
      const files = await readdir(this.cacheDir);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      let totalSize = 0;
      for (const file of jsonFiles) {
        const filePath = join(this.cacheDir, file);
        const stats = await stat(filePath);
        totalSize += stats.size;
      }
      
      return {
        totalEntries: jsonFiles.length,
        totalSize
      };
    } catch (error) {
      return { totalEntries: 0, totalSize: 0 };
    }
  }
} 
import { readFile, writeFile, access, mkdir } from 'fs/promises';
import { join } from 'path';
import { createHash } from 'crypto';
import { JobOffer } from '../../domain/model/JobOffer';

export interface JobPostingCacheEntry {
  jobOffer: JobOffer;
  timestamp: number;
  ttl: number;
}

export interface JobPostingCacheOptions {
  ttl?: number; // Time to live in milliseconds (default: 24 hours)
  cacheDir?: string;
  forceRefresh?: boolean;
}

export class JobPostingCache {
  private cacheDir: string;
  private defaultTtl: number;

  constructor(options: JobPostingCacheOptions = {}) {
    this.cacheDir = options.cacheDir || join(process.cwd(), '.cache', 'job-postings');
    this.defaultTtl = options.ttl || 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  }

  /**
   * Generate a cache key based on the job posting URL
   */
  private generateCacheKey(url: string): string {
    return createHash('sha256').update(url).digest('hex');
  }

  /**
   * Get the cache file path for a given URL
   */
  private getCacheFilePath(url: string): string {
    const key = this.generateCacheKey(url);
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
   * Get cached job posting if available and not expired
   */
  async get(url: string, forceRefresh: boolean = false): Promise<JobOffer | null> {
    if (forceRefresh) {
      return null;
    }

    try {
      await this.ensureCacheDir();
      const cachePath = this.getCacheFilePath(url);
      
      const cacheData = await readFile(cachePath, 'utf8');
      const entry: JobPostingCacheEntry = JSON.parse(cacheData);
      
      const now = Date.now();
      if (now - entry.timestamp < entry.ttl) {
        console.log('📋 Using cached job posting data');
        return entry.jobOffer;
      } else {
        console.log('⏰ Cached job posting expired, fetching fresh data');
        return null;
      }
    } catch (error) {
      // Cache miss or error - return null to fetch fresh data
      return null;
    }
  }

  /**
   * Store job posting in cache
   */
  async set(url: string, jobOffer: JobOffer): Promise<void> {
    try {
      await this.ensureCacheDir();
      const cachePath = this.getCacheFilePath(url);
      
      const entry: JobPostingCacheEntry = {
        jobOffer,
        timestamp: Date.now(),
        ttl: this.defaultTtl
      };
      
      await writeFile(cachePath, JSON.stringify(entry, null, 2));
      console.log('💾 Cached job posting data for future use');
    } catch (error) {
      console.warn('⚠️  Failed to cache job posting:', error);
    }
  }

  /**
   * Clear all cached job postings
   */
  async clear(): Promise<void> {
    try {
      const { rm } = await import('fs/promises');
      await rm(this.cacheDir, { recursive: true, force: true });
      console.log('🗑️  Cleared job posting cache');
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
      
      let totalSize = 0;
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = join(this.cacheDir, file);
          const stats = await stat(filePath);
          totalSize += stats.size;
        }
      }
      
      return {
        totalEntries: files.filter(f => f.endsWith('.json')).length,
        totalSize
      };
    } catch (error) {
      return { totalEntries: 0, totalSize: 0 };
    }
  }

  /**
   * Check if a URL is cached and not expired
   */
  async isCached(url: string): Promise<boolean> {
    try {
      const cached = await this.get(url);
      return cached !== null;
    } catch {
      return false;
    }
  }
} 
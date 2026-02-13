import { JobOfferScrapingResult } from '../../domain';
import { CoverLetterPromptRunner, DefaultCoverLetterPromptRunner } from '../langchain';
import { JobPostingCache, JobPostingCacheOptions } from '../cache';

export interface JobOfferScraper {
  scrape(url: string, forceRefresh?: boolean): Promise<JobOfferScrapingResult>;
}

export class DefaultJobOfferScraper implements JobOfferScraper {
  private promptRunner: CoverLetterPromptRunner;
  private cache: JobPostingCache;

  constructor(
    promptRunner?: CoverLetterPromptRunner,
    cacheOptions?: JobPostingCacheOptions
  ) {
    this.promptRunner = promptRunner || new DefaultCoverLetterPromptRunner();
    this.cache = new JobPostingCache(cacheOptions);
  }

  async scrape(url: string, forceRefresh: boolean = false): Promise<JobOfferScrapingResult> {
    try {
      console.log(`🔍 Scraping job offer from: ${url}`);
      
      // Step 1: Check cache first (unless force refresh is enabled)
      const cachedJobOffer = await this.cache.get(url, forceRefresh);
      if (cachedJobOffer) {
        console.log('✅ Using cached job posting data');
        return {
          success: true,
          jobOffer: cachedJobOffer,
          rawHtml: undefined // We don't cache the raw HTML
        };
      }
      
      // Step 2: Fetch HTML from the job URL
      const html = await this.fetchHtml(url);
      if (!html) {
        return {
          success: false,
          error: 'Failed to fetch HTML from the job URL'
        };
      }

      // Step 3: Extract job information using LLM
      const jobOffer = await this.promptRunner.extractJobInfoFromHtml(html);
      
      // Set the URL from the original request
      jobOffer.url = url;

      // Step 4: Cache the extracted job offer
      await this.cache.set(url, jobOffer);

      return {
        success: true,
        jobOffer,
        rawHtml: html
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during scraping'
      };
    }
  }

  private async fetchHtml(url: string): Promise<string | null> {
    try {
      console.log(`📄 Fetching HTML from: ${url}`);
      
      // Use native fetch (available in Node.js 18+)
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      console.log(`✅ Successfully fetched HTML (${html.length} characters)`);
      
      return html;
    } catch (error) {
      console.error(`❌ Failed to fetch HTML: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{ totalEntries: number; totalSize: number }> {
    return await this.cache.getStats();
  }

  /**
   * Clear the job posting cache
   */
  async clearCache(): Promise<void> {
    await this.cache.clear();
  }
} 
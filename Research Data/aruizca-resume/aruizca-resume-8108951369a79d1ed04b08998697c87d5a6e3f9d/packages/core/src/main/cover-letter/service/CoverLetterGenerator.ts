import { Resume } from '../../resume';
import { CoverLetter, CoverLetterBuilder, JobOffer } from '../domain';
import { CoverLetterPromptRunner, DefaultCoverLetterPromptRunner, DefaultJobOfferScraper, JobOfferScraper } from '../infrastructure';

export interface CoverLetterGenerationResult {
  success: boolean;
  coverLetter?: CoverLetter;
  error?: string;
  performance?: {
    scrapeTime: number;
    llmTime: number;
    buildTime: number;
    totalTime: number;
  };
}

/**
 * Core cover letter generation service focused on producing cover letters from resumes and job offers.
 * 
 * Takes a JSON Resume object and job offer (URL or data) and returns a CoverLetter object.
 * File I/O operations are handled by separate services that use this core generator.
 */
export class CoverLetterGenerator {
  constructor(
    private jobOfferScraper = new DefaultJobOfferScraper(),
    private promptRunner = new DefaultCoverLetterPromptRunner(),
    private coverLetterBuilder = new CoverLetterBuilder()
  ) {}

  /**
   * Generate a cover letter from a JSON resume and job offer URL
   * @param resume The JSON resume object
   * @param jobOfferUrl URL of the job posting to scrape
   * @param forceRefresh Whether to bypass cache for fresh content
   * @returns Cover letter generation result
   */
  async generateFromResumeAndUrl(
    resume: Resume, 
    jobOfferUrl: string,
    forceRefresh: boolean = false
  ): Promise<CoverLetterGenerationResult> {
    const startTime = Date.now();
    
    try {
      console.log('🚀 Starting cover letter generation...');

      // 1. Scrape job offer
      console.log('📄 Scraping job offer...');
      const scrapeStart = Date.now();
      const scrapingResult = await this.jobOfferScraper.scrape(jobOfferUrl, forceRefresh);
      const scrapeTime = Date.now() - scrapeStart;

      if (!scrapingResult.success || !scrapingResult.jobOffer) {
        return {
          success: false,
          error: scrapingResult.error || 'Failed to scrape job offer'
        };
      }

      // 2. Generate cover letter content with LLM
      console.log('✍️ Generating cover letter content...');
      const llmStart = Date.now();
      const resumeJson = JSON.stringify(resume, null, 2);
      const jobOfferJson = JSON.stringify(scrapingResult.jobOffer, null, 2);
      const coverLetterContent = await this.promptRunner.runWithJson(jobOfferJson, resumeJson);
      const llmTime = Date.now() - llmStart;

      // 3. Build final cover letter object
      console.log('🔧 Building cover letter object...');
      const buildStart = Date.now();
      const coverLetter = this.coverLetterBuilder.build(
        scrapingResult.jobOffer,
        {} as any, // We're using JSON resume directly now
        coverLetterContent,
        'professional'
      );
      const buildTime = Date.now() - buildStart;

      const totalTime = Date.now() - startTime;

      console.log('✅ Cover letter generation completed successfully!');

      return {
        success: true,
        coverLetter,
        performance: {
          scrapeTime,
          llmTime,
          buildTime,
          totalTime
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Cover letter generation failed:', errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Generate a cover letter from a JSON resume and job offer data
   * @param resume The JSON resume object
   * @param jobOffer The job offer data object
   * @returns Cover letter generation result
   */
  async generateFromResumeAndJobOffer(
    resume: Resume,
    jobOffer: JobOffer
  ): Promise<CoverLetterGenerationResult> {
    const startTime = Date.now();
    
    try {
      console.log('🚀 Starting cover letter generation with provided job offer...');

      // 1. Generate cover letter content with LLM
      console.log('✍️ Generating cover letter content...');
      const llmStart = Date.now();
      const resumeJson = JSON.stringify(resume, null, 2);
      const jobOfferJson = JSON.stringify(jobOffer, null, 2);
      const coverLetterContent = await this.promptRunner.runWithJson(jobOfferJson, resumeJson);
      const llmTime = Date.now() - llmStart;

      // 2. Build final cover letter object
      console.log('🔧 Building cover letter object...');
      const buildStart = Date.now();
      const coverLetter = this.coverLetterBuilder.build(
        jobOffer,
        {} as any, // We're using JSON resume directly now
        coverLetterContent,
        'professional'
      );
      const buildTime = Date.now() - buildStart;

      const totalTime = Date.now() - startTime;

      console.log('✅ Cover letter generation completed successfully!');

      return {
        success: true,
        coverLetter,
        performance: {
          scrapeTime: 0, // No scraping needed
          llmTime,
          buildTime,
          totalTime
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Cover letter generation failed:', errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Extract job offer information from HTML content
   * @param htmlContent The HTML content to parse
   * @param originalUrl The original URL for reference
   * @returns Extracted job offer object
   */
  async extractJobOfferFromHtml(htmlContent: string, originalUrl: string): Promise<JobOffer> {
    console.log('🔍 Extracting job information from HTML...');
    const jobOffer = await this.promptRunner.extractJobInfoFromHtml(htmlContent);
    jobOffer.url = originalUrl; // Set the URL from the original request
    return jobOffer;
  }

  /**
   * Get cache statistics from the job offer scraper
   */
  async getCacheStats(): Promise<{ totalEntries: number; totalSize: number }> {
    if (this.jobOfferScraper && typeof (this.jobOfferScraper as any).getCacheStats === 'function') {
      try {
        return await (this.jobOfferScraper as any).getCacheStats();
      } catch (error) {
        // Cache stats not available
        return { totalEntries: 0, totalSize: 0 };
      }
    }
    return { totalEntries: 0, totalSize: 0 };
  }
}

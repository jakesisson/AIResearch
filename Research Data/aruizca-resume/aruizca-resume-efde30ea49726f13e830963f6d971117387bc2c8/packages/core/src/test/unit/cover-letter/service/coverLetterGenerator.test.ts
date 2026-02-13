import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CoverLetterGenerator, CoverLetterBuilder, JobOffer, CoverLetterPromptRunner, JobOfferScraper } from '../../../../main/cover-letter';
import { Resume } from '../../../../main/resume';

describe('CoverLetterGenerator', () => {
  let generator: CoverLetterGenerator;
  let mockJobOfferScraper: any;
  let mockPromptRunner: any;
  let mockCoverLetterBuilder: any;

  const mockResume: Resume = {
    basics: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      summary: 'Experienced software developer'
    },
    work: [],
    education: [],
    skills: []
  } as Resume;

  const mockJobOffer: JobOffer = {
    title: 'Software Engineer',
    company: 'Tech Corp',
    description: 'Great opportunity for a software engineer',
    requirements: ['JavaScript', 'React', 'Node.js'],
    responsibilities: ['Develop software', 'Code reviews', 'Team collaboration'],
    location: 'Remote',
    url: 'https://example.com/job',
    salary: '$100k-$120k',
    scrapedAt: new Date()
  };

  beforeEach(() => {
    // Create mocks
    mockJobOfferScraper = {
      scrape: vi.fn(),
      getCacheStats: vi.fn()
    } as any;

    mockPromptRunner = {
      runWithJson: vi.fn(),
      extractJobInfoFromHtml: vi.fn()
    } as any;

    mockCoverLetterBuilder = {
      build: vi.fn()
    } as any;

    // Create generator with mocked dependencies
    generator = new CoverLetterGenerator(
      mockJobOfferScraper,
      mockPromptRunner,
      mockCoverLetterBuilder
    );
  });

  describe('generateFromResumeAndUrl', () => {
    it('should successfully generate a cover letter from resume and job URL', async () => {
      const mockCoverLetterContent = 'Dear Hiring Manager,\n\nI am excited to apply...';
      const mockCoverLetter = {
        jobOffer: mockJobOffer,
        userProfile: {},
        content: mockCoverLetterContent,
        generatedAt: new Date(),
        metadata: {
          wordCount: 10,
          tone: 'professional' as const,
          focusAreas: ['JavaScript', 'React']
        }
      };

      // Mock all the dependencies
      mockJobOfferScraper.scrape.mockResolvedValue({
        success: true,
        jobOffer: mockJobOffer
      });
      mockPromptRunner.runWithJson.mockResolvedValue(mockCoverLetterContent);
      mockCoverLetterBuilder.build.mockReturnValue(mockCoverLetter);
      mockJobOfferScraper.getCacheStats.mockResolvedValue({ totalEntries: 1, totalSize: 1024 });

      const result = await generator.generateFromResumeAndUrl(mockResume, 'https://example.com/job', false);

      // Verify all steps were called
      expect(mockJobOfferScraper.scrape).toHaveBeenCalledWith('https://example.com/job', false);
      expect(mockPromptRunner.runWithJson).toHaveBeenCalledWith(
        JSON.stringify(mockJobOffer, null, 2),
        JSON.stringify(mockResume, null, 2)
      );
      expect(mockCoverLetterBuilder.build).toHaveBeenCalledWith(
        mockJobOffer,
        {},
        mockCoverLetterContent,
        'professional'
      );

      // Verify result
      expect(result.success).toBe(true);
      expect(result.coverLetter).toEqual(mockCoverLetter);
      expect(result.performance).toBeDefined();
      expect(result.performance?.scrapeTime).toBeGreaterThanOrEqual(0);
      expect(result.performance?.llmTime).toBeGreaterThanOrEqual(0);
      expect(result.performance?.buildTime).toBeGreaterThanOrEqual(0);
      expect(result.performance?.totalTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle job scraping failure', async () => {
      mockJobOfferScraper.scrape.mockResolvedValue({
        success: false,
        error: 'Failed to scrape job posting'
      });

      const result = await generator.generateFromResumeAndUrl(mockResume, 'https://invalid-url.com', false);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to scrape job posting');
      expect(mockPromptRunner.runWithJson).not.toHaveBeenCalled();
    });

    it('should handle LLM generation failure', async () => {
      mockJobOfferScraper.scrape.mockResolvedValue({
        success: true,
        jobOffer: mockJobOffer
      });
      mockPromptRunner.runWithJson.mockRejectedValue(new Error('LLM API failed'));

      const result = await generator.generateFromResumeAndUrl(mockResume, 'https://example.com/job', false);

      expect(result.success).toBe(false);
      expect(result.error).toContain('LLM API failed');
    });

    it('should pass forceRefresh parameter to scraper', async () => {
      mockJobOfferScraper.scrape.mockResolvedValue({
        success: true,
        jobOffer: mockJobOffer
      });
      mockPromptRunner.runWithJson.mockResolvedValue('Cover letter content');
      mockCoverLetterBuilder.build.mockReturnValue({});

      await generator.generateFromResumeAndUrl(mockResume, 'https://example.com/job', true);

      expect(mockJobOfferScraper.scrape).toHaveBeenCalledWith('https://example.com/job', true);
    });
  });

  describe('generateFromResumeAndJobOffer', () => {
    it('should successfully generate a cover letter from resume and job offer data', async () => {
      const mockCoverLetterContent = 'Dear Hiring Manager,\n\nI am excited to apply...';
      const mockCoverLetter = {
        jobOffer: mockJobOffer,
        userProfile: {},
        content: mockCoverLetterContent,
        generatedAt: new Date(),
        metadata: {
          wordCount: 10,
          tone: 'professional' as const,
          focusAreas: ['JavaScript', 'React']
        }
      };

      mockPromptRunner.runWithJson.mockResolvedValue(mockCoverLetterContent);
      mockCoverLetterBuilder.build.mockReturnValue(mockCoverLetter);

      const result = await generator.generateFromResumeAndJobOffer(mockResume, mockJobOffer);

      // Verify steps were called (no scraping needed)
      expect(mockJobOfferScraper.scrape).not.toHaveBeenCalled();
      expect(mockPromptRunner.runWithJson).toHaveBeenCalledWith(
        JSON.stringify(mockJobOffer, null, 2),
        JSON.stringify(mockResume, null, 2)
      );
      expect(mockCoverLetterBuilder.build).toHaveBeenCalledWith(
        mockJobOffer,
        {},
        mockCoverLetterContent,
        'professional'
      );

      // Verify result
      expect(result.success).toBe(true);
      expect(result.coverLetter).toEqual(mockCoverLetter);
      expect(result.performance).toBeDefined();
      expect(result.performance?.scrapeTime).toBe(0); // No scraping
      expect(result.performance?.llmTime).toBeGreaterThanOrEqual(0);
      expect(result.performance?.buildTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('extractJobOfferFromHtml', () => {
    it('should extract job offer from HTML content', async () => {
      const htmlContent = '<html><body><h1>Software Engineer</h1></body></html>';
      const expectedJobOffer = { ...mockJobOffer };
      delete (expectedJobOffer as any).url; // URL will be added by the method

      mockPromptRunner.extractJobInfoFromHtml.mockResolvedValue(expectedJobOffer);

      const result = await generator.extractJobOfferFromHtml(htmlContent, 'https://example.com/job');

      expect(mockPromptRunner.extractJobInfoFromHtml).toHaveBeenCalledWith(htmlContent);
      expect(result.url).toBe('https://example.com/job');
      expect(result.title).toBe(mockJobOffer.title);
    });
  });

  describe('getCacheStats', () => {
    it('should return cache stats when available', async () => {
      const expectedStats = { totalEntries: 5, totalSize: 2048 };
      mockJobOfferScraper.getCacheStats.mockResolvedValue(expectedStats);

      const result = await generator.getCacheStats();

      expect(result).toEqual(expectedStats);
    });

    it('should return empty stats when cache not available', async () => {
      mockJobOfferScraper.getCacheStats.mockRejectedValue(new Error('Cache not available'));

      const result = await generator.getCacheStats();

      expect(result).toEqual({ totalEntries: 0, totalSize: 0 });
    });

    it('should return empty stats when getCacheStats method does not exist', async () => {
      const generatorWithoutCache = new CoverLetterGenerator(
        {} as any, // Mock scraper without getCacheStats method
        mockPromptRunner,
        mockCoverLetterBuilder
      );

      const result = await generatorWithoutCache.getCacheStats();

      expect(result).toEqual({ totalEntries: 0, totalSize: 0 });
    });
  });
});

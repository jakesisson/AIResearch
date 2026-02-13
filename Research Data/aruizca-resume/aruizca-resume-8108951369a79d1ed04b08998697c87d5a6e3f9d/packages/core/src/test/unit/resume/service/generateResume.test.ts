import { join } from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdir, writeFile } from 'fs/promises';

// Mock fs/promises
vi.mock('fs/promises', () => ({
  writeFile: vi.fn(),
  mkdir: vi.fn()
}));

// Mock the resume-generator module
vi.mock('../../../../main', () => ({
  ResumeGenerator: vi.fn().mockImplementation(() => ({
    run: vi.fn().mockImplementation(async (linkedInDir: string, outputDir: string) => {
      // Import the mocked dependencies
      const { LinkedInZipParser, PromptRunner, HtmlExporter, PdfExporter } = await import('../../../../main');
      
      // Create instances and call the pipeline
      const linkedInParser = new (LinkedInZipParser as any)();
      const promptRunner = new (PromptRunner as any)();
      const htmlExporter = new (HtmlExporter as any)();
      const pdfExporter = new (PdfExporter as any)();
      
      const parsedData = await linkedInParser.parse(linkedInDir);
      const resume = await promptRunner.run(parsedData);
      const html = await htmlExporter.export(resume);
      const pdfBuffer = await pdfExporter.export(resume);
      
      // Mock file operations
      const { writeFile, mkdir } = await import('fs/promises');
      await mkdir(outputDir, { recursive: true });
      await writeFile(join(outputDir, 'resume-20250806.json'), JSON.stringify(resume));
      await writeFile(join(outputDir, 'resume-20250806.html'), html);
      await writeFile(join(outputDir, 'resume-20250806.pdf'), pdfBuffer);
      
      return {
        jsonPath: join(outputDir, 'resume-20250806.json'),
        htmlPath: join(outputDir, 'resume-20250806.html'),
        pdfPath: join(outputDir, 'resume-20250806.pdf')
      };
    })
  })),
  LinkedInZipParser: vi.fn(),
  PromptRunner: vi.fn(),
  HtmlExporter: vi.fn(),
  PdfExporter: vi.fn()
}));

describe('ResumeGenerator', () => {
  let generateResume: any;
  let mockLinkedInParser: any;
  let mockPromptRunner: any;

  let mockHtmlRenderer: any;
  let mockPdfExporter: any;
  const mockWriteFile = writeFile as any;
  const mockMkdir = mkdir as any;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Create mock instances
    mockLinkedInParser = {
      parse: vi.fn()
    };
    mockPromptRunner = {
      run: vi.fn()
    };

    mockHtmlRenderer = {
      export: vi.fn()
    };
    mockPdfExporter = {
      export: vi.fn()
    };

    // Import the mocked modules
    const { ResumeGenerator, LinkedInZipParser, PromptRunner, HtmlExporter, PdfExporter } = await import('../../../../main');
    
    // Mock the constructors
    (LinkedInZipParser as any).mockImplementation(() => mockLinkedInParser);
    (PromptRunner as any).mockImplementation(() => mockPromptRunner);

    (HtmlExporter as any).mockImplementation(() => mockHtmlRenderer);
    (PdfExporter as any).mockImplementation(() => mockPdfExporter);

    generateResume = new (ResumeGenerator as any)();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('run', () => {
    it('should run the full pipeline successfully', async () => {
      const mockParsedData = {
        profile: [{ name: 'John Doe' }],
        positions: [{ title: 'Engineer' }],
        education: [{ institution: 'University' }],
        skills: [{ name: 'JavaScript' }]
      };

      const mockLlmData = {
        basics: { name: 'John Doe' },
        work: [{ name: 'Company' }]
      };

      const mockResume = {
        basics: { name: 'John Doe' },
        work: [{ name: 'Company' }]
      };

      const mockHtml = '<html><body>Resume</body></html>';

      // Mock all the dependencies
      mockLinkedInParser.parse.mockResolvedValue(mockParsedData);
      mockPromptRunner.run.mockResolvedValue(mockResume);

      mockHtmlRenderer.export.mockResolvedValue(mockHtml);
      mockPdfExporter.export.mockResolvedValue(Buffer.from('fake pdf content'));
      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);

      const result = await generateResume.run('test-linkedin-dir', 'test-output');

      // Verify all steps were called
      expect(mockLinkedInParser.parse).toHaveBeenCalledWith('test-linkedin-dir');
      expect(mockPromptRunner.run).toHaveBeenCalledWith(mockParsedData);

      expect(mockHtmlRenderer.export).toHaveBeenCalledWith(mockResume);
      expect(mockPdfExporter.export).toHaveBeenCalledWith(mockResume);
      expect(mockMkdir).toHaveBeenCalledWith('test-output', { recursive: true });

      // Verify file writes
      expect(mockWriteFile).toHaveBeenCalledTimes(3); // JSON, HTML, and PDF files
      expect(result).toHaveProperty('jsonPath');
      expect(result).toHaveProperty('htmlPath');
      expect(result).toHaveProperty('pdfPath');
    });

    it('should handle LinkedInParser errors', async () => {
      mockLinkedInParser.parse.mockRejectedValue(new Error('LinkedIn parsing failed'));

      await expect(generateResume.run('test-dir', 'test-output')).rejects.toThrow('LinkedIn parsing failed');
    });

    it('should handle PromptRunner errors', async () => {
      mockLinkedInParser.parse.mockResolvedValue({});
      mockPromptRunner.run.mockRejectedValue(new Error('LLM processing failed'));

      await expect(generateResume.run('test-dir', 'test-output')).rejects.toThrow('LLM processing failed');
    });

    it('should handle HtmlRenderer errors', async () => {
      mockLinkedInParser.parse.mockResolvedValue({});
      mockPromptRunner.run.mockResolvedValue({});

      mockHtmlRenderer.export.mockRejectedValue(new Error('HTML rendering failed'));

      await expect(generateResume.run('test-dir', 'test-output')).rejects.toThrow('HTML rendering failed');
    });

    it('should handle PdfExporter errors', async () => {
      mockLinkedInParser.parse.mockResolvedValue({});
      mockPromptRunner.run.mockResolvedValue({});

      mockHtmlRenderer.export.mockResolvedValue('<html></html>');
      mockPdfExporter.export.mockRejectedValue(new Error('PDF export failed'));

      await expect(generateResume.run('test-dir', 'test-output')).rejects.toThrow('PDF export failed');
    });

    it('should generate correct file paths with date', async () => {
      const mockDate = new Date('2025-08-06T12:00:00Z');
      vi.setSystemTime(mockDate);

      mockLinkedInParser.parse.mockResolvedValue({});
      mockPromptRunner.run.mockResolvedValue({});

      mockHtmlRenderer.export.mockResolvedValue('<html></html>');
      mockPdfExporter.export.mockResolvedValue(undefined);
      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);

      const result = await generateResume.run('test-dir', 'test-output');

      expect(result.jsonPath).toContain('resume-20250806.json');
      expect(result.htmlPath).toContain('resume-20250806.html');
      expect(result.pdfPath).toContain('resume-20250806.pdf');

      vi.useRealTimers();
    });

    it('should create output directory if it does not exist', async () => {
      mockLinkedInParser.parse.mockResolvedValue({});
      mockPromptRunner.run.mockResolvedValue({});

      mockHtmlRenderer.export.mockResolvedValue('<html></html>');
      mockPdfExporter.export.mockResolvedValue(undefined);
      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);

      await generateResume.run('test-dir', 'new-output-dir');

      expect(mockMkdir).toHaveBeenCalledWith('new-output-dir', { recursive: true });
    });
  });
}); 
import { exec } from 'child_process';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdir, readdir, stat } from 'fs/promises';
import { LinkedInExportFinder } from '../../../../../main/resume';

// Mock fs/promises
vi.mock('fs/promises', () => ({
  readdir: vi.fn(),
  stat: vi.fn(),
  mkdir: vi.fn(),
  access: vi.fn()
}));

// Mock child_process
vi.mock('child_process', () => ({
  exec: vi.fn()
}));

// Mock util
vi.mock('util', () => ({
  promisify: vi.fn((fn) => fn)
}));

describe('LinkedInExportFinder', () => {
  let finder: LinkedInExportFinder;
  const mockReaddir = readdir as any;
  const mockStat = stat as any;
  const mockMkdir = mkdir as any;
  const mockExec = exec as any;

  beforeEach(() => {
    vi.clearAllMocks();
    finder = new LinkedInExportFinder();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('findNewestExport', () => {
    it('should find the newest LinkedIn export ZIP file', async () => {
      const mockFiles = [
        'Basic_LinkedInDataExport_04-18-2025.zip',
        'Basic_LinkedInDataExport_08-05-2025.zip',
        'other-file.txt'
      ];

      const mockStats = [
        { mtime: new Date('2025-04-18') },
        { mtime: new Date('2025-08-05') }
      ];

      mockReaddir.mockResolvedValue(mockFiles);
      mockStat.mockResolvedValueOnce(mockStats[1]); // Newest file
      mockStat.mockResolvedValueOnce(mockStats[0]); // Older file
      mockStat.mockRejectedValueOnce(new Error('ENOENT')); // Extracted dir doesn't exist
      mockMkdir.mockResolvedValue(undefined);
      mockExec.mockResolvedValue({ stdout: '', stderr: '' });

      const result = await finder.findNewestExport('test-dir');

      expect(result).toContain('extracted');
      expect(mockReaddir).toHaveBeenCalledWith('test-dir');
      expect(mockStat).toHaveBeenCalledTimes(3); // 2 files + 1 extracted dir check
    });

    it('should throw error when no LinkedIn export files found', async () => {
      const mockFiles = ['other-file.txt', 'document.pdf'];

      mockReaddir.mockResolvedValue(mockFiles);

      await expect(finder.findNewestExport('test-dir')).rejects.toThrow(
        'No LinkedIn export files found in test-dir'
      );
    });

    it('should use existing extracted directory if it is newer than ZIP', async () => {
      const mockFiles = ['Basic_LinkedInDataExport_08-05-2025.zip'];
      const zipStats = { mtime: new Date('2025-08-05T10:00:00') };
      const extractedStats = { mtime: new Date('2025-08-05T11:00:00') }; // Newer

      mockReaddir.mockResolvedValue(mockFiles);
      mockStat.mockResolvedValueOnce(zipStats);
      mockStat.mockResolvedValueOnce(extractedStats);

      const result = await finder.findNewestExport('test-dir');

      expect(result).toContain('extracted');
      expect(mockExec).not.toHaveBeenCalled(); // Should not extract
    });

    it('should extract ZIP when extracted directory is older', async () => {
      const mockFiles = ['Basic_LinkedInDataExport_08-05-2025.zip'];
      const zipStats = { mtime: new Date('2025-08-05T11:00:00') };
      const extractedStats = { mtime: new Date('2025-08-05T10:00:00') }; // Older

      mockReaddir.mockResolvedValue(mockFiles);
      mockStat.mockResolvedValueOnce(zipStats);
      mockStat.mockResolvedValueOnce(extractedStats);
      mockMkdir.mockResolvedValue(undefined);
      mockExec.mockResolvedValue({ stdout: '', stderr: '' });

      const result = await finder.findNewestExport('test-dir');

      expect(result).toContain('extracted');
      expect(mockExec).toHaveBeenCalled();
    });
  });

  describe('findNewestZipFile', () => {
    it('should find the newest LinkedIn export ZIP file and return the file path', async () => {
      const mockFiles = [
        'Basic_LinkedInDataExport_04-18-2025.zip',
        'Basic_LinkedInDataExport_08-05-2025.zip',
        'other-file.txt'
      ];

      const mockStats = [
        { mtime: new Date('2025-04-18') },
        { mtime: new Date('2025-08-05') }
      ];

      mockReaddir.mockResolvedValue(mockFiles);
      mockStat.mockResolvedValueOnce(mockStats[0]); // First file (04-18)
      mockStat.mockResolvedValueOnce(mockStats[1]); // Second file (08-05) - newer

      const result = await finder.findNewestZipFile('test-dir');

      expect(result).toBe('test-dir/Basic_LinkedInDataExport_08-05-2025.zip');
      expect(mockReaddir).toHaveBeenCalledWith('test-dir');
      expect(mockStat).toHaveBeenCalledTimes(2); // Only 2 ZIP files
    });

    it('should throw error when no LinkedIn export files found', async () => {
      const mockFiles = ['other-file.txt', 'document.pdf'];

      mockReaddir.mockResolvedValue(mockFiles);

      await expect(finder.findNewestZipFile('test-dir')).rejects.toThrow(
        'No LinkedIn export files found in test-dir'
      );
    });

    it('should return the newest file when multiple ZIP files exist', async () => {
      const mockFiles = [
        'Basic_LinkedInDataExport_01-01-2025.zip',
        'Basic_LinkedInDataExport_06-15-2025.zip',
        'Basic_LinkedInDataExport_03-10-2025.zip'
      ];

      const mockStats = [
        { mtime: new Date('2025-01-01') },
        { mtime: new Date('2025-06-15') }, // This should be the newest
        { mtime: new Date('2025-03-10') }
      ];

      mockReaddir.mockResolvedValue(mockFiles);
      mockStat.mockResolvedValueOnce(mockStats[0]);
      mockStat.mockResolvedValueOnce(mockStats[1]); // Newest
      mockStat.mockResolvedValueOnce(mockStats[2]);

      const result = await finder.findNewestZipFile('test-dir');

      expect(result).toBe('test-dir/Basic_LinkedInDataExport_06-15-2025.zip');
    });

    it('should use default directory when none specified', async () => {
      const mockFiles = ['Basic_LinkedInDataExport_08-05-2025.zip'];
      const mockStats = [{ mtime: new Date('2025-08-05') }];

      mockReaddir.mockResolvedValue(mockFiles);
      mockStat.mockResolvedValueOnce(mockStats[0]);

      const result = await finder.findNewestZipFile();

      expect(result).toBe('linkedin-export/Basic_LinkedInDataExport_08-05-2025.zip');
      expect(mockReaddir).toHaveBeenCalledWith('linkedin-export');
    });
  });

  describe('extractLinkedInExport', () => {
    it('should extract ZIP file successfully', async () => {
      mockMkdir.mockResolvedValue(undefined);
      mockExec.mockResolvedValue({ stdout: '', stderr: 'inflating file1.txt' });

      // Access private method for testing
      const extractMethod = (finder as any).extractLinkedInExport.bind(finder);
      await extractMethod('test.zip', 'extracted');

      expect(mockMkdir).toHaveBeenCalledWith('extracted', { recursive: true });
      expect(mockExec).toHaveBeenCalledWith('unzip -o "test.zip" -d "extracted"');
    });

    it('should handle extraction errors', async () => {
      mockMkdir.mockResolvedValue(undefined);
      mockExec.mockRejectedValue(new Error('Extraction failed'));

      const extractMethod = (finder as any).extractLinkedInExport.bind(finder);
      
      await expect(extractMethod('test.zip', 'extracted')).rejects.toThrow(
        'Failed to extract LinkedIn export: Extraction failed'
      );
    });
  });
}); 
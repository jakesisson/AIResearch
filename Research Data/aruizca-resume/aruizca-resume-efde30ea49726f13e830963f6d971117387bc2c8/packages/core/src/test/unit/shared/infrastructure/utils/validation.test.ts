import { join } from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdir, rm, writeFile } from 'fs/promises';
import { validateCommandLineArgs, validateEnvironment, validateLinkedInExportDirectory, validateOutputDirectory } from '../../../../../main/shared';

describe('Validation Utils', () => {
  const testDir = join(process.cwd(), 'test-validation-dir');

  beforeEach(async () => {
    try {
      await mkdir(testDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  });

  afterEach(async () => {
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('validateLinkedInExportDirectory', () => {
    it('should validate directory with all required CSV files', async () => {
      // Create required CSV files
      const requiredFiles = ['Profile.csv', 'Positions.csv', 'Education.csv', 'Skills.csv'];
      for (const file of requiredFiles) {
        await writeFile(join(testDir, file), 'header1,header2\nvalue1,value2');
      }

      // Should not throw
      await expect(validateLinkedInExportDirectory(testDir)).resolves.not.toThrow();
    });

    it('should throw error when required CSV files are missing', async () => {
      // Create only some of the required files
      await writeFile(join(testDir, 'Profile.csv'), 'header1,header2\nvalue1,value2');
      await writeFile(join(testDir, 'Positions.csv'), 'header1,header2\nvalue1,value2');
      // Missing Education.csv and Skills.csv

      await expect(validateLinkedInExportDirectory(testDir)).rejects.toThrow('Missing required LinkedIn export files');
    });

    it('should throw error when directory does not exist', async () => {
      const nonExistentDir = join(testDir, 'non-existent');
      
      await expect(validateLinkedInExportDirectory(nonExistentDir)).rejects.toThrow('LinkedIn export directory not found');
    });

    it('should throw error when all required files are missing', async () => {
      // Create some unrelated files
      await writeFile(join(testDir, 'unrelated.csv'), 'data');
      await writeFile(join(testDir, 'another.txt'), 'data');

      await expect(validateLinkedInExportDirectory(testDir)).rejects.toThrow('Missing required LinkedIn export files');
      await expect(validateLinkedInExportDirectory(testDir)).rejects.toThrow('Profile.csv, Positions.csv, Education.csv, Skills.csv');
    });
  });

  describe('validateEnvironment', () => {
    it('should validate when OPENAI_API_KEY is set', async () => {
      // Mock environment variable
      const originalKey = process.env.OPENAI_API_KEY;
      process.env.OPENAI_API_KEY = 'sk-test-key-that-is-long-enough-for-validation';
      
      try {
        await expect(validateEnvironment()).resolves.not.toThrow();
      } finally {
        // Restore original value
        process.env.OPENAI_API_KEY = originalKey;
      }
    });

    it('should throw error when OPENAI_API_KEY is not set', async () => {
      const originalKey = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;
      
      try {
        await expect(validateEnvironment()).rejects.toThrow('OpenAI API key is not set');
      } finally {
        process.env.OPENAI_API_KEY = originalKey;
      }
    });

    it('should throw error when OPENAI_API_KEY is too short', async () => {
      const originalKey = process.env.OPENAI_API_KEY;
      process.env.OPENAI_API_KEY = 'short';
      
      try {
        await expect(validateEnvironment()).rejects.toThrow('OpenAI API key appears to be invalid');
      } finally {
        process.env.OPENAI_API_KEY = originalKey;
      }
    });
  });

  describe('validateOutputDirectory', () => {
    it('should create directory if it does not exist', async () => {
      const newDir = join(testDir, 'new-output-dir');
      
      await expect(validateOutputDirectory(newDir)).resolves.not.toThrow();
      
      // Check that directory was created
      const { access } = await import('fs/promises');
      await expect(access(newDir)).resolves.not.toThrow();
    });

    it('should validate existing writable directory', async () => {
      await expect(validateOutputDirectory(testDir)).resolves.not.toThrow();
    });
  });

  describe('validateCommandLineArgs', () => {
    it('should validate absolute paths', () => {
      expect(() => validateCommandLineArgs(['/path/to/directory'])).not.toThrow();
    });

    it('should validate relative paths starting with ./', () => {
      expect(() => validateCommandLineArgs(['./path/to/directory'])).not.toThrow();
    });

    it('should validate relative paths starting with ../', () => {
      expect(() => validateCommandLineArgs(['../path/to/directory'])).not.toThrow();
    });

    it('should throw error for invalid path format', () => {
      expect(() => validateCommandLineArgs(['invalid-path'])).toThrow('Invalid path format');
    });

    it('should handle empty args', () => {
      expect(() => validateCommandLineArgs([])).not.toThrow();
    });
  });
}); 
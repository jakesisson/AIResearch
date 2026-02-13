import { describe, expect, it } from 'vitest';
import { APIError, FileSystemError, resolveErrorMessage, ValidationError } from '../../../../../main/shared';

describe('Error Message Resolution', () => {
  describe('resolveErrorMessage', () => {
    it('should resolve ValidationError for missing API key', () => {
      const error = new ValidationError(
        'OpenAI API key is not set. Please set the OPENAI_API_KEY environment variable.',
        { code: 'MISSING_API_KEY' }
      );

      const result = resolveErrorMessage(error);

      expect(result.message).toBe('OpenAI API key is not set. Please set the OPENAI_API_KEY environment variable.');
      expect(result.suggestions).toContain('1. Create a .env file in the project root');
      expect(result.suggestions).toContain('2. Add: OPENAI_API_KEY=your_api_key_here');
      expect(result.suggestions).toContain('3. Get your API key from: https://platform.openai.com/api-keys');
    });

    it('should resolve ValidationError for invalid API key', () => {
      const error = new ValidationError(
        'OpenAI API key appears to be invalid. Please check your OPENAI_API_KEY environment variable.',
        { code: 'INVALID_API_KEY' }
      );

      const result = resolveErrorMessage(error);

      expect(result.message).toBe('OpenAI API key appears to be invalid. Please check your OPENAI_API_KEY environment variable.');
      expect(result.suggestions).toContain('1. Check your OPENAI_API_KEY environment variable');
      expect(result.suggestions).toContain('2. Ensure the API key starts with "sk-" and is at least 20 characters long');
    });

    it('should resolve ValidationError for invalid path format', () => {
      const error = new ValidationError(
        'Invalid path format: invalid-path. Please provide an absolute path or relative path starting with ./ or ../',
        { code: 'INVALID_PATH_FORMAT', path: 'invalid-path' }
      );

      const result = resolveErrorMessage(error);

      expect(result.message).toContain('Invalid path format: invalid-path');
      expect(result.suggestions).toContain('1. Use absolute paths starting with /');
      expect(result.suggestions).toContain('2. Use relative paths starting with ./ or ../');
    });

    it('should resolve FileSystemError for missing LinkedIn directory', () => {
      const error = new FileSystemError(
        'LinkedIn export directory not found: test-dir. Please place your LinkedIn export ZIP file in the \'linkedin-export\' folder.',
        { code: 'LINKEDIN_DIR_NOT_FOUND', path: 'test-dir' }
      );

      const result = resolveErrorMessage(error);

      expect(result.message).toContain('LinkedIn export directory not found: test-dir');
      expect(result.suggestions).toContain('1. Export your LinkedIn data from LinkedIn');
      expect(result.suggestions).toContain('2. Place the ZIP file in the "linkedin-export" folder');
      expect(result.suggestions).toContain('3. Run: npm start');
    });

    it('should resolve FileSystemError for no LinkedIn exports', () => {
      const error = new FileSystemError(
        'No LinkedIn export ZIP files found in test-dir. Please ensure you have exported your LinkedIn data and placed the ZIP file in the \'linkedin-export\' folder.',
        { code: 'NO_LINKEDIN_EXPORTS', path: 'test-dir', availableFiles: ['other-file.txt'] }
      );

      const result = resolveErrorMessage(error);

      expect(result.message).toContain('No LinkedIn export ZIP files found in test-dir');
      expect(result.suggestions).toContain('1. Ensure your LinkedIn export ZIP file starts with "Basic_LinkedInDataExport_"');
      expect(result.suggestions).toContain('2. Place it in the "linkedin-export" folder');
    });

    it('should resolve FileSystemError for output directory creation failure', () => {
      const error = new FileSystemError(
        'Cannot create output directory: test-output. Please check your permissions.',
        { code: 'OUTPUT_DIR_CREATE_FAILED', path: 'test-output' }
      );

      const result = resolveErrorMessage(error);

      expect(result.message).toContain('Cannot create output directory: test-output');
      expect(result.suggestions).toContain('1. Check your file system permissions');
      expect(result.suggestions).toContain('2. Ensure you have write access to the project directory');
    });

    it('should resolve FileSystemError for output directory not writable', () => {
      const error = new FileSystemError(
        'Output directory is not writable: test-output. Please check your permissions.',
        { code: 'OUTPUT_DIR_NOT_WRITABLE', path: 'test-output' }
      );

      const result = resolveErrorMessage(error);

      expect(result.message).toContain('Output directory is not writable: test-output');
      expect(result.suggestions).toContain('1. Check your file system permissions');
      expect(result.suggestions).toContain('2. Ensure the output directory is writable');
    });

    it('should resolve APIError', () => {
      const error = new APIError(
        'OpenAI API request failed: Rate limit exceeded',
        { code: 'RATE_LIMIT_EXCEEDED' }
      );

      const result = resolveErrorMessage(error);

      expect(result.message).toBe('OpenAI API request failed: Rate limit exceeded');
      expect(result.suggestions).toContain('This might be due to:');
      expect(result.suggestions).toContain('- Invalid API key');
      expect(result.suggestions).toContain('- Network connectivity issues');
      expect(result.suggestions).toContain('- OpenAI API service issues');
      expect(result.suggestions).toContain('- Rate limiting (try again in a few minutes)');
    });

    it('should handle unknown error types', () => {
      const error = new Error('Some unknown error');

      const result = resolveErrorMessage(error);

      expect(result.message).toBe('Some unknown error');
      expect(result.suggestions).toEqual(['Please check the error details and try again']);
    });

    it('should handle errors without message', () => {
      const error = new Error();

      const result = resolveErrorMessage(error);

      expect(result.message).toBe('Unknown error occurred');
      expect(result.suggestions).toEqual(['Please check the error details and try again']);
    });

    it('should handle ValidationError with unknown code', () => {
      const error = new ValidationError(
        'Some validation error',
        { code: 'UNKNOWN_CODE' }
      );

      const result = resolveErrorMessage(error);

      expect(result.message).toBe('Some validation error');
      expect(result.suggestions).toEqual(['Please check your input and try again']);
    });

    it('should handle FileSystemError with unknown code', () => {
      const error = new FileSystemError(
        'Some file system error',
        { code: 'UNKNOWN_CODE' }
      );

      const result = resolveErrorMessage(error);

      expect(result.message).toBe('Some file system error');
      expect(result.suggestions).toEqual(['Please check your file system permissions and try again']);
    });
  });
}); 
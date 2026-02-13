import { beforeEach, describe, expect, it, vi } from 'vitest';
import { APIError, GracefulRecovery, ValidationError } from '../../../../../main/shared';

describe('Graceful Recovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const operation = vi.fn().mockResolvedValue('success');
      const result = await GracefulRecovery.withRetry(operation);
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(1);
      expect(result.recovered).toBe(false);
      expect(typeof result.totalTime).toBe('number');
      expect(result.totalTime).toBeGreaterThanOrEqual(0);
    });

    it('should retry and succeed on second attempt', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('temporary error'))
        .mockResolvedValue('success');
      
      const result = await GracefulRecovery.withRetry(operation, { maxRetries: 2, retryDelay: 50 });
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(2);
      expect(result.recovered).toBe(true);
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retries', async () => {
      const error = new Error('persistent error');
      const operation = vi.fn().mockRejectedValue(error);
      
      const result = await GracefulRecovery.withRetry(operation, { maxRetries: 2, retryDelay: 50 });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(error);
      expect(result.attempts).toBe(3);
      expect(result.recovered).toBe(false);
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should not retry validation errors', async () => {
      const error = new ValidationError('validation failed');
      const operation = vi.fn().mockRejectedValue(error);
      
      const result = await GracefulRecovery.withRetry(operation, { maxRetries: 3 });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(error);
      expect(result.attempts).toBe(1);
      expect(result.recovered).toBe(false);
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should handle timeout errors', async () => {
      const operation = vi.fn().mockImplementation(() => 
        new Promise((_, reject) => setTimeout(() => reject(new Error('Operation timeout')), 100))
      );
      
      const result = await GracefulRecovery.withRetry(operation, { timeout: 50, retryDelay: 50 });
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Operation timeout');
      expect(result.attempts).toBe(1);
      expect(result.recovered).toBe(false);
    });

    it('should use exponential backoff', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('error 1'))
        .mockRejectedValueOnce(new Error('error 2'))
        .mockResolvedValue('success');
      
      const startTime = Date.now();
      const result = await GracefulRecovery.withRetry(operation, { maxRetries: 3, retryDelay: 100 });
      const endTime = Date.now();
      
      expect(result.success).toBe(true);
      expect(result.attempts).toBe(3);
      expect(result.recovered).toBe(true);
      expect(endTime - startTime).toBeGreaterThan(300); // At least 100 + 200ms delay
    });
  });

  describe('withAPIRecovery', () => {
    it('should handle rate limit errors with exponential backoff', async () => {
      const rateLimitError = new Error('rate limit exceeded') as any;
      rateLimitError.status = 429;
      
      const operation = vi.fn()
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValue('success');
      
      const startTime = Date.now();
      const result = await GracefulRecovery.withAPIRecovery(operation, { maxRetries: 2, retryDelay: 100 });
      const endTime = Date.now();
      
      expect(result.success).toBe(true);
      expect(result.attempts).toBe(2);
      expect(result.recovered).toBe(true);
      expect(endTime - startTime).toBeGreaterThan(100);
    });

    it('should handle transient API errors', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce({ message: 'network error', code: 'ECONNRESET' })
        .mockResolvedValue('success');
      
      const result = await GracefulRecovery.withAPIRecovery(operation, { maxRetries: 2, retryDelay: 100 });
      
      expect(result.success).toBe(true);
      expect(result.attempts).toBe(2);
      expect(result.recovered).toBe(true);
    });

    it('should not retry timeout errors', async () => {
      const operation = vi.fn().mockImplementation(() => 
        new Promise((_, reject) => setTimeout(() => reject(new Error('API timeout')), 100))
      );
      
      const result = await GracefulRecovery.withAPIRecovery(operation, { timeout: 50 });
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('API timeout');
      expect(result.attempts).toBe(1);
    });
  });

  describe('withFileSystemRecovery', () => {
    it('should retry file system operations', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('file busy'))
        .mockResolvedValue('file content');
      
      const result = await GracefulRecovery.withFileSystemRecovery(operation, { maxRetries: 2, retryDelay: 50 });
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('file content');
      expect(result.attempts).toBe(2);
      expect(result.recovered).toBe(true);
    });
  });

  describe('withLinkedInRecovery', () => {
    it('should retry LinkedIn parsing operations', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('parsing failed'))
        .mockResolvedValue({ parsed: true });
      
      const result = await GracefulRecovery.withLinkedInRecovery(operation, { maxRetries: 2, retryDelay: 50 });
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ parsed: true });
      expect(result.attempts).toBe(2);
      expect(result.recovered).toBe(true);
    });
  });

  describe('withResumeGenerationRecovery', () => {
    it('should retry resume generation operations', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('generation failed'))
        .mockResolvedValue({ resume: 'generated' });
      
      const result = await GracefulRecovery.withResumeGenerationRecovery(operation, { maxRetries: 2, retryDelay: 50 });
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ resume: 'generated' });
      expect(result.attempts).toBe(2);
      expect(result.recovered).toBe(true);
    });
  });

  describe('Error Detection', () => {
    it('should detect rate limit errors', async () => {
      const operation = vi.fn().mockRejectedValue({ message: 'rate limit exceeded' });
      const result = await GracefulRecovery.withAPIRecovery(operation, { maxRetries: 0 });
      expect(result.attempts).toBe(1);
    });

    it('should detect transient API errors', async () => {
      const operation = vi.fn().mockRejectedValue({ message: 'network error' });
      const result = await GracefulRecovery.withAPIRecovery(operation, { maxRetries: 0 });
      expect(result.attempts).toBe(1);
    });

    it('should detect timeout errors', async () => {
      const operation = vi.fn().mockRejectedValue({ message: 'timeout', code: 'ETIMEDOUT' });
      const result = await GracefulRecovery.withRetry(operation, { maxRetries: 0 });
      expect(result.attempts).toBe(1);
    });
  });

  describe('Performance', () => {
    it('should complete quickly for successful operations', async () => {
      const operation = vi.fn().mockResolvedValue('success');
      const startTime = Date.now();
      
      const result = await GracefulRecovery.withRetry(operation, { retryDelay: 50, timeout: 1000 });
      const endTime = Date.now();
      
      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(100); // Should complete quickly
    });

    it('should respect timeout limits', async () => {
      const operation = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve('success'), 200))
      );
      
      const startTime = Date.now();
      const result = await GracefulRecovery.withRetry(operation, { timeout: 50 });
      const endTime = Date.now();
      
      expect(result.success).toBe(false);
      expect(endTime - startTime).toBeLessThan(200); // Should timeout within reasonable time
    });
  });
}); 
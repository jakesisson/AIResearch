import { APIError, FileSystemError, LinkedInParseError, ResumeGenerationError, ValidationError } from './errors';

export interface RecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
  timeout?: number;
}

export interface RecoveryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  recovered: boolean;
  totalTime: number;
}

export class GracefulRecovery {
  private static defaultOptions: Required<RecoveryOptions> = {
    maxRetries: 3,
    retryDelay: 500, // Reduced from 1000ms
    backoffMultiplier: 2,
    timeout: 10000 // Reduced from 30000ms
  };

  /**
   * Generic retry mechanism with exponential backoff
   */
  static async withRetry<T>(operation: () => Promise<T>, options: RecoveryOptions = {}): Promise<RecoveryResult<T>> {
    const opts = { ...this.defaultOptions, ...options };
    const startTime = Date.now();
    let lastError: Error;

    for (let attempt = 1; attempt <= opts.maxRetries + 1; attempt++) {
      try {
        const data = await Promise.race([
          operation(),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Operation timeout')), opts.timeout)
          )
        ]);

        return {
          success: true,
          data,
          attempts: attempt,
          recovered: attempt > 1,
          totalTime: Date.now() - startTime
        };
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on validation errors or timeouts
        if (error instanceof ValidationError || this.isTimeoutError(error)) {
          return {
            success: false,
            error: lastError,
            attempts: attempt,
            recovered: false,
            totalTime: Date.now() - startTime
          };
        }

        // Don't retry if we've reached max attempts
        if (attempt > opts.maxRetries) {
          return {
            success: false,
            error: lastError,
            attempts: attempt,
            recovered: false,
            totalTime: Date.now() - startTime
          };
        }

        // Calculate delay with exponential backoff
        const delay = opts.retryDelay * Math.pow(opts.backoffMultiplier, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return {
      success: false,
      error: lastError!,
      attempts: opts.maxRetries + 1,
      recovered: false,
      totalTime: Date.now() - startTime
    };
  }

  /**
   * File system operations with recovery
   */
  static async withFileSystemRecovery<T>(operation: () => Promise<T>, options: RecoveryOptions = {}): Promise<RecoveryResult<T>> {
    return this.withRetry(operation, options);
  }

  /**
   * API operations with specific error handling
   */
  static async withAPIRecovery<T>(operation: () => Promise<T>, options: RecoveryOptions = {}): Promise<RecoveryResult<T>> {
    const opts = { ...this.defaultOptions, ...options };
    const startTime = Date.now();
    let lastError: Error;

    for (let attempt = 1; attempt <= opts.maxRetries + 1; attempt++) {
      try {
        const data = await Promise.race([
          operation(),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('API timeout')), opts.timeout)
          )
        ]);

        return {
          success: true,
          data,
          attempts: attempt,
          recovered: attempt > 1,
          totalTime: Date.now() - startTime
        };
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on validation errors or timeouts
        if (error instanceof ValidationError || this.isTimeoutError(error)) {
          return {
            success: false,
            error: lastError,
            attempts: attempt,
            recovered: false,
            totalTime: Date.now() - startTime
          };
        }

        // Handle rate limiting with exponential backoff
        if (this.isRateLimitError(error)) {
          if (attempt <= opts.maxRetries) {
            const waitTime = this.calculateRateLimitWaitTime(error, attempt);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          } else {
            return {
              success: false,
              error: lastError,
              attempts: attempt,
              recovered: false,
              totalTime: Date.now() - startTime
            };
          }
        }

        // Handle transient API errors
        if (this.isTransientAPIError(error)) {
          if (attempt <= opts.maxRetries) {
            const delay = opts.retryDelay * Math.pow(opts.backoffMultiplier, attempt - 1);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          } else {
            return {
              success: false,
              error: lastError,
              attempts: attempt,
              recovered: false,
              totalTime: Date.now() - startTime
            };
          }
        }

        // Don't retry if we've reached max attempts
        if (attempt > opts.maxRetries) {
          return {
            success: false,
            error: lastError,
            attempts: attempt,
            recovered: false,
            totalTime: Date.now() - startTime
          };
        }
      }
    }

    return {
      success: false,
      error: lastError!,
      attempts: opts.maxRetries + 1,
      recovered: false,
      totalTime: Date.now() - startTime
    };
  }

  /**
   * LinkedIn parsing operations with recovery
   */
  static async withLinkedInRecovery<T>(operation: () => Promise<T>, options: RecoveryOptions = {}): Promise<RecoveryResult<T>> {
    return this.withRetry(operation, options);
  }

  /**
   * Resume generation operations with recovery
   */
  static async withResumeGenerationRecovery<T>(operation: () => Promise<T>, options: RecoveryOptions = {}): Promise<RecoveryResult<T>> {
    return this.withRetry(operation, options);
  }

  /**
   * Check if error is a timeout error
   */
  private static isTimeoutError(error: any): boolean {
    return error.message?.includes('timeout') || 
           error.message?.includes('ETIMEDOUT') ||
           error.code === 'ETIMEDOUT';
  }

  /**
   * Check if error is a rate limit error
   */
  private static isRateLimitError(error: any): boolean {
    return error.message?.includes('rate limit') ||
           error.message?.includes('429') ||
           error.status === 429 ||
           error.code === 'RATE_LIMIT_EXCEEDED';
  }

  /**
   * Check if error is a transient API error
   */
  private static isTransientAPIError(error: any): boolean {
    return error.message?.includes('network') ||
           error.message?.includes('connection') ||
           error.status >= 500 ||
           error.code === 'ECONNRESET' ||
           error.code === 'ETIMEDOUT';
  }

  /**
   * Calculate wait time for rate limit errors
   */
  private static calculateRateLimitWaitTime(error: any, attempt: number): number {
    // Try to extract retry-after header or use exponential backoff
    const retryAfter = error.headers?.['retry-after'] || error.headers?.['Retry-After'];
    if (retryAfter) {
      return parseInt(retryAfter) * 1000;
    }
    
    // Default exponential backoff for rate limits
    return Math.min(500 * Math.pow(2, attempt), 30000); // Max 30 seconds
  }

  /**
   * Check if error is non-retryable
   */
  private static isNonRetryableError(error: any): boolean {
    return error instanceof ValidationError ||
           this.isTimeoutError(error) ||
           error.message?.includes('permission denied') ||
           error.message?.includes('not found');
  }
} 
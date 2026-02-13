export interface PerformanceMetric {
  operation: string;
  duration: number;
  memoryUsage?: number;
  timestamp: number;
  success: boolean;
  error?: string;
}

export interface PerformanceStats {
  totalOperations: number;
  averageDuration: number;
  totalDuration: number;
  successRate: number;
  memoryPeak: number;
  operations: PerformanceMetric[];
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private startTime: number = Date.now();
  private memoryPeak: number = 0;

  /**
   * Track the performance of an async operation
   */
  async trackOperation<T>(
    operation: string, 
    fn: () => Promise<T>,
    options: { logToConsole?: boolean } = {}
  ): Promise<T> {
    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;
    const timestamp = Date.now();

    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      const endMemory = process.memoryUsage().heapUsed;
      const memoryUsage = endMemory - startMemory;

      this.memoryPeak = Math.max(this.memoryPeak, endMemory);

      const metric: PerformanceMetric = {
        operation,
        duration,
        memoryUsage,
        timestamp,
        success: true
      };

      this.metrics.push(metric);

      if (options.logToConsole) {
        console.log(`⏱️  ${operation}: ${duration.toFixed(2)}ms (${(memoryUsage / 1024 / 1024).toFixed(2)}MB)`);
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      const endMemory = process.memoryUsage().heapUsed;
      const memoryUsage = endMemory - startMemory;

      this.memoryPeak = Math.max(this.memoryPeak, endMemory);

      const metric: PerformanceMetric = {
        operation,
        duration,
        memoryUsage,
        timestamp,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      this.metrics.push(metric);

      if (options.logToConsole) {
        console.log(`❌ ${operation}: ${duration.toFixed(2)}ms (${(memoryUsage / 1024 / 1024).toFixed(2)}MB) - FAILED`);
      }

      throw error;
    }
  }

  /**
   * Track the performance of a synchronous operation
   */
  trackSyncOperation<T>(
    operation: string, 
    fn: () => T,
    options: { logToConsole?: boolean } = {}
  ): T {
    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;
    const timestamp = Date.now();

    try {
      const result = fn();
      const duration = performance.now() - startTime;
      const endMemory = process.memoryUsage().heapUsed;
      const memoryUsage = endMemory - startMemory;

      this.memoryPeak = Math.max(this.memoryPeak, endMemory);

      const metric: PerformanceMetric = {
        operation,
        duration,
        memoryUsage,
        timestamp,
        success: true
      };

      this.metrics.push(metric);

      if (options.logToConsole) {
        console.log(`⏱️  ${operation}: ${duration.toFixed(2)}ms (${(memoryUsage / 1024 / 1024).toFixed(2)}MB)`);
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      const endMemory = process.memoryUsage().heapUsed;
      const memoryUsage = endMemory - startMemory;

      this.memoryPeak = Math.max(this.memoryPeak, endMemory);

      const metric: PerformanceMetric = {
        operation,
        duration,
        memoryUsage,
        timestamp,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      this.metrics.push(metric);

      if (options.logToConsole) {
        console.log(`❌ ${operation}: ${duration.toFixed(2)}ms (${(memoryUsage / 1024 / 1024).toFixed(2)}MB) - FAILED`);
      }

      throw error;
    }
  }

  /**
   * Get performance statistics
   */
  getStats(): PerformanceStats {
    const successfulOperations = this.metrics.filter(m => m.success);
    const failedOperations = this.metrics.filter(m => !m.success);
    
    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    const averageDuration = this.metrics.length > 0 ? totalDuration / this.metrics.length : 0;
    const successRate = this.metrics.length > 0 ? successfulOperations.length / this.metrics.length : 0;

    return {
      totalOperations: this.metrics.length,
      averageDuration,
      totalDuration,
      successRate,
      memoryPeak: this.memoryPeak,
      operations: [...this.metrics]
    };
  }

  /**
   * Get performance summary for console output
   */
  getSummary(): string {
    const stats = this.getStats();
    const totalTime = Date.now() - this.startTime;
    const memoryPeakMB = (stats.memoryPeak / 1024 / 1024).toFixed(2);
    
    const summary = [
      '📊 Performance Summary:',
      `  Total Operations: ${stats.totalOperations}`,
      `  Average Duration: ${stats.averageDuration.toFixed(2)}ms`,
      `  Total Duration: ${stats.totalDuration.toFixed(2)}ms`,
      `  Success Rate: ${(stats.successRate * 100).toFixed(1)}%`,
      `  Memory Peak: ${memoryPeakMB}MB`,
      `  Total Time: ${(totalTime / 1000).toFixed(2)}s`
    ];

    return summary.join('\n');
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.startTime = Date.now();
    this.memoryPeak = 0;
  }

  /**
   * Get metrics for a specific operation
   */
  getOperationMetrics(operation: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.operation === operation);
  }

  /**
   * Get slowest operations
   */
  getSlowestOperations(limit: number = 5): PerformanceMetric[] {
    return [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor(); 
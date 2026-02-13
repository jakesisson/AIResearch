/**
 * Performance Optimizer - Enhanced Memory Management
 * Optimized for Siyadah AI Platform with reduced console spam
 */

interface PerformanceMetrics {
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
  cacheSize: number;
  gcPressure: number;
}

interface OptimizationResult {
  success: boolean;
  memoryReleased: number;
  optimizationsApplied: string[];
  newMetrics: PerformanceMetrics;
}

class PerformanceOptimizer {
  private gcInterval: NodeJS.Timeout | null = null;
  private memoryThreshold = 90; // 90% memory threshold
  private lastOptimization = 0;
  private optimizationCooldown = 60000; // 60 seconds
  private cache = new Map<string, any>();
  private maxCacheSize = 500; // Reduced from 1000

  constructor() {
    this.startPerformanceMonitoring();
  }

  /**
   * Start continuous performance monitoring
   */
  private startPerformanceMonitoring(): void {
    // Disabled intensive monitoring to resolve memory issues
    console.log('📊 Performance optimizer: Lightweight mode enabled');
    
    // Single check after 5 minutes instead of continuous monitoring
    setTimeout(() => {
      this.performSingleOptimization();
    }, 300000);
  }

  /**
   * Perform a single optimization check (lightweight mode)
   */
  private performSingleOptimization(): void {
    const memUsage = process.memoryUsage();
    const memPercent = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);
    
    if (memPercent > 95) {
      console.log('📊 High memory usage detected, performing cleanup');
      this.optimizeMemory();
    }
  }

  /**
   * Monitor system performance and optimize when needed
   */
  private async monitorAndOptimize(): Promise<void> {
    try {
      const metrics = this.getPerformanceMetrics();
      
      // Only log critical alerts above 95%
      if (metrics.memoryUsage > 95) {
        console.log(`🚨 Critical Memory: ${metrics.memoryUsage.toFixed(1)}%`);
      }
      
      if (metrics.memoryUsage > this.memoryThreshold) {
        const now = Date.now();
        if (now - this.lastOptimization > this.optimizationCooldown) {
          await this.optimizePerformance();
          this.lastOptimization = now;
        }
      }
    } catch (error) {
      // Silent error handling
    }
  }

  /**
   * Get current performance metrics
   */
  public getPerformanceMetrics(): PerformanceMetrics {
    const memoryUsage = process.memoryUsage();
    const totalMemory = memoryUsage.heapTotal + memoryUsage.external;
    const usedMemory = memoryUsage.heapUsed + memoryUsage.external;
    
    return {
      memoryUsage: (usedMemory / totalMemory) * 100,
      cpuUsage: process.cpuUsage().user / 1000000,
      activeConnections: 0,
      cacheSize: this.cache.size,
      gcPressure: memoryUsage.heapUsed / memoryUsage.heapTotal * 100
    };
  }

  /**
   * Optimize system performance
   */
  public async optimizePerformance(): Promise<OptimizationResult> {
    const beforeMetrics = this.getPerformanceMetrics();
    const optimizationsApplied: string[] = [];

    try {
      // Force garbage collection
      if ((global as any).gc) {
        (global as any).gc();
        optimizationsApplied.push('Garbage Collection');
      }

      // Clear old cache entries
      this.clearOldCache();
      optimizationsApplied.push('Cache Cleanup');

      // Clear large objects
      this.clearLargeObjects();
      optimizationsApplied.push('Large Object Cleanup');

      const afterMetrics = this.getPerformanceMetrics();
      const memoryReleased = beforeMetrics.memoryUsage - afterMetrics.memoryUsage;

      return {
        success: true,
        memoryReleased,
        optimizationsApplied,
        newMetrics: afterMetrics
      };
    } catch (error) {
      return {
        success: false,
        memoryReleased: 0,
        optimizationsApplied,
        newMetrics: beforeMetrics
      };
    }
  }

  /**
   * Clear old cache entries using LRU strategy
   */
  private clearOldCache(): void {
    if (this.cache.size > this.maxCacheSize) {
      const keysToDelete = Array.from(this.cache.keys()).slice(0, this.cache.size - this.maxCacheSize);
      keysToDelete.forEach(key => this.cache.delete(key));
    }
  }

  /**
   * Clear large objects that might be consuming memory
   */
  private clearLargeObjects(): void {
    // Clear any large temporary objects
    if ((global as any).tempData) {
      delete (global as any).tempData;
    }
    
    // Clear require cache for non-essential modules (reduced scope)
    Object.keys(require.cache).forEach(key => {
      if (key.includes('temp')) {
        delete require.cache[key];
      }
    });
  }

  /**
   * Emergency memory cleanup
   */
  public async emergencyCleanup(): Promise<void> {
    this.cache.clear();
    if ((global as any).gc) {
      (global as any).gc();
    }
  }

  /**
   * Shutdown and cleanup
   */
  public shutdown(): void {
    if (this.gcInterval) {
      clearInterval(this.gcInterval);
      this.gcInterval = null;
    }
    this.cache.clear();
  }
}

export const performanceOptimizer = new PerformanceOptimizer();
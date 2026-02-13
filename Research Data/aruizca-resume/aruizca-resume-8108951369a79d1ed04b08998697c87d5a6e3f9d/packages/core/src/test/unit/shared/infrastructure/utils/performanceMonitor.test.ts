import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PerformanceMonitor } from '../../../../../main/shared';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
  });

  describe('trackOperation', () => {
    it('should track successful async operations', async () => {
      const mockOperation = vi.fn().mockResolvedValue('success');
      
      const result = await monitor.trackOperation('test-operation', mockOperation);
      
      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledOnce();
      
      const stats = monitor.getStats();
      expect(stats.totalOperations).toBe(1);
      expect(stats.successRate).toBe(1);
      expect(stats.operations[0].operation).toBe('test-operation');
      expect(stats.operations[0].success).toBe(true);
    });

    it('should track failed async operations', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('test error'));
      
      await expect(monitor.trackOperation('test-operation', mockOperation)).rejects.toThrow('test error');
      
      const stats = monitor.getStats();
      expect(stats.totalOperations).toBe(1);
      expect(stats.successRate).toBe(0);
      expect(stats.operations[0].operation).toBe('test-operation');
      expect(stats.operations[0].success).toBe(false);
      expect(stats.operations[0].error).toBe('test error');
    });

    it('should track operation duration', async () => {
      const mockOperation = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve('success'), 100))
      );
      
      await monitor.trackOperation('test-operation', mockOperation);
      
      const stats = monitor.getStats();
      expect(stats.operations[0].duration).toBeGreaterThan(90);
      expect(stats.operations[0].duration).toBeLessThan(200);
    });
  });

  describe('trackSyncOperation', () => {
    it('should track successful sync operations', () => {
      const mockOperation = vi.fn().mockReturnValue('success');
      
      const result = monitor.trackSyncOperation('test-sync-operation', mockOperation);
      
      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledOnce();
      
      const stats = monitor.getStats();
      expect(stats.totalOperations).toBe(1);
      expect(stats.successRate).toBe(1);
      expect(stats.operations[0].operation).toBe('test-sync-operation');
      expect(stats.operations[0].success).toBe(true);
    });

    it('should track failed sync operations', () => {
      const mockOperation = vi.fn().mockImplementation(() => {
        throw new Error('sync error');
      });
      
      expect(() => monitor.trackSyncOperation('test-sync-operation', mockOperation)).toThrow('sync error');
      
      const stats = monitor.getStats();
      expect(stats.totalOperations).toBe(1);
      expect(stats.successRate).toBe(0);
      expect(stats.operations[0].operation).toBe('test-sync-operation');
      expect(stats.operations[0].success).toBe(false);
      expect(stats.operations[0].error).toBe('sync error');
    });
  });

  describe('getStats', () => {
    it('should return correct statistics for multiple operations', async () => {
      const mockSuccess = vi.fn().mockResolvedValue('success');
      const mockFailure = vi.fn().mockRejectedValue(new Error('failure'));
      
      await monitor.trackOperation('success-op', mockSuccess);
      await monitor.trackOperation('success-op-2', mockSuccess);
      await expect(monitor.trackOperation('failure-op', mockFailure)).rejects.toThrow();
      
      const stats = monitor.getStats();
      expect(stats.totalOperations).toBe(3);
      expect(stats.successRate).toBe(2/3);
      expect(stats.operations.length).toBe(3);
    });

    it('should return zero statistics for empty monitor', () => {
      const stats = monitor.getStats();
      expect(stats.totalOperations).toBe(0);
      expect(stats.averageDuration).toBe(0);
      expect(stats.totalDuration).toBe(0);
      expect(stats.successRate).toBe(0);
      expect(stats.memoryPeak).toBe(0);
    });
  });

  describe('getSummary', () => {
    it('should return formatted summary string', async () => {
      const mockOperation = vi.fn().mockResolvedValue('success');
      await monitor.trackOperation('test-operation', mockOperation);
      
      const summary = monitor.getSummary();
      
      expect(summary).toContain('📊 Performance Summary:');
      expect(summary).toContain('Total Operations: 1');
      expect(summary).toContain('Success Rate: 100.0%');
      expect(summary).toContain('Memory Peak:');
    });
  });

  describe('clear', () => {
    it('should clear all metrics', async () => {
      const mockOperation = vi.fn().mockResolvedValue('success');
      await monitor.trackOperation('test-operation', mockOperation);
      
      expect(monitor.getStats().totalOperations).toBe(1);
      
      monitor.clear();
      
      expect(monitor.getStats().totalOperations).toBe(0);
    });
  });

  describe('getOperationMetrics', () => {
    it('should return metrics for specific operation', async () => {
      const mockOperation = vi.fn().mockResolvedValue('success');
      await monitor.trackOperation('test-operation', mockOperation);
      await monitor.trackOperation('test-operation', mockOperation);
      await monitor.trackOperation('other-operation', mockOperation);
      
      const metrics = monitor.getOperationMetrics('test-operation');
      expect(metrics.length).toBe(2);
      expect(metrics.every(m => m.operation === 'test-operation')).toBe(true);
    });
  });

  describe('getSlowestOperations', () => {
    it('should return slowest operations in descending order', async () => {
      const mockFast = vi.fn().mockResolvedValue('fast');
      const mockSlow = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve('slow'), 50))
      );
      
      await monitor.trackOperation('fast-operation', mockFast);
      await monitor.trackOperation('slow-operation', mockSlow);
      
      const slowest = monitor.getSlowestOperations(2);
      expect(slowest.length).toBe(2);
      expect(slowest[0].operation).toBe('slow-operation');
      expect(slowest[1].operation).toBe('fast-operation');
    });
  });
}); 
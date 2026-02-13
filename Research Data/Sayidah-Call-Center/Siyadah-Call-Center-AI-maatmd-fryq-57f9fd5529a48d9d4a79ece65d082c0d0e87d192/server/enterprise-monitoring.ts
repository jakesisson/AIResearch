import { Request, Response } from 'express';
import os from 'os';
import mongoose from 'mongoose';

interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number;
    cores: number;
    loadAverage: number[];
  };
  memory: {
    total: number;
    used: number;
    free: number;
    percentage: number;
  };
  database: {
    connections: number;
    responseTime: number;
    operations: number;
  };
  application: {
    uptime: number;
    requests: number;
    errors: number;
    responseTime: number;
  };
}

class EnterpriseMonitoring {
  private metrics: SystemMetrics[] = [];
  private startTime: number = Date.now();
  private requestCount: number = 0;
  private errorCount: number = 0;
  private responseTimes: number[] = [];

  // Collect system metrics
  collectSystemMetrics(): SystemMetrics {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    return {
      timestamp: new Date(),
      cpu: {
        usage: this.getCpuUsage(),
        cores: os.cpus().length,
        loadAverage: os.loadavg()
      },
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        percentage: (usedMem / totalMem) * 100
      },
      database: {
        connections: mongoose.connection.readyState,
        responseTime: this.getDatabaseResponseTime(),
        operations: this.getDatabaseOperations()
      },
      application: {
        uptime: Date.now() - this.startTime,
        requests: this.requestCount,
        errors: this.errorCount,
        responseTime: this.getAverageResponseTime()
      }
    };
  }

  // Monitor middleware
  monitoringMiddleware() {
    return (req: Request, res: Response, next: any) => {
      const startTime = Date.now();
      this.requestCount++;

      res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        this.responseTimes.push(responseTime);
        
        if (res.statusCode >= 400) {
          this.errorCount++;
        }

        // Alert on slow responses
        if (responseTime > 1000) {
          this.sendAlert('Slow Response', `Request took ${responseTime}ms: ${req.method} ${req.url}`);
        }

        // Keep only last 1000 response times
        if (this.responseTimes.length > 1000) {
          this.responseTimes = this.responseTimes.slice(-1000);
        }
      });

      next();
    };
  }

  // Health check endpoint
  healthCheck() {
    return async (req: Request, res: Response) => {
      try {
        const metrics = this.collectSystemMetrics();
        const health = this.assessHealth(metrics);

        res.json({
          status: health.overall,
          timestamp: new Date().toISOString(),
          metrics: {
            cpu: `${metrics.cpu.usage}%`,
            memory: `${metrics.memory.percentage.toFixed(1)}%`,
            database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            uptime: `${Math.round(metrics.application.uptime / 1000 / 60)} minutes`,
            requests: metrics.application.requests,
            errors: metrics.application.errors,
            errorRate: `${((metrics.application.errors / metrics.application.requests) * 100).toFixed(2)}%`
          },
          checks: health.checks,
          alerts: health.alerts
        });
      } catch (error) {
        res.status(500).json({
          status: 'unhealthy',
          error: 'Health check failed',
          timestamp: new Date().toISOString()
        });
      }
    };
  }

  // Performance metrics endpoint
  performanceMetrics() {
    return (req: Request, res: Response) => {
      const metrics = this.collectSystemMetrics();
      
      res.json({
        current: metrics,
        trends: this.calculateTrends(),
        recommendations: this.getRecommendations(metrics)
      });
    };
  }

  // Assess system health
  private assessHealth(metrics: SystemMetrics) {
    const checks = {
      cpu: metrics.cpu.usage < 80,
      memory: metrics.memory.percentage < 85,
      database: mongoose.connection.readyState === 1,
      errorRate: (metrics.application.errors / metrics.application.requests) < 0.01,
      responseTime: metrics.application.responseTime < 500
    };

    const alerts = [];
    if (!checks.cpu) alerts.push('High CPU usage detected');
    if (!checks.memory) alerts.push('High memory usage detected');
    if (!checks.database) alerts.push('Database connection issues');
    if (!checks.errorRate) alerts.push('High error rate detected');
    if (!checks.responseTime) alerts.push('Slow response times detected');

    const overall = Object.values(checks).every(check => check) ? 'healthy' : 'warning';

    return { overall, checks, alerts };
  }

  // Calculate performance trends
  private calculateTrends() {
    if (this.metrics.length < 2) return null;

    const recent = this.metrics.slice(-10);
    const cpuTrend = this.calculateTrend(recent.map(m => m.cpu.usage));
    const memoryTrend = this.calculateTrend(recent.map(m => m.memory.percentage));
    const responseTrend = this.calculateTrend(recent.map(m => m.application.responseTime));

    return {
      cpu: cpuTrend > 0 ? 'increasing' : cpuTrend < 0 ? 'decreasing' : 'stable',
      memory: memoryTrend > 0 ? 'increasing' : memoryTrend < 0 ? 'decreasing' : 'stable',
      responseTime: responseTrend > 0 ? 'increasing' : responseTrend < 0 ? 'decreasing' : 'stable'
    };
  }

  // Get performance recommendations
  private getRecommendations(metrics: SystemMetrics): string[] {
    const recommendations = [];

    if (metrics.cpu.usage > 70) {
      recommendations.push('Consider CPU optimization or scaling');
    }
    if (metrics.memory.percentage > 80) {
      recommendations.push('Monitor memory usage and consider increasing memory');
    }
    if (metrics.application.responseTime > 300) {
      recommendations.push('Optimize slow queries and add caching');
    }
    if (metrics.application.errors / metrics.application.requests > 0.005) {
      recommendations.push('Investigate and fix recurring errors');
    }

    return recommendations;
  }

  // Utility methods
  private getCpuUsage(): number {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += (cpu.times as any)[type];
      }
      totalIdle += cpu.times.idle;
    });

    return 100 - ~~(100 * totalIdle / totalTick);
  }

  private getDatabaseResponseTime(): number {
    // Simple ping to measure response time
    const start = Date.now();
    return Date.now() - start; // This would be async in real implementation
  }

  private getDatabaseOperations(): number {
    // Return mock operations count - would be real metrics in production
    return Math.floor(Math.random() * 1000);
  }

  private getAverageResponseTime(): number {
    if (this.responseTimes.length === 0) return 0;
    return this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    const recent = values.slice(-5);
    const older = values.slice(-10, -5);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    return recentAvg - olderAvg;
  }

  private sendAlert(type: string, message: string) {
    console.log(`🚨 ALERT [${type}]: ${message}`);
    // In production, this would send to Slack, email, or monitoring service
  }

  // Start periodic metric collection
  startPeriodicCollection() {
    setInterval(() => {
      const metrics = this.collectSystemMetrics();
      this.metrics.push(metrics);

      // Keep only last 1000 metrics (about 16 hours at 1-minute intervals)
      if (this.metrics.length > 1000) {
        this.metrics = this.metrics.slice(-1000);
      }

      // Check for alerts
      const health = this.assessHealth(metrics);
      if (health.alerts.length > 0) {
        health.alerts.forEach(alert => this.sendAlert('System Health', alert));
      }
    }, 60000); // Collect every minute
  }
}

export const enterpriseMonitoring = new EnterpriseMonitoring();
export { EnterpriseMonitoring };
export default EnterpriseMonitoring;
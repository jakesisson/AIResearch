import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { MongoClient } from 'mongodb';

const execAsync = promisify(exec);

interface BackupConfig {
  mongodb: {
    connectionString: string;
    database: string;
  };
  storage: {
    local: {
      enabled: boolean;
      path: string;
      retention: number; // days
    };
    cloud: {
      enabled: boolean;
      provider: 'aws' | 'azure' | 'gcp';
      bucket: string;
      region: string;
    };
  };
  schedule: {
    full: string; // cron expression
    incremental: string;
    retention: {
      daily: number;
      weekly: number;
      monthly: number;
    };
  };
  encryption: {
    enabled: boolean;
    algorithm: string;
    keyFile: string;
  };
}

interface BackupMetadata {
  id: string;
  timestamp: Date;
  type: 'full' | 'incremental';
  size: number;
  checksum: string;
  collections: string[];
  encrypted: boolean;
  location: string;
  status: 'success' | 'failed' | 'in_progress';
  error?: string;
}

class BackupAutomation {
  private config: BackupConfig;
  private backupHistory: BackupMetadata[] = [];
  private isBackupRunning: boolean = false;

  constructor() {
    this.config = {
      mongodb: {
        connectionString: process.env.MONGODB_URI || 'mongodb+srv://siyada:JppPfSY7nhwOL6R6@cluster0.zabls2k.mongodb.net',
        database: 'business_automation'
      },
      storage: {
        local: {
          enabled: true,
          path: '/backups/mongodb',
          retention: 30
        },
        cloud: {
          enabled: false,
          provider: 'aws',
          bucket: 'siyadah-ai-backups',
          region: 'us-east-1'
        }
      },
      schedule: {
        full: '0 2 * * *', // Daily at 2 AM
        incremental: '0 */6 * * *', // Every 6 hours
        retention: {
          daily: 7,
          weekly: 4,
          monthly: 12
        }
      },
      encryption: {
        enabled: true,
        algorithm: 'aes-256-gcm',
        keyFile: '/secure/backup.key'
      }
    };
  }

  // Create full backup
  async createFullBackup(): Promise<BackupMetadata> {
    if (this.isBackupRunning) {
      throw new Error('نسخة احتياطية أخرى قيد التشغيل');
    }

    this.isBackupRunning = true;
    const backupId = this.generateBackupId();
    const timestamp = new Date();
    
    try {
      console.log(`🔄 بدء النسخة الاحتياطية الكاملة: ${backupId}`);
      
      // Create backup directory
      const backupPath = path.join(this.config.storage.local.path, backupId);
      await fs.mkdir(backupPath, { recursive: true });

      // Get database collections
      const collections = await this.getDatabaseCollections();
      
      // Create MongoDB dump
      const dumpPath = path.join(backupPath, 'dump');
      await this.createMongoDump(dumpPath);

      // Encrypt if enabled
      let finalPath = dumpPath;
      if (this.config.encryption.enabled) {
        finalPath = await this.encryptBackup(dumpPath, `${dumpPath}.encrypted`);
        await fs.rm(dumpPath, { recursive: true }); // Remove unencrypted version
      }

      // Calculate checksum
      const checksum = await this.calculateChecksum(finalPath);
      
      // Get backup size
      const stats = await fs.stat(finalPath);
      const size = stats.size;

      // Create metadata
      const metadata: BackupMetadata = {
        id: backupId,
        timestamp,
        type: 'full',
        size,
        checksum,
        collections,
        encrypted: this.config.encryption.enabled,
        location: finalPath,
        status: 'success'
      };

      // Upload to cloud if enabled
      if (this.config.storage.cloud.enabled) {
        await this.uploadToCloud(finalPath, backupId);
      }

      // Save metadata
      await this.saveBackupMetadata(metadata);
      this.backupHistory.push(metadata);

      // Cleanup old backups
      await this.cleanupOldBackups();

      console.log(`✅ اكتملت النسخة الاحتياطية بنجاح: ${backupId}`);
      return metadata;

    } catch (error) {
      console.error('❌ فشلت النسخة الاحتياطية:', error);
      
      const metadata: BackupMetadata = {
        id: backupId,
        timestamp,
        type: 'full',
        size: 0,
        checksum: '',
        collections: [],
        encrypted: false,
        location: '',
        status: 'failed',
        error: (error as Error).message
      };
      
      this.backupHistory.push(metadata);
      throw error;
    } finally {
      this.isBackupRunning = false;
    }
  }

  // Restore from backup
  async restoreFromBackup(backupId: string, targetDatabase?: string): Promise<void> {
    const backup = this.backupHistory.find(b => b.id === backupId);
    if (!backup) {
      throw new Error(`النسخة الاحتياطية غير موجودة: ${backupId}`);
    }

    if (backup.status !== 'success') {
      throw new Error(`النسخة الاحتياطية فاشلة: ${backupId}`);
    }

    try {
      console.log(`🔄 بدء استرجاع النسخة الاحتياطية: ${backupId}`);

      let restorePath = backup.location;

      // Decrypt if encrypted
      if (backup.encrypted) {
        const decryptedPath = `${backup.location}.decrypted`;
        restorePath = await this.decryptBackup(backup.location, decryptedPath);
      }

      // Verify checksum
      const currentChecksum = await this.calculateChecksum(restorePath);
      if (currentChecksum !== backup.checksum) {
        throw new Error('تحقق من سلامة البيانات فشل - النسخة الاحتياطية قد تكون تالفة');
      }

      // Restore MongoDB
      await this.restoreMongoDB(restorePath, targetDatabase || this.config.mongodb.database);

      // Cleanup decrypted file
      if (backup.encrypted && restorePath !== backup.location) {
        await fs.rm(restorePath, { recursive: true });
      }

      console.log(`✅ اكتمل استرجاع النسخة الاحتياطية بنجاح: ${backupId}`);

    } catch (error) {
      console.error('❌ فشل استرجاع النسخة الاحتياطية:', error);
      throw error;
    }
  }

  // Test backup integrity
  async testBackupIntegrity(backupId: string): Promise<boolean> {
    const backup = this.backupHistory.find(b => b.id === backupId);
    if (!backup) {
      return false;
    }

    try {
      // Check file exists
      await fs.access(backup.location);

      // Verify checksum
      const currentChecksum = await this.calculateChecksum(backup.location);
      if (currentChecksum !== backup.checksum) {
        console.error(`❌ تحقق من سلامة البيانات فشل للنسخة: ${backupId}`);
        return false;
      }

      // Test decrypt if encrypted
      if (backup.encrypted) {
        const testPath = `${backup.location}.test`;
        await this.decryptBackup(backup.location, testPath);
        await fs.rm(testPath, { recursive: true });
      }

      console.log(`✅ النسخة الاحتياطية سليمة: ${backupId}`);
      return true;

    } catch (error) {
      console.error(`❌ فشل اختبار سلامة النسخة: ${backupId}`, error);
      return false;
    }
  }

  // Schedule automatic backups
  setupAutomaticBackups(): void {
    const cron = require('node-cron');

    // Schedule full backup
    cron.schedule(this.config.schedule.full, async () => {
      try {
        console.log('🕐 بدء النسخة الاحتياطية المجدولة');
        await this.createFullBackup();
      } catch (error) {
        console.error('❌ فشلت النسخة الاحتياطية المجدولة:', error);
      }
    });

    // Schedule integrity checks
    cron.schedule('0 4 * * 0', async () => { // Weekly on Sunday at 4 AM
      console.log('🔍 بدء فحص سلامة النسخ الاحتياطية');
      await this.performIntegrityChecks();
    });

    console.log('⏰ تم إعداد النسخ الاحتياطية التلقائية');
  }

  // Get backup status and history
  getBackupStatus() {
    const recent = this.backupHistory.slice(-10);
    const successful = this.backupHistory.filter(b => b.status === 'success').length;
    const failed = this.backupHistory.filter(b => b.status === 'failed').length;
    const totalSize = this.backupHistory
      .filter(b => b.status === 'success')
      .reduce((sum, b) => sum + b.size, 0);

    return {
      isRunning: this.isBackupRunning,
      totalBackups: this.backupHistory.length,
      successful,
      failed,
      totalSize: this.formatBytes(totalSize),
      lastBackup: recent[recent.length - 1] || null,
      recentBackups: recent,
      nextScheduled: this.getNextScheduledBackup()
    };
  }

  // Private methods
  private generateBackupId(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const random = crypto.randomBytes(4).toString('hex');
    return `backup-${timestamp}-${random}`;
  }

  private async getDatabaseCollections(): Promise<string[]> {
    const client = new MongoClient(this.config.mongodb.connectionString);
    try {
      await client.connect();
      const db = client.db(this.config.mongodb.database);
      const collections = await db.listCollections().toArray();
      return collections.map(c => c.name);
    } finally {
      await client.close();
    }
  }

  private async createMongoDump(outputPath: string): Promise<void> {
    const uri = this.config.mongodb.connectionString;
    const database = this.config.mongodb.database;
    
    const command = `mongodump --uri="${uri}/${database}" --out="${outputPath}"`;
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('Warning')) {
      throw new Error(`MongoDB dump failed: ${stderr}`);
    }
  }

  private async restoreMongoDB(backupPath: string, targetDatabase: string): Promise<void> {
    const uri = this.config.mongodb.connectionString;
    const dumpPath = path.join(backupPath, this.config.mongodb.database);
    
    const command = `mongorestore --uri="${uri}" --db="${targetDatabase}" --drop "${dumpPath}"`;
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('Warning')) {
      throw new Error(`MongoDB restore failed: ${stderr}`);
    }
  }

  private async encryptBackup(inputPath: string, outputPath: string): Promise<string> {
    const key = await fs.readFile(this.config.encryption.keyFile);
    const algorithm = this.config.encryption.algorithm;
    
    // This is a simplified encryption - in production use proper encryption libraries
    const command = `tar -czf - "${inputPath}" | openssl enc -${algorithm} -salt -k "${key.toString()}" > "${outputPath}"`;
    await execAsync(command);
    
    return outputPath;
  }

  private async decryptBackup(inputPath: string, outputPath: string): Promise<string> {
    const key = await fs.readFile(this.config.encryption.keyFile);
    const algorithm = this.config.encryption.algorithm;
    
    const command = `openssl enc -d -${algorithm} -salt -k "${key.toString()}" < "${inputPath}" | tar -xzf - -C "$(dirname "${outputPath}")"`;
    await execAsync(command);
    
    return outputPath;
  }

  private async calculateChecksum(filePath: string): Promise<string> {
    const data = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private async uploadToCloud(filePath: string, backupId: string): Promise<void> {
    // Implementation depends on cloud provider
    console.log(`☁️ رفع للتخزين السحابي: ${backupId}`);
    // AWS S3, Azure Blob, or GCP Storage implementation would go here
  }

  private async saveBackupMetadata(metadata: BackupMetadata): Promise<void> {
    const metadataPath = path.join(this.config.storage.local.path, 'metadata.json');
    const allMetadata = [...this.backupHistory, metadata];
    await fs.writeFile(metadataPath, JSON.stringify(allMetadata, null, 2));
  }

  private async cleanupOldBackups(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.storage.local.retention);

    const oldBackups = this.backupHistory.filter(b => 
      b.timestamp < cutoffDate && b.status === 'success'
    );

    for (const backup of oldBackups) {
      try {
        await fs.rm(backup.location, { recursive: true });
        console.log(`🗑️ تم حذف النسخة القديمة: ${backup.id}`);
      } catch (error) {
        console.error(`❌ فشل حذف النسخة: ${backup.id}`, error);
      }
    }

    // Remove from history
    this.backupHistory = this.backupHistory.filter(b => !oldBackups.includes(b));
  }

  private async performIntegrityChecks(): Promise<void> {
    for (const backup of this.backupHistory.slice(-5)) { // Check last 5 backups
      const isValid = await this.testBackupIntegrity(backup.id);
      if (!isValid) {
        console.error(`⚠️ النسخة الاحتياطية تالفة: ${backup.id}`);
      }
    }
  }

  private getNextScheduledBackup(): string {
    // Calculate next scheduled backup time based on cron expression
    return 'اليوم في 2:00 صباحاً'; // Simplified
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const backupAutomation = new BackupAutomation();
export { BackupAutomation };
export default BackupAutomation;
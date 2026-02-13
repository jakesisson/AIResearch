import { exec } from 'child_process';
import { access, mkdir, readdir, stat } from 'fs/promises';
import { join } from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class LinkedInExportFinder {
  /**
   * Finds the newest LinkedIn export ZIP file
   * @param linkedInExportDir Path to the linkedin-export directory
   * @returns Path to the newest LinkedIn export ZIP file
   */
  async findNewestZipFile(linkedInExportDir: string = 'linkedin-export'): Promise<string> {
    try {
      const files = await readdir(linkedInExportDir);
      
      // Filter for LinkedIn export ZIP files
      const exportFiles = files.filter(file => 
        file.startsWith('Basic_LinkedInDataExport_') && file.endsWith('.zip')
      );
      
      if (exportFiles.length === 0) {
        throw new Error(`No LinkedIn export files found in ${linkedInExportDir}`);
      }
      
      // Get file stats to find the newest
      const fileStats = await Promise.all(
        exportFiles.map(async (file) => {
          const filePath = join(linkedInExportDir, file);
          const stats = await stat(filePath);
          return { file, stats, path: filePath };
        })
      );
      
      // Sort by modification time (newest first)
      fileStats.sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());
      
      const newestFile = fileStats[0];
      console.log(`📁 Using newest LinkedIn export: ${newestFile.file}`);
      
      return newestFile.path;
    } catch (error) {
      throw new Error(`Failed to find LinkedIn export: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Finds the newest LinkedIn export in the linkedin-export folder and extracts it
   * @param linkedInExportDir Path to the linkedin-export directory
   * @returns Path to the extracted directory of the newest export
   */
  async findNewestExport(linkedInExportDir: string = 'linkedin-export'): Promise<string> {
    try {
      const files = await readdir(linkedInExportDir);
      
      // Filter for LinkedIn export ZIP files
      const exportFiles = files.filter(file => 
        file.startsWith('Basic_LinkedInDataExport_') && file.endsWith('.zip')
      );
      
      if (exportFiles.length === 0) {
        throw new Error(`No LinkedIn export files found in ${linkedInExportDir}`);
      }
      
      // Get file stats to find the newest
      const fileStats = await Promise.all(
        exportFiles.map(async (file) => {
          const filePath = join(linkedInExportDir, file);
          const stats = await stat(filePath);
          return { file, stats, path: filePath };
        })
      );
      
      // Sort by modification time (newest first)
      fileStats.sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());
      
      const newestFile = fileStats[0];
      console.log(`📁 Using newest LinkedIn export: ${newestFile.file}`);
      
      // Create extracted directory path
      const extractedDir = join(linkedInExportDir, 'extracted');
      
      // Check if extracted directory exists and is newer than the ZIP
      try {
        const extractedStats = await stat(extractedDir);
        if (extractedStats.mtime.getTime() >= newestFile.stats.mtime.getTime()) {
          console.log(`📂 Using existing extracted data (up to date)`);
          return extractedDir;
        }
      } catch (error) {
        // Extracted directory doesn't exist, will extract
      }
      
      // Extract the newest ZIP file
      console.log(`📦 Extracting LinkedIn export...`);
      await this.extractLinkedInExport(newestFile.path, extractedDir);
      
      return extractedDir;
    } catch (error) {
      throw new Error(`Failed to find LinkedIn export: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Extracts a LinkedIn export ZIP file using system unzip command
   * @param zipPath Path to the ZIP file
   * @param extractPath Path where to extract the contents
   */
  private async extractLinkedInExport(zipPath: string, extractPath: string): Promise<void> {
    try {
      // Create extraction directory
      await mkdir(extractPath, { recursive: true });
      
      // Use system unzip command
      const command = `unzip -o "${zipPath}" -d "${extractPath}"`;
      console.log(`🔧 Running: ${command}`);
      
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr && !stderr.includes('inflating')) {
        console.warn(`⚠️  Unzip warnings: ${stderr}`);
      }
      
      console.log(`✅ LinkedIn export extracted to: ${extractPath}`);
    } catch (error) {
      throw new Error(`Failed to extract LinkedIn export: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 
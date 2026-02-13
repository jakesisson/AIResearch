import { access, readdir } from 'fs/promises';
import { join } from 'path';
import { FileSystemError, ValidationError } from '../..';

export async function validateEnvironment(): Promise<void> {
  // Azure OpenAI configuration (standardized)
  const apiKey = process.env.AZURE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  
  if (!apiKey) {
    throw new ValidationError(
      'Azure OpenAI API key is not set. Please set the AZURE_OPENAI_API_KEY (or OPENAI_API_KEY) environment variable.',
      { code: 'MISSING_API_KEY' }
    );
  }
  
  if (!endpoint) {
    throw new ValidationError(
      'Azure OpenAI endpoint is not set. Please set the AZURE_OPENAI_ENDPOINT environment variable.',
      { code: 'MISSING_ENDPOINT' }
    );
  }
  
  if (apiKey.length < 20) {
    throw new ValidationError(
      'Azure OpenAI API key appears to be invalid. Please check your AZURE_OPENAI_API_KEY environment variable.',
      { code: 'INVALID_API_KEY' }
    );
  }
}

export async function validateLinkedInExportDirectory(exportDir: string): Promise<void> {
  try {
    await access(exportDir);
  } catch (error) {
    throw new FileSystemError(
      `LinkedIn export directory not found: ${exportDir}. Please place your LinkedIn export ZIP file in the 'linkedin-export' folder.`,
      { code: 'LINKEDIN_DIR_NOT_FOUND', path: exportDir }
    );
  }

  const files = await readdir(exportDir);
  
  // Check for required CSV files that LinkedInParser expects
  const requiredFiles = ['Profile.csv', 'Positions.csv', 'Education.csv', 'Skills.csv'];
  const missingFiles = requiredFiles.filter(file => !files.includes(file));
  
  if (missingFiles.length > 0) {
    throw new FileSystemError(
      `Missing required LinkedIn export files in ${exportDir}: ${missingFiles.join(', ')}. Please ensure you have a complete LinkedIn export.`,
      { code: 'MISSING_LINKEDIN_FILES', path: exportDir, missingFiles, availableFiles: files }
    );
  }
}

export async function validateOutputDirectory(outputDir: string): Promise<void> {
  try {
    await access(outputDir);
  } catch (error) {
    // Output directory doesn't exist, try to create it
    try {
      const { mkdir } = await import('fs/promises');
      await mkdir(outputDir, { recursive: true });
    } catch (createError) {
      throw new FileSystemError(
        `Cannot create output directory: ${outputDir}. Please check your permissions.`,
        { code: 'OUTPUT_DIR_CREATE_FAILED', path: outputDir }
      );
    }
  }

  // Test write access
  try {
    const testFile = join(outputDir, '.test-write');
    const { writeFile, unlink } = await import('fs/promises');
    await writeFile(testFile, 'test');
    await unlink(testFile);
  } catch (error) {
    throw new FileSystemError(
      `Output directory is not writable: ${outputDir}. Please check your permissions.`,
      { code: 'OUTPUT_DIR_NOT_WRITABLE', path: outputDir }
    );
  }
}

export function validateCommandLineArgs(args: string[]): void {
  if (args.length > 0) {
    const customPath = args[0];
    if (!customPath.startsWith('/') && !customPath.startsWith('./') && !customPath.startsWith('../')) {
      throw new ValidationError(
        `Invalid path format: ${customPath}. Please provide an absolute path or relative path starting with ./ or ../`,
        { code: 'INVALID_PATH_FORMAT', path: customPath }
      );
    }
  }
} 
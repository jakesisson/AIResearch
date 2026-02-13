import { join } from 'path';
import { readdir } from 'fs/promises';

export async function findLatestHtmlFile(): Promise<string> {
  const outputDir = join(process.cwd(), 'output');
  
  try {
    // Read all files in the output directory
    const files = await readdir(outputDir);
    
    // Filter for HTML files with the resume naming pattern
    const htmlFiles = files.filter(file => 
      file.startsWith('resume-') && file.endsWith('.html')
    );
    
    if (htmlFiles.length === 0) {
      throw new Error('No HTML files found in output directory');
    }
    
    // Sort by date (extract date from filename) to get the latest
    htmlFiles.sort((a, b) => {
      // Extract date from filename (resume-YYYYMMDD.html)
      const dateA = a.match(/resume-(\d{8})\.html/)?.[1] || '0';
      const dateB = b.match(/resume-(\d{8})\.html/)?.[1] || '0';
      return dateB.localeCompare(dateA); // Sort descending (latest first)
    });
    
    const latestFile = htmlFiles[0];
    console.log(`📅 Found ${htmlFiles.length} HTML files, using latest: ${latestFile}`);
    
    return join(outputDir, latestFile);
  } catch (error: any) {
    throw new Error(`Error finding latest HTML file: ${error.message}`);
  }
} 
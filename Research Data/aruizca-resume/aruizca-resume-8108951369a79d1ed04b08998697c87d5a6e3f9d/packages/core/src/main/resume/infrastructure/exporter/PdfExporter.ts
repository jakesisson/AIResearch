import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { tmpdir } from 'os';
import { Resume } from '../../domain';
import { IPdfExporter, PdfOptions } from '../../domain/services/IJsonResumeExporter';
import { HtmlExporter } from './HtmlExporter';

const execAsync = promisify(exec);

/**
 * PDF exporter that transforms JSON Resume to PDF format
 * Consolidates both export and transformation functionality
 */
export class PdfExporter implements IPdfExporter {
  constructor(private htmlExporter = new HtmlExporter()) {}

  /**
   * Export a JSON resume to PDF buffer
   * @param resume The JSON resume to export
   * @param options Optional PDF generation options
   * @returns PDF as Buffer
   */
  async export(resume: Resume, options?: PdfOptions): Promise<Buffer> {
    // First export to HTML
    const html = await this.htmlExporter.export(resume);
    
    // Then export HTML to PDF buffer
    return await this.generateBuffer(html, options);
  }



  /**
   * Generate PDF as Buffer (for in-memory usage, APIs, etc.)
   */
  async generateBuffer(html: string, options?: PdfOptions): Promise<Buffer> {
    try {
      console.log(`📄 Generating PDF buffer from HTML...`);
      
      // Create temporary files with proper date format for playwright script
      const tempDir = tmpdir();
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const tempId = Date.now().toString();
      const tempHtmlPath = join(tempDir, `resume-${dateStr}.html`);
      const tempPdfPath = join(tempDir, `resume-${dateStr}.pdf`);
      
      // Write HTML to temp file
      await writeFile(tempHtmlPath, html);
      
      try {
        // Generate PDF using playwright script
        // Note: The playwright script ignores tempPdfPath and creates PDF in process.cwd()/output/resume-{date}.pdf
        await this.generatePdfWithStandaloneScript(tempHtmlPath, tempPdfPath);
        
        // The playwright script creates the PDF at process.cwd()/output/resume-{date}.pdf
        const actualPdfPath = join(process.cwd(), 'output', `resume-${dateStr}.pdf`);
        
        // Read PDF as buffer
        const pdfBuffer = await readFile(actualPdfPath);
        
        console.log(`✅ PDF buffer generated successfully`);
        return pdfBuffer;
        
      } finally {
        // Clean up temp files (ignore errors)
        try {
          const fs = await import('fs/promises');
          await fs.unlink(tempHtmlPath).catch(() => {});
          // Clean up the generated PDF file too
          const actualPdfPath = join(process.cwd(), 'output', `resume-${dateStr}.pdf`);
          await fs.unlink(actualPdfPath).catch(() => {});
        } catch {
          // Ignore cleanup errors
        }
      }
      
    } catch (error) {
      throw new Error(`Failed to generate PDF buffer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private async generatePdfWithStandaloneScript(htmlPath: string, pdfPath: string): Promise<void> {
    // Use the standalone playwright-pdf.js script to avoid bundling issues
    // The script is located in packages/core/src/main/shared/infrastructure/pdf/
    const scriptPath = join(process.cwd(), 'packages', 'core', 'src', 'main', 'shared', 'infrastructure', 'pdf', 'playwright-pdf.js');
    const command = `node "${scriptPath}" "${htmlPath}"`;
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('✅ PDF generated successfully')) {
      console.warn(`⚠️  Playwright warnings: ${stderr}`);
    }
  }
  
  private cleanHtmlForPdf(html: string): string {
    // Remove or modify the title to prevent it from appearing in PDF metadata
    // This is the only change we keep - it successfully removed the name
    let cleanHtml = html.replace(/<title>.*?<\/title>/gi, '<title></title>');
    
    return cleanHtml;
  }
}
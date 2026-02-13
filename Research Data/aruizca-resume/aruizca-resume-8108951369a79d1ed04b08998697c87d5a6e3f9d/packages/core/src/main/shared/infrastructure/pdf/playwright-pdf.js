#!/usr/bin/env node

import { writeFile, mkdir, readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function findLatestHtmlFile() {
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
  } catch (error) {
    throw new Error(`Error finding latest HTML file: ${error.message}`);
  }
}

async function generatePdfWithPlaywright(htmlPath, pdfPath) {
  // Dynamic import to avoid bundling issues
  const { chromium } = await import('playwright');
  
  const browser = await chromium.launch({
    headless: true
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport to A4 dimensions (595.28 x 841.89 points)
    await page.setViewportSize({ width: 595, height: 842 });
    
    // Load the HTML file
    await page.goto(`file://${htmlPath}`, {
      waitUntil: 'networkidle'
    });
    
    // Generate PDF with custom header and footer templates
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: '<div style="width: 100%; font-size: 10px; padding: 0 0.5in; text-align: right; color: #666; font-family: Lato, sans-serif;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
      printBackground: true,
      preferCSSPageSize: false
    });
    
  } finally {
    await browser.close();
  }
}

function cleanHtmlForPdf(html) {
  // Remove or modify the title to prevent it from appearing in PDF metadata
  // This is the only change we keep - it successfully removed the name
  let cleanHtml = html.replace(/<title>.*?<\/title>/gi, '<title></title>');
  
  // Add JavaScript to reduce font sizes by 1.6px and adjust column widths for PDF
  const pdfScript = `
    <script>
      (function() {
        // Function to reduce font size by 0.8px (less aggressive)
        function reduceFontSizes() {
          const elements = document.querySelectorAll('*');
          elements.forEach(function(el) {
            const computedStyle = window.getComputedStyle(el);
            const currentSize = parseFloat(computedStyle.fontSize);
            if (currentSize && !isNaN(currentSize)) {
              const newSize = Math.max(currentSize - 0.8, 10); // Minimum 10px for readability
              el.style.fontSize = newSize + 'px';
            }
          });
        }
        
        // Function to adjust column widths for CSS Grid layout
        function adjustColumnWidths() {
          // Target the body element which has the grid layout
          const body = document.querySelector('body');
          if (body) {
            // Override the grid template columns to achieve 15%/85% split
            body.style.gridTemplateColumns = '[full-start] 1fr [main-start side-start] 15% [side-end content-start] 85% [main-end content-end] 1fr [full-end]';
            
                         // Also add CSS to ensure the grid areas work correctly and header spans both columns, and respect page dimensions
             const style = document.createElement('style');
             style.textContent = '@media print { body { grid-template-columns: [full-start] 1fr [main-start side-start] 15% [side-end content-start] 85% [main-end content-end] 1fr [full-end] !important; max-width: 96.5% !important; overflow-x: hidden !important; } h1 { font-size: 2.5em !important; } h2 { font-size: 2em !important; } h3 { grid-column: side !important; } section { grid-column: content !important; } .masthead { grid-column: full !important; padding-top: 2em !important; padding-bottom: 2em !important; } .masthead > * { grid-column: main !important; } .masthead article { padding-right: 1em !important; } * { max-width: 96.5% !important; box-sizing: border-box !important; } }';
            document.head.appendChild(style);
          }
        }
        
        // Run when DOM is loaded
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', function() {
            reduceFontSizes();
            adjustColumnWidths();
          });
        } else {
          reduceFontSizes();
          adjustColumnWidths();
        }
        
        // Also run after a short delay to ensure all styles are applied
        setTimeout(function() {
          reduceFontSizes();
          adjustColumnWidths();
        }, 100);
      })();
    </script>
  `;
  
  // Insert the script before the closing head tag
  cleanHtml = cleanHtml.replace('</head>', `${pdfScript}</head>`);
  
  return cleanHtml;
}

async function main() {
  let htmlPath = process.argv[2];
  
  if (!htmlPath) {
    try {
      console.log('📁 No HTML file specified, finding latest resume...');
      htmlPath = await findLatestHtmlFile();
      console.log(`📄 Using latest HTML file: ${htmlPath}`);
    } catch (error) {
      console.error('❌ Error finding latest HTML file:');
      console.error('   Make sure you have generated a resume first with: npm start');
      console.error('   Or specify a specific HTML file: node playwright-pdf.js output/resume-YYYYMMDD.html');
      process.exit(1);
    }
  }
  
  try {
    console.log(`📄 Generating PDF from HTML: ${htmlPath}`);
    
    // Read the HTML file
    const html = await readFile(htmlPath, 'utf-8');
    
    // Create output directory
    const outputDir = join(process.cwd(), 'output');
    await mkdir(outputDir, { recursive: true });
    
    // Extract date from HTML filename for PDF output
    const htmlFilename = htmlPath.split('/').pop(); // Get filename from path
    const dateMatch = htmlFilename.match(/resume-(\d{8})\.html/);
    if (!dateMatch) {
      throw new Error(`Could not extract date from HTML filename: ${htmlFilename}`);
    }
    const date = dateMatch[1];
    const pdfPath = join(outputDir, `resume-${date}.pdf`);
    
    // Clean HTML
    const cleanHtml = cleanHtmlForPdf(html);
    
    // Write HTML to temporary file
    const tempHtmlPath = join(outputDir, 'temp-resume.html');
    await writeFile(tempHtmlPath, cleanHtml);
    
    try {
      console.log(`🔧 Generating PDF with custom header/footer templates...`);
      await generatePdfWithPlaywright(tempHtmlPath, pdfPath);
      console.log(`✅ PDF generated using Playwright: ${pdfPath}`);
    } catch (playwrightError) {
      console.log(`⚠️  Playwright failed: ${playwrightError.message}`);
      console.log(`⚠️  This might be due to bundling issues. Please run: npx playwright install chromium`);
      process.exit(1);
    }
    
    // Clean up temporary HTML file
    try {
      await execAsync(`rm "${tempHtmlPath}"`);
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
    
    console.log(`✅ PDF generated successfully!`);
    console.log(`PDF: ${pdfPath}`);
    
  } catch (error) {
    console.error(`❌ Error generating PDF: ${error.message}`);
    process.exit(1);
  }
}

main().catch(console.error); 
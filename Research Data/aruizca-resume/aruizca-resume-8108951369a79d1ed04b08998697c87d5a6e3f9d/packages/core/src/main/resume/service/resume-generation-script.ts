import { readFile, mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { ResumeGenerator, LinkedInExportFinder } from '../index';
import { HtmlExporter, PdfExporter } from '../infrastructure/exporter';
import { validateEnvironment, validateLinkedInExportDirectory, validateOutputDirectory, validateCommandLineArgs, resolveErrorMessage } from '../../shared';
import { Resume } from '../domain';

async function main() {
  try {
    // Validate environment and inputs
    console.log('🔍 Validating environment and inputs...');
    await validateEnvironment();
    
    const outputDir = join(process.cwd(), 'output');
    await validateOutputDirectory(outputDir);
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    const forceRefresh = args.includes('--force-refresh');
    const filteredArgs = args.filter(arg => arg !== '--force-refresh');
    
    validateCommandLineArgs(filteredArgs);
    
    const linkedInExportFinder = new LinkedInExportFinder();
    const resumeGenerator = new ResumeGenerator();
    const htmlExporter = new HtmlExporter();
    const pdfExporter = new PdfExporter();
    
    // Find LinkedIn export ZIP file
    let zipFilePath: string;
    if (filteredArgs.length > 0) {
      zipFilePath = filteredArgs[0];
      console.log(`📁 Using custom LinkedIn export ZIP: ${zipFilePath}`);
    } else {
      console.log('📁 Finding newest LinkedIn export...');
      zipFilePath = await linkedInExportFinder.findNewestZipFile();
      console.log(`📁 Found LinkedIn export ZIP: ${zipFilePath}`);
    }
    
    if (forceRefresh) {
      console.log('🔄 Force refresh enabled - bypassing cache');
    }
    
    console.log('📖 Reading LinkedIn export ZIP file...');
    const zipBuffer = await readFile(zipFilePath);
    
    console.log('🚀 Starting resume generation...');
    
    // 1. Generate JSON resume
    const result = await resumeGenerator.generateFromZip(zipBuffer, forceRefresh);
    
    if (!result.success || !result.resume) {
      throw new Error(result.error || 'Failed to generate resume');
    }
    
    console.log('✅ JSON resume generated successfully!');
    
    // 2. Setup output files with date stamp
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    
    const jsonPath = join(outputDir, `resume${dateStr}.json`);
    const htmlPath = join(outputDir, `resume${dateStr}.html`);
    const pdfPath = join(outputDir, `resume${dateStr}.pdf`);
    
    // 3. Save JSON file
    console.log('💾 Saving JSON resume...');
    await mkdir(outputDir, { recursive: true });
    await writeFile(jsonPath, JSON.stringify(result.resume, null, 2));
    
    // 4. Generate HTML
    console.log('🌐 Generating HTML...');
    const html = await htmlExporter.export(result.resume as Resume);
    await writeFile(htmlPath, html);
    
    // 5. Generate PDF
    console.log('📋 Generating PDF...');
    const pdfBuffer = await pdfExporter.export(result.resume as Resume);
    await writeFile(pdfPath, pdfBuffer);
    
    console.log('✅ Resume generation completed successfully!');
    console.log('📄 JSON:', jsonPath);
    console.log('🌐 HTML:', htmlPath);
    console.log('📋 PDF:', pdfPath);
    
    // Show performance and cache statistics
    if (result.performance) {
      console.log('📊 Performance metrics:');
      console.log(`   Parse time: ${result.performance.parseTime}ms`);
      console.log(`   LLM time: ${result.performance.llmTime}ms`);
      console.log(`   Validation time: ${result.performance.validationTime}ms`);
      console.log(`   Total time: ${result.performance.totalTime}ms`);
    }
    
    const cacheStats = await resumeGenerator.getCacheStats();
    console.log(`📊 Cache stats: ${cacheStats.totalEntries} entries, ${(cacheStats.totalSize / 1024).toFixed(1)}KB`);
    
    // Show performance summary
    console.log('\n' + resumeGenerator.getPerformanceSummary());
    
  } catch (err: any) {
    console.error('❌ Resume generation failed:');
    
    // Use centralized error message resolution
    const { message, suggestions } = resolveErrorMessage(err);
    console.error(`   ${message}`);
    
    if (suggestions.length > 0) {
      console.error('   💡 To fix this:');
      suggestions.forEach(suggestion => {
        console.error(`      ${suggestion}`);
      });
    }
    
    process.exit(1);
  }
}

main();
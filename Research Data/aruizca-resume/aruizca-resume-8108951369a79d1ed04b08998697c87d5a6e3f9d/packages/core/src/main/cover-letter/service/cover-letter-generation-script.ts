#!/usr/bin/env node

import { readFile, mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { CoverLetterGenerator } from './CoverLetterGenerator';
import { Resume } from '../../resume';
import { validateEnvironment, resolveErrorMessage } from '../../shared';

async function main() {
  try {
    console.log('🔍 Validating environment...');
    await validateEnvironment();

    const args = process.argv.slice(2);
    
    // Parse command line arguments
    const forceRefresh = args.includes('--force-refresh');
    const filteredArgs = args.filter(arg => arg !== '--force-refresh');
    
    if (filteredArgs.length < 2) {
      console.error('❌ Usage: node cover-letter-generation-script.js <json-resume-path> <job-posting-url> [--test-html <html-file>] [--force-refresh]');
      console.error('   Example: node cover-letter-generation-script.js ./output/resume-20250807.json https://example.com/job');
      console.error('   Test mode: node cover-letter-generation-script.js ./output/resume-20250807.json https://example.com/job --test-html ./test-job-posting.html');
      console.error('   Force refresh: node cover-letter-generation-script.js ./output/resume-20250807.json https://example.com/job --force-refresh');
      process.exit(1);
    }

    const [jsonResumePath, jobPostingUrl, ...remainingArgs] = filteredArgs;
    
    // Check for test mode
    const testHtmlIndex = remainingArgs.indexOf('--test-html');
    const testHtmlPath = testHtmlIndex !== -1 ? remainingArgs[testHtmlIndex + 1] : null;

    // Validate JSON resume file
    console.log(`📄 Validating JSON resume file: ${jsonResumePath}`);
    if (!existsSync(jsonResumePath)) {
      console.error(`❌ JSON resume file not found: ${jsonResumePath}`);
      process.exit(1);
    }

    // Validate test HTML file if provided
    if (testHtmlPath && !existsSync(testHtmlPath)) {
      console.error(`❌ Test HTML file not found: ${testHtmlPath}`);
      process.exit(1);
    }

    console.log('🚀 Starting cover letter generation...');
    console.log(`📄 JSON Resume: ${jsonResumePath}`);
    console.log(`🔗 Job Posting URL: ${jobPostingUrl}`);
    if (testHtmlPath) {
      console.log(`🧪 Test HTML File: ${testHtmlPath}`);
    }
    if (forceRefresh) {
      console.log('🔄 Force refresh enabled - bypassing job posting cache');
    }

    const outputDir = join(process.cwd(), 'output');
    console.log(`📁 Output Directory: ${outputDir}`);

    // Load JSON resume
    console.log('📖 Loading JSON resume...');
    const resumeContent = await readFile(jsonResumePath, 'utf-8');
    const resume: Resume = JSON.parse(resumeContent);

    const generator = new CoverLetterGenerator();
    let result;

    if (testHtmlPath) {
      // Test mode: use local HTML file to extract job offer
      console.log('🧪 Running in test mode with local HTML file...');
      const htmlContent = await readFile(testHtmlPath, 'utf-8');
      const jobOffer = await generator.extractJobOfferFromHtml(htmlContent, jobPostingUrl);
      result = await generator.generateFromResumeAndJobOffer(resume, jobOffer);
    } else {
      // Normal mode: scrape from URL
      result = await generator.generateFromResumeAndUrl(resume, jobPostingUrl, forceRefresh);
    }

    if (!result.success || !result.coverLetter) {
      throw new Error(result.error || 'Failed to generate cover letter');
    }

    // Save cover letter output
    console.log('💾 Saving cover letter...');
    await mkdir(outputDir, { recursive: true });
    
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const markdownPath = join(outputDir, `cover-letter-${timestamp}.md`);
    
    await writeFile(markdownPath, result.coverLetter.content);
    
    console.log('✅ Cover letter generation completed successfully!');
    console.log(`📄 Markdown: ${markdownPath}`);

    // Show performance and cache statistics
    if (result.performance) {
      console.log('📊 Performance metrics:');
      console.log(`   Scrape time: ${result.performance.scrapeTime}ms`);
      console.log(`   LLM time: ${result.performance.llmTime}ms`);
      console.log(`   Build time: ${result.performance.buildTime}ms`);
      console.log(`   Total time: ${result.performance.totalTime}ms`);
    }

    const cacheStats = await generator.getCacheStats();
    if (cacheStats.totalEntries > 0) {
      console.log(`📊 Job posting cache stats: ${cacheStats.totalEntries} entries, ${(cacheStats.totalSize / 1024).toFixed(1)}KB`);
    }

  } catch (err: any) {
    console.error('❌ Cover letter generation failed:');
    
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

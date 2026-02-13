import { readFileSync } from 'fs';
import { join } from 'path';
import { PromptTemplate } from '@langchain/core/prompts';
import { LangchainPromptRunner, ModelFactory } from '../../../shared';
import { JobOffer, ParsedLinkedInData } from '../../domain';

export interface CoverLetterPromptRunner {
  run(jobOffer: JobOffer, userProfile: ParsedLinkedInData): Promise<string>;
  runWithJson(jobPostingJson: string, resumeJson: string): Promise<string>;
  extractJobInfoFromHtml(html: string): Promise<JobOffer>;
}

interface CoverLetterInput {
  jobPostingJson: string;
  resumeJson: string;
}

export class DefaultCoverLetterPromptRunner implements CoverLetterPromptRunner {
  private coverLetterRunner: LangchainPromptRunner<CoverLetterInput, string>;
  private jobExtractionRunner: LangchainPromptRunner<string, JobOffer>;

  constructor() {
    // Initialize cover letter generation runner
    this.coverLetterRunner = new LangchainPromptRunner({
      modelFactory: () => ModelFactory.createCoverLetterModel(),
      promptFactory: () => this.createJsonPrompt(),
      inputTransformer: (input) => ({
        jobPostingJson: input.jobPostingJson,
        resumeJson: input.resumeJson
      }),
      outputTransformer: (result) => {
        // Handle both string and object responses
        return typeof result === 'string' ? result : (result.content || result);
      },
      outputParser: 'string',
      cacheConfig: {
        ttl: 8 * 60 * 60 * 1000 // 8 hours
      },
      operationName: 'Generate Cover Letter (LLM)'
    });

    // Initialize job extraction runner  
    this.jobExtractionRunner = new LangchainPromptRunner({
      modelFactory: () => ModelFactory.createCoverLetterModel(),
      promptFactory: () => this.createJobExtractionPrompt(),
      inputTransformer: (html) => ({
        htmlContent: this.truncateHtml(html)
      }),
      outputTransformer: (result) => this.parseJobExtractionResult(result.content || result),
      outputParser: 'string',
      cacheConfig: {
        ttl: 8 * 60 * 60 * 1000 // 8 hours
      },
      operationName: 'Extract Job Info from HTML (LLM)'
    });
  }

  async run(jobOffer: JobOffer, userProfile: ParsedLinkedInData): Promise<string> {
    // Convert to JSON format for consistency
    const jobPostingJson = JSON.stringify(jobOffer, null, 2);
    const resumeJson = JSON.stringify(userProfile, null, 2);
    
    return await this.runWithJson(jobPostingJson, resumeJson);
  }

  async runWithJson(jobPostingJson: string, resumeJson: string): Promise<string> {
    return await this.coverLetterRunner.execute({ jobPostingJson, resumeJson });
  }

  async extractJobInfoFromHtml(html: string): Promise<JobOffer> {
    const extractedData = await this.jobExtractionRunner.execute(html);
    
    // Ensure required fields and set defaults
    return {
      url: '', // Will be set by the scraper
      title: extractedData.title || 'Unknown Title',
      company: extractedData.company || 'Unknown Company',
      description: extractedData.description || 'No description available',
      requirements: extractedData.requirements || [],
      responsibilities: extractedData.responsibilities || [],
      location: extractedData.location,
      salary: extractedData.salary,
      scrapedAt: new Date()
    };
  }

  private createJsonPrompt(): PromptTemplate {
    const promptTemplate = readFileSync(
      join(process.cwd(), 'packages', 'core', 'src', 'main', 'cover-letter', 'prompts', 'coverLetterJsonPrompt.txt'),
      'utf-8'
    );
    
    return PromptTemplate.fromTemplate(promptTemplate);
  }

  private createJobExtractionPrompt(): PromptTemplate {
    const promptTemplate = readFileSync(
      join(process.cwd(), 'packages', 'core', 'src', 'main', 'cover-letter', 'prompts', 'jobExtractionPrompt.txt'),
      'utf-8'
    );
    return PromptTemplate.fromTemplate(promptTemplate);
  }

  private truncateHtml(html: string): string {
    // Truncate HTML to avoid token limits (roughly 4000 tokens)
    const maxLength = 15000; // Conservative limit
    if (html.length <= maxLength) {
      return html;
    }
    
    // Try to find a good truncation point (end of a tag)
    const truncated = html.substring(0, maxLength);
    const lastTagEnd = truncated.lastIndexOf('>');
    
    if (lastTagEnd > maxLength * 0.8) {
      return truncated.substring(0, lastTagEnd + 1);
    }
    
    return truncated;
  }

  private parseJobExtractionResult(content: string): any {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const jsonString = jsonMatch[0];
      return JSON.parse(jsonString);
    } catch (error) {
      throw new Error(`Failed to parse job extraction result: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private formatUserExperience(userProfile: ParsedLinkedInData): string {
    if (!userProfile.positions || userProfile.positions.length === 0) {
      return 'No work experience found';
    }
    
    return userProfile.positions
      .slice(0, 3) // Take last 3 positions
      .map((position: any) => `${position.Title} at ${position.CompanyName} (${position.StartDate} - ${position.EndDate || 'Present'})`)
      .join('; ');
  }

  private formatUserSkills(userProfile: ParsedLinkedInData): string {
    if (!userProfile.skills || userProfile.skills.length === 0) {
      return 'No skills found';
    }
    
    return userProfile.skills
      .slice(0, 10) // Take top 10 skills
      .map((skill: any) => skill.SkillName)
      .join(', ');
  }

  private extractUserStrengths(userProfile: ParsedLinkedInData): string {
    // TODO: Implement more sophisticated strength extraction in Phase 3
    // For now, return a basic summary
    const experienceCount = userProfile.positions?.length || 0;
    const skillsCount = userProfile.skills?.length || 0;
    
    return `Experienced professional with ${experienceCount} positions and ${skillsCount} skills`;
  }
} 
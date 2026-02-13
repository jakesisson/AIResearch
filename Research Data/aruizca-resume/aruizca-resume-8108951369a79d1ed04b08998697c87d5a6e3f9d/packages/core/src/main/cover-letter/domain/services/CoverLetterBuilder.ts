import { CoverLetter, JobOffer, ParsedLinkedInData } from '../model';

export class CoverLetterBuilder {
  build(
    jobOffer: JobOffer,
    userProfile: ParsedLinkedInData,
    content: string,
    tone: 'professional' | 'enthusiastic' | 'formal' = 'professional'
  ): CoverLetter {
    const wordCount = this.calculateWordCount(content);
    const focusAreas = this.extractFocusAreas(jobOffer, userProfile);

    return {
      jobOffer,
      userProfile,
      content,
      generatedAt: new Date(),
      metadata: {
        wordCount,
        tone,
        focusAreas
      }
    };
  }

  private calculateWordCount(content: string): number {
    return content.trim().split(/\s+/).length;
  }

  private extractFocusAreas(jobOffer: JobOffer, userProfile: ParsedLinkedInData): string[] {
    // TODO: Implement logic to extract focus areas based on job requirements and user profile
    // This will be enhanced in Phase 3 with Langchain integration
    const focusAreas: string[] = [];
    
    // Basic implementation - extract from job requirements
    if (jobOffer.requirements.length > 0) {
      focusAreas.push(...jobOffer.requirements.slice(0, 3));
    }
    
    return focusAreas;
  }
} 
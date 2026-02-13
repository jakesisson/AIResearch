import { JobOffer } from './JobOffer';

export interface CoverLetter {
  jobOffer: JobOffer;
  userProfile: ParsedLinkedInData;
  content: string;
  generatedAt: Date;
  metadata: {
    wordCount: number;
    tone: 'professional' | 'enthusiastic' | 'formal';
    focusAreas: string[];
  };
}

export interface ParsedLinkedInData {
  profile: any[];
  positions: any[];
  education: any[];
  skills: any[];
}

export interface CoverLetterGenerationResult {
  success: boolean;
  coverLetter?: CoverLetter;
  error?: string;
} 
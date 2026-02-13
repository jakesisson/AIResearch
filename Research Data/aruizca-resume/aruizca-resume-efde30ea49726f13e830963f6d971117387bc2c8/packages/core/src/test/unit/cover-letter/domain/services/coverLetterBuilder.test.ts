import { beforeEach, describe, expect, it } from 'vitest';
import { CoverLetterBuilder, JobOffer, ParsedLinkedInData } from '../../../../../main/cover-letter';

describe('CoverLetterBuilder', () => {
  let coverLetterBuilder: CoverLetterBuilder;
  let mockJobOffer: JobOffer;
  let mockUserProfile: ParsedLinkedInData;

  beforeEach(() => {
    coverLetterBuilder = new CoverLetterBuilder();
    
    mockJobOffer = {
      url: 'https://example.com/job',
      title: 'Software Engineer',
      company: 'Example Company',
      description: 'A software engineering position',
      requirements: ['JavaScript', 'TypeScript', 'Node.js'],
      responsibilities: ['Develop applications', 'Collaborate with team'],
      scrapedAt: new Date()
    };

    mockUserProfile = {
      profile: [],
      positions: [],
      education: [],
      skills: []
    };
  });

  it('should build a cover letter with correct metadata', () => {
    const content = 'This is a sample cover letter content.';
    const coverLetter = coverLetterBuilder.build(mockJobOffer, mockUserProfile, content);

    expect(coverLetter.jobOffer).toBe(mockJobOffer);
    expect(coverLetter.userProfile).toBe(mockUserProfile);
    expect(coverLetter.content).toBe(content);
    expect(coverLetter.generatedAt).toBeInstanceOf(Date);
    expect(coverLetter.metadata.wordCount).toBe(7);
    expect(coverLetter.metadata.tone).toBe('professional');
    expect(coverLetter.metadata.focusAreas).toHaveLength(3);
  });

  it('should calculate word count correctly', () => {
    const content = 'This is a test content with multiple words.';
    const coverLetter = coverLetterBuilder.build(mockJobOffer, mockUserProfile, content);

    expect(coverLetter.metadata.wordCount).toBe(8);
  });

  it('should extract focus areas from job requirements', () => {
    const content = 'Sample content';
    const coverLetter = coverLetterBuilder.build(mockJobOffer, mockUserProfile, content);

    expect(coverLetter.metadata.focusAreas).toEqual(['JavaScript', 'TypeScript', 'Node.js']);
  });
}); 
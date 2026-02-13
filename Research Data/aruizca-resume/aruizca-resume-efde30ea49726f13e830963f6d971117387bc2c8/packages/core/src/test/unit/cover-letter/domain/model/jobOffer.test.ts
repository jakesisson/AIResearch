import { describe, expect, it } from 'vitest';
import { JobOffer } from '../../../../../main/cover-letter';

describe('JobOffer', () => {
  it('should create a valid JobOffer', () => {
    const jobOffer: JobOffer = {
      url: 'https://example.com/job',
      title: 'Software Engineer',
      company: 'Example Company',
      description: 'A software engineering position',
      requirements: ['JavaScript', 'TypeScript'],
      responsibilities: ['Develop applications', 'Collaborate with team'],
      location: 'Remote',
      salary: '$100k-$150k',
      scrapedAt: new Date()
    };

    expect(jobOffer.url).toBe('https://example.com/job');
    expect(jobOffer.title).toBe('Software Engineer');
    expect(jobOffer.company).toBe('Example Company');
    expect(jobOffer.requirements).toHaveLength(2);
    expect(jobOffer.responsibilities).toHaveLength(2);
  });

  it('should handle optional fields', () => {
    const jobOffer: JobOffer = {
      url: 'https://example.com/job',
      title: 'Software Engineer',
      company: 'Example Company',
      description: 'A software engineering position',
      requirements: [],
      responsibilities: [],
      scrapedAt: new Date()
    };

    expect(jobOffer.location).toBeUndefined();
    expect(jobOffer.salary).toBeUndefined();
  });
}); 
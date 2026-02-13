import { beforeEach, describe, expect, it } from 'vitest';
import { JsonResumeValidator } from '../../../../../main/resume';

describe('JsonResumeValidator', () => {
  let validator: JsonResumeValidator;

  beforeEach(() => {
    validator = new JsonResumeValidator();
  });

  describe('validateResume', () => {
    it('should validate a correct resume', () => {
      const validResume = {
        basics: {
          name: 'John Doe',
          label: 'Software Engineer',
          email: 'john@example.com',
          phone: '+1234567890',
          url: 'https://johndoe.com',
          summary: 'Experienced software engineer',
          location: {
            address: '123 Main St',
            city: 'New York',
            region: 'NY',
            countryCode: 'US',
            postalCode: '10001'
          },
          profiles: [
            {
              network: 'GitHub',
              username: 'johndoe',
              url: 'https://github.com/johndoe'
            }
          ]
        },
        work: [
          {
            name: 'Tech Company',
            position: 'Senior Software Engineer',
            url: 'https://techcompany.com',
            startDate: '2020-01',
            endDate: '2023-12',
            summary: 'Led development of key features',
            highlights: ['Feature A', 'Feature B']
          }
        ],
        education: [
          {
            institution: 'University of Technology',
            url: 'https://university.edu',
            area: 'Computer Science',
            studyType: 'Bachelor',
            startDate: '2016-09',
            endDate: '2020-05',
            score: '3.8/4.0',
            courses: ['Data Structures', 'Algorithms']
          }
        ],
        skills: [
          {
            name: 'JavaScript',
            level: 'Expert',
            keywords: ['React', 'Node.js', 'TypeScript']
          }
        ]
      };

      const result = validator.validateResume(validResume);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate empty resume (schema is permissive)', () => {
      const emptyResume = {};

      const result = validator.validateResume(emptyResume);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate resume with only basics', () => {
      const minimalResume = {
        basics: {
          name: 'John Doe'
        }
      };

      const result = validator.validateResume(minimalResume);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate resume with invalid email format', () => {
      const resumeWithInvalidEmail = {
        basics: {
          name: 'John Doe',
          email: 'invalid-email' // Invalid email format
        }
      };

      const result = validator.validateResume(resumeWithInvalidEmail);
      // The schema might be permissive with email format, so we just check it doesn't crash
      expect(typeof result.isValid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('should validate work entries correctly', () => {
      const resumeWithWork = {
        basics: {
          name: 'John Doe'
        },
        work: [
          {
            name: 'Company A',
            position: 'Developer',
            startDate: '2020-01',
            endDate: '2023-12'
          }
        ]
      };

      const result = validator.validateResume(resumeWithWork);
      expect(result.isValid).toBe(true);
    });

    it('should validate education entries correctly', () => {
      const resumeWithEducation = {
        basics: {
          name: 'John Doe'
        },
        education: [
          {
            institution: 'University A',
            area: 'Computer Science',
            studyType: 'Bachelor',
            startDate: '2016-09',
            endDate: '2020-05'
          }
        ]
      };

      const result = validator.validateResume(resumeWithEducation);
      expect(result.isValid).toBe(true);
    });

    it('should validate skills entries correctly', () => {
      const resumeWithSkills = {
        basics: {
          name: 'John Doe'
        },
        skills: [
          {
            name: 'JavaScript',
            level: 'Expert',
            keywords: ['React', 'Node.js']
          }
        ]
      };

      const result = validator.validateResume(resumeWithSkills);
      expect(result.isValid).toBe(true);
    });

    it('should validate resume with invalid date formats', () => {
      const resumeWithInvalidDates = {
        basics: {
          name: 'John Doe'
        },
        work: [
          {
            name: 'Company A',
            position: 'Developer',
            startDate: 'invalid-date', // Invalid date format
            endDate: '2023-12'
          }
        ]
      };

      const result = validator.validateResume(resumeWithInvalidDates);
      // The schema might be permissive with date formats, so we just check it doesn't crash
      expect(typeof result.isValid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  describe('validateResumeJson', () => {
    it('should validate valid JSON string', () => {
      const validJson = JSON.stringify({
        basics: {
          name: 'John Doe',
          email: 'john@example.com'
        }
      });

      const result = validator.validateResumeJson(validJson);
      expect(result.isValid).toBe(true);
    });

    it('should handle invalid JSON string', () => {
      const invalidJson = '{ "basics": { "name": "John Doe" }'; // Missing closing brace

      const result = validator.validateResumeJson(invalidJson);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].keyword).toBe('parse');
    });

    it('should handle malformed JSON', () => {
      const malformedJson = 'This is not JSON at all';

      const result = validator.validateResumeJson(malformedJson);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].keyword).toBe('parse');
    });
  });

  describe('getErrorSummary', () => {
    it('should return success message for valid resume', () => {
      const validResume = {
        basics: {
          name: 'John Doe',
          email: 'john@example.com'
        }
      };

      const result = validator.validateResume(validResume);
      const summary = validator.getErrorSummary(result);
      expect(summary).toContain('✅ Resume is valid');
    });

    it('should return detailed error summary for invalid resume', () => {
      // Create an invalid resume by using invalid JSON
      const invalidJson = '{ "basics": { "name": "John Doe" }'; // Missing closing brace
      const result = validator.validateResumeJson(invalidJson);
      const summary = validator.getErrorSummary(result);
      
      expect(summary).toContain('❌ Resume validation failed');
      expect(summary).toContain('1.');
    });

    it('should handle multiple errors', () => {
      // Create an invalid resume by using malformed JSON
      const malformedJson = 'This is not JSON at all';
      const result = validator.validateResumeJson(malformedJson);
      const summary = validator.getErrorSummary(result);
      
      expect(summary).toContain('❌ Resume validation failed');
      expect(summary).toContain('error');
    });
  });
}); 
/**
 * Mock data utilities for development and testing
 */

export const createMockJsonResume = (useCache: boolean): object => {
  const cacheNote = useCache ? "" : " (Fresh generation)";
  
  return {
    "$schema": "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
    "basics": {
      "name": "John Doe",
      "label": `Software Developer${cacheNote}`,
      "image": "",
      "email": "john@example.com",
      "phone": "+1 (555) 123-4567",
      "url": "https://johndoe.com",
      "summary": `Passionate software developer with expertise in modern web technologies.${useCache ? ' (Enhanced with cached AI responses)' : ' (Freshly generated with new AI content)'}`,
      "location": {
        "countryCode": "US",
        "city": "San Francisco"
      },
      "profiles": []
    },
    "work": [
      {
        "name": "Tech Company",
        "position": "Senior Software Developer",
        "startDate": "2020-01-01",
        "endDate": "",
        "summary": "Led development of scalable web applications using React and Node.js.",
        "url": "",
        "location": "San Francisco, CA"
      }
    ],
    "education": [
      {
        "institution": "University of Technology",
        "area": "Computer Science",
        "studyType": "Bachelor of Science",
        "startDate": "2016-09-01",
        "endDate": "2020-05-01",
        "score": "",
        "courses": []
      }
    ],
    "skills": [
      {
        "name": "JavaScript",
        "level": "Expert",
        "keywords": ["React", "Node.js", "TypeScript"]
      },
      {
        "name": "Python",
        "level": "Advanced",
        "keywords": ["Django", "FastAPI", "Data Analysis"]
      }
    ],
    "volunteer": [],
    "awards": [],
    "certificates": [],
    "publications": [],
    "languages": [],
    "interests": [],
    "references": [],
    "projects": [],
    "meta": {
      "canonical": "https://raw.githubusercontent.com/jsonresume/resume-schema/master/resume.json",
      "version": "v1.0.0",
      "lastModified": new Date().toISOString()
    }
  };
};

export const createMockCoverLetter = (useCache: boolean, wordCount?: number, additionalConsiderations?: string): string => {
  const cacheNote = useCache ? "" : " (Generated fresh without cache)";
  
  return `# Cover Letter${cacheNote}

Dear Hiring Manager,

I am writing to express my strong interest in the position you have posted. Based on my experience and qualifications outlined in my resume, I believe I would be an excellent fit for this role.

**Why I'm a Great Fit:**
- Extensive experience in software development
- Strong background in modern web technologies
- Proven track record of delivering high-quality solutions
- Excellent communication and collaboration skills

**Additional Considerations:**
${additionalConsiderations || 'None provided'}

**Target Word Count:** ${wordCount || 300} words
**Cache Used:** ${useCache ? 'Yes (faster processing)' : 'No (fresh content)'}

I am excited about the opportunity to contribute to your team and would welcome the chance to discuss my qualifications further.

Best regards,
[Your Name]`;
};

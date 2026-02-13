// Custom error classes for better error categorization
export class ValidationError extends Error {
  constructor(message: string, public context?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class APIError extends Error {
  constructor(message: string, public context?: any) {
    super(message);
    this.name = 'APIError';
  }
}

export class FileSystemError extends Error {
  constructor(message: string, public context?: any) {
    super(message);
    this.name = 'FileSystemError';
  }
}

export class LinkedInParseError extends Error {
  constructor(message: string, public context?: any) {
    super(message);
    this.name = 'LinkedInParseError';
  }
}

export class ResumeGenerationError extends Error {
  constructor(message: string, public context?: any) {
    super(message);
    this.name = 'ResumeGenerationError';
  }
} 
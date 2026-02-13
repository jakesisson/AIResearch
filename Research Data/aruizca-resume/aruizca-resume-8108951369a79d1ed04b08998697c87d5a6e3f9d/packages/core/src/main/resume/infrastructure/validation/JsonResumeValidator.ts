import Ajv from 'ajv';
import schema from '@jsonresume/schema';
import { Resume } from '../../domain/model/Resume';

export class JsonResumeValidator {
  private ajv: Ajv;
  private validate: any;

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      verbose: true,
      strict: false
    });
    this.validate = this.ajv.compile(schema);
  }

  /**
   * Validates a resume object against the JSON Resume schema
   * @param resume The resume object to validate
   * @returns ValidationResult with success status and any errors
   */
  validateResume(resume: any): ValidationResult {
    const isValid = this.validate(resume);
    
    if (isValid) {
      return {
        isValid: true,
        errors: []
      };
    }

    const errors = this.validate.errors?.map((error: any) => ({
      path: error.instancePath || 'root',
      message: error.message || 'Unknown validation error',
      keyword: error.keyword,
      schemaPath: error.schemaPath
    })) || [];

    return {
      isValid: false,
      errors
    };
  }

  /**
   * Validates a resume JSON string against the JSON Resume schema
   * @param jsonString The JSON string to validate
   * @returns ValidationResult with success status and any errors
   */
  validateResumeJson(jsonString: string): ValidationResult {
    try {
      const resume = JSON.parse(jsonString);
      return this.validateResume(resume);
    } catch (parseError) {
      return {
        isValid: false,
        errors: [{
          path: 'root',
          message: `Invalid JSON: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`,
          keyword: 'parse',
          schemaPath: ''
        }]
      };
    }
  }

  /**
   * Gets a human-readable summary of validation errors
   * @param result The validation result
   * @returns Formatted error summary
   */
  getErrorSummary(result: ValidationResult): string {
    if (result.isValid) {
      return '✅ Resume is valid according to JSON Resume schema';
    }

    const errorCount = result.errors.length;
    const summary = [`❌ Resume validation failed (${errorCount} error${errorCount > 1 ? 's' : ''}):`];
    
    result.errors.forEach((error, index) => {
      const path = error.path === 'root' ? 'resume' : error.path;
      summary.push(`  ${index + 1}. ${path}: ${error.message}`);
    });

    return summary.join('\n');
  }
}

export interface ValidationResult {
  isValid: boolean;
  errors: JsonResumeValidationError[];
}

export interface JsonResumeValidationError {
  path: string;
  message: string;
  keyword: string;
  schemaPath: string;
} 
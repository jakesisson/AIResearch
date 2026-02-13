import { ValidationError, FileSystemError, APIError } from './errors';

export interface ErrorContext {
  code?: string;
  path?: string;
  availableFiles?: string[];
  [key: string]: any;
}

export function resolveErrorMessage(error: Error): { message: string; suggestions: string[] } {
  if (error instanceof ValidationError) {
    return resolveValidationError(error);
  } else if (error instanceof FileSystemError) {
    return resolveFileSystemError(error);
  } else if (error instanceof APIError) {
    return resolveAPIError(error);
  } else {
    return {
      message: error.message || 'Unknown error occurred',
      suggestions: ['Please check the error details and try again']
    };
  }
}

function resolveValidationError(error: ValidationError): { message: string; suggestions: string[] } {
  const context = error.context as ErrorContext;
  
  switch (context?.code) {
    case 'MISSING_API_KEY':
      return {
        message: error.message,
        suggestions: [
          '1. Create a .env file in the project root',
          '2. Add: AZURE_OPENAI_API_KEY=your_api_key_here',
          '3. Add: AZURE_OPENAI_ENDPOINT=your_endpoint_here',
          '4. Get your Azure OpenAI credentials from your Azure portal'
        ]
      };
    
    case 'MISSING_ENDPOINT':
      return {
        message: error.message,
        suggestions: [
          '1. Create a .env file in the project root',
          '2. Add: AZURE_OPENAI_ENDPOINT=https://your-instance.openai.azure.com/',
          '3. Get your Azure OpenAI endpoint from your Azure portal'
        ]
      };
    
    case 'INVALID_API_KEY':
      return {
        message: error.message,
        suggestions: [
          '1. Check your AZURE_OPENAI_API_KEY environment variable',
          '2. Ensure the API key is at least 20 characters long',
          '3. Get a new API key from your Azure portal'
        ]
      };
    
    case 'INVALID_PATH_FORMAT':
      return {
        message: error.message,
        suggestions: [
          '1. Use absolute paths starting with /',
          '2. Use relative paths starting with ./ or ../',
          '3. Example: ./linkedin-export or /path/to/export'
        ]
      };
    
    default:
      return {
        message: error.message,
        suggestions: ['Please check your input and try again']
      };
  }
}

function resolveFileSystemError(error: FileSystemError): { message: string; suggestions: string[] } {
  const context = error.context as ErrorContext;
  
  switch (context?.code) {
    case 'LINKEDIN_DIR_NOT_FOUND':
      return {
        message: error.message,
        suggestions: [
          '1. Export your LinkedIn data from LinkedIn',
          '2. Place the ZIP file in the "linkedin-export" folder',
          '3. Run: npm start'
        ]
      };
    
    case 'NO_LINKEDIN_EXPORTS':
      return {
        message: error.message,
        suggestions: [
          '1. Ensure your LinkedIn export ZIP file starts with "Basic_LinkedInDataExport_"',
          '2. Place it in the "linkedin-export" folder',
          '3. Run: npm start'
        ]
      };
    
    case 'OUTPUT_DIR_CREATE_FAILED':
      return {
        message: error.message,
        suggestions: [
          '1. Check your file system permissions',
          '2. Ensure you have write access to the project directory',
          '3. Try running with elevated permissions if needed'
        ]
      };
    
    case 'OUTPUT_DIR_NOT_WRITABLE':
      return {
        message: error.message,
        suggestions: [
          '1. Check your file system permissions',
          '2. Ensure the output directory is writable',
          '3. Try creating the output directory manually'
        ]
      };
    
    default:
      return {
        message: error.message,
        suggestions: ['Please check your file system permissions and try again']
      };
  }
}

function resolveAPIError(error: APIError): { message: string; suggestions: string[] } {
  return {
    message: error.message,
    suggestions: [
      'This might be due to:',
      '- Invalid Azure OpenAI API key',
      '- Invalid Azure OpenAI endpoint',
      '- Network connectivity issues',
      '- Azure OpenAI API service issues',
      '- Rate limiting (try again in a few minutes)'
    ]
  };
} 
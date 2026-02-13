import { useState } from 'react';
import { createMockCoverLetter } from '../utils/mockData';

export interface CoverLetterFormData {
  resumeFile: File | null;
  jobUrl: string;
  wordCount?: number;
  additionalConsiderations?: string;
  useCache?: boolean;
}

export interface UseCoverLetterGenerationReturn {
  formData: CoverLetterFormData;
  generatedCoverLetter: string;
  isGenerating: boolean;
  handleFormSubmit: (data: CoverLetterFormData) => Promise<void>;
}

/**
 * Custom hook for managing cover letter generation state and logic
 */
export const useCoverLetterGeneration = (): UseCoverLetterGenerationReturn => {
  const [formData, setFormData] = useState<CoverLetterFormData>({
    resumeFile: null,
    jobUrl: '',
    wordCount: 300,
    additionalConsiderations: '',
    useCache: true,
  });
  
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFormSubmit = async (data: CoverLetterFormData) => {
    setIsGenerating(true);
    setFormData(data);
    
    // Mock generation for now (Iteration 1)
    const delay = data.useCache ? 2000 : 4000; // Longer delay when not using cache
    
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const mockCoverLetter = createMockCoverLetter(
          data.useCache || true,
          data.wordCount,
          data.additionalConsiderations
        );
        setGeneratedCoverLetter(mockCoverLetter);
        setIsGenerating(false);
        resolve();
      }, delay);
    });
  };

  return {
    formData,
    generatedCoverLetter,
    isGenerating,
    handleFormSubmit
  };
};

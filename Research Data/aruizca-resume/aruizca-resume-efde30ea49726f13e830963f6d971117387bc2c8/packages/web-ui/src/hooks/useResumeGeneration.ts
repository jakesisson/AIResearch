import { useState } from 'react';
import { createMockJsonResume } from '../utils/mockData';

export interface ResumeGenerationData {
  linkedinExportFile: File;
  useCache: boolean;
}

export interface UseResumeGenerationReturn {
  generatedResume: object | null;
  isGenerating: boolean;
  handleResumeSubmit: (data: ResumeGenerationData) => Promise<void>;
}

/**
 * Custom hook for managing resume generation state and logic
 */
export const useResumeGeneration = (): UseResumeGenerationReturn => {
  const [generatedResume, setGeneratedResume] = useState<object | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleResumeSubmit = async (data: ResumeGenerationData) => {
    setIsGenerating(true);
    
    // Mock generation for now (Iteration 1)
    const delay = data.useCache ? 3000 : 6000; // Longer delay when not using cache
    
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const mockJsonResume = createMockJsonResume(data.useCache);
        setGeneratedResume(mockJsonResume);
        setIsGenerating(false);
        resolve();
      }, delay);
    });
  };

  return {
    generatedResume,
    isGenerating,
    handleResumeSubmit
  };
};

import {
  Box,
  Heading,
  SimpleGrid
} from '@chakra-ui/react';
import { useCoverLetterGeneration } from '../hooks/useCoverLetterGeneration';
import { CoverLetterForm } from '../components/CoverLetterForm';
import { CoverLetterDisplay } from '../components/CoverLetterDisplay';

/**
 * Cover letter generation page component
 */
export const CoverLetterPage = () => {
  const { formData, generatedCoverLetter, isGenerating, handleFormSubmit } = useCoverLetterGeneration();

  return (
    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
      {/* Left Column - Form */}
      <Box
        bg="white"
        p={6}
        borderRadius="lg"
        boxShadow="md"
        border="1px solid"
        borderColor="gray.200"
      >
        <Heading as="h2" size="lg" mb={6}>
          Cover Letter Information
        </Heading>
        <CoverLetterForm
          onSubmit={handleFormSubmit}
          isGenerating={isGenerating}
        />
      </Box>

      {/* Right Column - Generated Cover Letter */}
      <Box
        bg="white"
        p={6}
        borderRadius="lg"
        boxShadow="md"
        border="1px solid"
        borderColor="gray.200"
      >
        <Heading as="h2" size="lg" mb={6}>
          Generated Cover Letter
        </Heading>
        <CoverLetterDisplay
          coverLetter={generatedCoverLetter}
          isGenerating={isGenerating}
          wordCount={formData.wordCount}
        />
      </Box>
    </SimpleGrid>
  );
};

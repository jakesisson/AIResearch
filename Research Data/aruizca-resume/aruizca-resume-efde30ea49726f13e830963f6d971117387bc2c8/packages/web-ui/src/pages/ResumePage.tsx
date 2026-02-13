import {
  Box,
  Button,
  Heading,
  SimpleGrid,
  Text
} from '@chakra-ui/react';
import { useResumeGeneration } from '../hooks/useResumeGeneration';
import { ResumeGenerationForm } from '../components/ResumeGenerationForm';

/**
 * Resume generation page component
 */
export const ResumePage = () => {
  const { generatedResume, isGenerating, handleResumeSubmit } = useResumeGeneration();

  return (
    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
      {/* Left Column - Resume Form */}
      <Box
        bg="white"
        p={6}
        borderRadius="lg"
        boxShadow="md"
        border="1px solid"
        borderColor="gray.200"
      >
        <Heading as="h2" size="lg" mb={6}>
          LinkedIn Data Upload
        </Heading>
        <ResumeGenerationForm
          onSubmit={handleResumeSubmit}
          isGenerating={isGenerating}
        />
      </Box>

      {/* Right Column - Generated Resume */}
      <Box
        bg="white"
        p={6}
        borderRadius="lg"
        boxShadow="md"
        border="1px solid"
        borderColor="gray.200"
      >
        <Heading as="h2" size="lg" mb={6}>
          Generated JSON Resume
        </Heading>
        {isGenerating ? (
          <Box p={6} textAlign="center">
            <Text color="gray.600">Processing your LinkedIn data...</Text>
          </Box>
        ) : generatedResume ? (
          <Box>
            <Button mb={4} colorScheme="brand" size="sm">
              📋 Copy JSON
            </Button>
            <Box
              bg="gray.900"
              p={4}
              borderRadius="md"
              maxH="500px"
              overflowY="auto"
            >
              <Text
                as="pre"
                fontSize="xs"
                color="white"
                whiteSpace="pre-wrap"
              >
                {JSON.stringify(generatedResume, null, 2)}
              </Text>
            </Box>
          </Box>
        ) : (
          <Box p={6} bg="gray.50" borderRadius="md" textAlign="center">
            <Text color="gray.600">
              Your generated JSON Resume will appear here
            </Text>
          </Box>
        )}
      </Box>
    </SimpleGrid>
  );
};

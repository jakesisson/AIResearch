import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react';

/**
 * App header component with title and description
 */
export const AppHeader = () => {
  return (
    <Box bg="white" borderBottom="1px solid" borderColor="gray.200" py={6}>
      <Container maxW="7xl">
        <VStack spacing={6} align="stretch">
          <Box textAlign="center">
            <Heading as="h1" size="2xl" mb={2} color="brand.600">
              AI-Powered Career Tools
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Generate professional resumes and cover letters using AI technology
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

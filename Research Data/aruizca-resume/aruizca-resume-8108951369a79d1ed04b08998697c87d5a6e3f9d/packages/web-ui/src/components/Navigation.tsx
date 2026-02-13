import {
  Box,
  Container,
  Heading,
  Tab,
  TabList,
  Tabs,
  Text,
  VStack,
} from '@chakra-ui/react'

export type AppMode = 'resume' | 'cover-letter'

interface NavigationProps {
  activeMode: AppMode
  onModeChange: (mode: AppMode) => void
}

export function Navigation({ activeMode, onModeChange }: NavigationProps) {
  return (
    <Box bg="white" borderBottom="1px solid" borderColor="gray.200" py={6}>
      <Container maxW="7xl">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box textAlign="center">
            <Heading as="h1" size="2xl" mb={2} color="brand.600">
              AI-Powered Career Tools
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Generate professional resumes and cover letters using AI technology
            </Text>
          </Box>

          {/* Navigation Tabs */}
          <Tabs 
            index={activeMode === 'resume' ? 0 : 1}
            onChange={(index) => onModeChange(index === 0 ? 'resume' : 'cover-letter')}
            variant="enclosed"
            colorScheme="brand"
            align="center"
          >
            <TabList>
              <Tab py={4} px={8} fontSize="lg" fontWeight="medium">
                📄 Generate JSON Resume
              </Tab>
              <Tab py={4} px={8} fontSize="lg" fontWeight="medium">
                ✉️ Generate Cover Letter
              </Tab>
            </TabList>
          </Tabs>
        </VStack>
      </Container>
    </Box>
  )
}

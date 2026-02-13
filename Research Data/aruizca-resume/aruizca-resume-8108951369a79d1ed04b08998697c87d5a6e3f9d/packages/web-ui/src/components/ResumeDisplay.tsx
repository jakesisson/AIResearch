import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Code,
  HStack,
  Spinner,
  TabList,
  TabPanels,
  Tabs,
  Text,
  useToast,
  VStack,
  Tab,
  TabPanel,
} from '@chakra-ui/react'
import { useState } from 'react'

interface ResumeDisplayProps {
  jsonResume: object | null
  isGenerating: boolean
}

export function ResumeDisplay({ jsonResume, isGenerating }: ResumeDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const toast = useToast()

  const copyToClipboard = async () => {
    if (!jsonResume) return
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(jsonResume, null, 2))
      toast({
        title: 'Copied to clipboard',
        description: 'The JSON Resume has been copied to your clipboard.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Failed to copy to clipboard. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const downloadJson = async () => {
    if (!jsonResume) return
    
    setIsDownloading(true)
    
    try {
      const dataStr = JSON.stringify(jsonResume, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
      
      const exportFileDefaultName = `resume-${new Date().toISOString().split('T')[0]}.json`
      
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
      
      toast({
        title: 'Download started',
        description: `Your JSON Resume has been downloaded as ${exportFileDefaultName}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Failed to download JSON file. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const validateJsonResume = (resume: any) => {
    const requiredFields = ['basics']
    const warnings = []
    const errors = []

    // Check required fields
    requiredFields.forEach(field => {
      if (!resume[field]) {
        errors.push(`Missing required field: ${field}`)
      }
    })

    // Check basics sub-fields
    if (resume.basics) {
      if (!resume.basics.name) errors.push('Missing basics.name')
      if (!resume.basics.email) errors.push('Missing basics.email')
    }

    // Check optional but recommended fields
    if (!resume.work || resume.work.length === 0) {
      warnings.push('No work experience provided')
    }
    if (!resume.education || resume.education.length === 0) {
      warnings.push('No education provided')
    }
    if (!resume.skills || resume.skills.length === 0) {
      warnings.push('No skills provided')
    }

    return { errors, warnings }
  }

  const formatJsonForDisplay = (obj: any) => {
    return JSON.stringify(obj, null, 2)
  }

  const renderResumePreview = (resume: any) => {
    return (
      <VStack spacing={4} align="stretch">
        {/* Basic Info */}
        {resume.basics && (
          <Box>
            <Text fontWeight="bold" fontSize="lg" mb={2}>
              {resume.basics.name || 'Name not provided'}
            </Text>
            <Text color="gray.600">{resume.basics.email}</Text>
            {resume.basics.phone && <Text color="gray.600">{resume.basics.phone}</Text>}
            {resume.basics.website && (
              <Text color="brand.500" as="a" href={resume.basics.website} target="_blank">
                {resume.basics.website}
              </Text>
            )}
            {resume.basics.summary && (
              <Text mt={2} fontSize="sm">{resume.basics.summary}</Text>
            )}
          </Box>
        )}

        {/* Work Experience */}
        {resume.work && resume.work.length > 0 && (
          <Box>
            <Text fontWeight="bold" mb={2}>Work Experience</Text>
            {resume.work.map((job: any, index: number) => (
              <Box key={index} mb={3} p={3} bg="gray.50" borderRadius="md">
                <Text fontWeight="medium">{job.position} at {job.company}</Text>
                <Text fontSize="sm" color="gray.600">
                  {job.startDate} - {job.endDate || 'Present'}
                </Text>
                {job.summary && <Text fontSize="sm" mt={1}>{job.summary}</Text>}
              </Box>
            ))}
          </Box>
        )}

        {/* Education */}
        {resume.education && resume.education.length > 0 && (
          <Box>
            <Text fontWeight="bold" mb={2}>Education</Text>
            {resume.education.map((edu: any, index: number) => (
              <Box key={index} mb={2} p={3} bg="gray.50" borderRadius="md">
                <Text fontWeight="medium">{edu.studyType} in {edu.area}</Text>
                <Text fontSize="sm" color="gray.600">{edu.institution}</Text>
                <Text fontSize="sm" color="gray.600">
                  {edu.startDate} - {edu.endDate}
                </Text>
              </Box>
            ))}
          </Box>
        )}

        {/* Skills */}
        {resume.skills && resume.skills.length > 0 && (
          <Box>
            <Text fontWeight="bold" mb={2}>Skills</Text>
            <HStack spacing={2} flexWrap="wrap">
              {resume.skills.map((skill: any, index: number) => (
                <Badge key={index} colorScheme="brand" variant="subtle">
                  {skill.name} {skill.level && `(${skill.level})`}
                </Badge>
              ))}
            </HStack>
          </Box>
        )}
      </VStack>
    )
  }

  if (isGenerating) {
    return (
      <VStack spacing={4} align="center" py={8}>
        <Spinner size="xl" color="brand.500" />
        <Text color="gray.600">Generating your JSON Resume...</Text>
        <Text fontSize="sm" color="gray.500">
          Processing LinkedIn data and combining with your input...
        </Text>
      </VStack>
    )
  }

  if (!jsonResume) {
    return (
      <Box py={8}>
        <Alert status="info">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="medium">Ready to generate your JSON Resume</Text>
            <Text fontSize="sm">
              Fill in the form on the left and click "Generate JSON Resume" to get started.
            </Text>
          </VStack>
        </Alert>
      </Box>
    )
  }

  const validation = validateJsonResume(jsonResume)

  return (
    <VStack spacing={6} align="stretch">
      {/* Action Buttons and Validation Status */}
      <VStack spacing={4} align="stretch">
        <HStack spacing={4} justify="space-between">
          <HStack spacing={3}>
            <Button
              onClick={copyToClipboard}
              variant="outline"
              colorScheme="brand"
              size="sm"
            >
              📋 Copy JSON
            </Button>
            <Button
              onClick={downloadJson}
              colorScheme="brand"
              size="sm"
              isLoading={isDownloading}
              loadingText="Downloading..."
            >
              💾 Download JSON
            </Button>
          </HStack>
          
          {/* Validation Status */}
          <HStack spacing={2}>
            {validation.errors.length === 0 ? (
              <Badge colorScheme="green">✓ Valid JSON Resume</Badge>
            ) : (
              <Badge colorScheme="red">⚠ Has Errors</Badge>
            )}
            {validation.warnings.length > 0 && (
              <Badge colorScheme="yellow">⚠ {validation.warnings.length} Warning(s)</Badge>
            )}
          </HStack>
        </HStack>

        {/* Validation Messages */}
        {(validation.errors.length > 0 || validation.warnings.length > 0) && (
          <VStack spacing={2} align="stretch">
            {validation.errors.map((error, index) => (
              <Alert key={`error-${index}`} status="error" size="sm">
                <AlertIcon />
                <Text fontSize="sm">{error}</Text>
              </Alert>
            ))}
            {validation.warnings.map((warning, index) => (
              <Alert key={`warning-${index}`} status="warning" size="sm">
                <AlertIcon />
                <Text fontSize="sm">{warning}</Text>
              </Alert>
            ))}
          </VStack>
        )}
      </VStack>

      {/* Resume Content */}
      <Tabs variant="enclosed" colorScheme="brand">
        <TabList>
          <Tab>👁️ Preview</Tab>
          <Tab>🔧 JSON Source</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Box
              border="1px solid"
              borderColor="gray.200"
              borderRadius="md"
              p={6}
              bg="white"
              minH="400px"
              maxH="600px"
              overflowY="auto"
            >
              {renderResumePreview(jsonResume)}
            </Box>
          </TabPanel>
          <TabPanel>
            <Box
              border="1px solid"
              borderColor="gray.200"
              borderRadius="md"
              p={4}
              bg="gray.900"
              minH="400px"
              maxH="600px"
              overflowY="auto"
            >
              <Code
                display="block"
                whiteSpace="pre"
                fontSize="xs"
                color="white"
                bg="transparent"
                p={0}
              >
                {formatJsonForDisplay(jsonResume)}
              </Code>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Schema Information */}
      <Box fontSize="sm" color="gray.600" p={4} bg="gray.50" borderRadius="md">
        <Text fontWeight="medium" mb={2}>📄 JSON Resume Schema</Text>
        <Text>
          This resume follows the{' '}
          <Text as="a" href="https://jsonresume.org/schema/" target="_blank" color="brand.500">
            JSON Resume standard
          </Text>
          {' '}which is supported by many resume builders and ATS systems.
        </Text>
      </Box>
    </VStack>
  )
}

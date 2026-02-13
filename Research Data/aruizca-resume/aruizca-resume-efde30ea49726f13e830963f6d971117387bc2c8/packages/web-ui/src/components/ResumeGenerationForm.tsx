import { useState } from 'react'
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  Text,
  VStack,
} from '@chakra-ui/react'

interface ResumeGenerationFormProps {
  onSubmit: (data: { linkedinExportFile: File; useCache: boolean }) => void
  isGenerating: boolean
}

export function ResumeGenerationForm({ onSubmit, isGenerating }: ResumeGenerationFormProps) {
  const [linkedinExportFile, setLinkedinExportFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadError, setUploadError] = useState<string>('')
  const [useCache, setUseCache] = useState<boolean>(true)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    handleFileSelection(file)
  }

  const handleFileSelection = (file: File | undefined) => {
    if (!file) return

    // Validate file type (should be ZIP from LinkedIn export)
    if (!file.name.toLowerCase().endsWith('.zip') && file.type !== 'application/zip') {
      setUploadError('Please upload a ZIP file from your LinkedIn data export')
      return
    }

    // Validate file size (max 50MB for LinkedIn export)
    if (file.size > 50 * 1024 * 1024) {
      setUploadError('File size must be less than 50MB')
      return
    }

    setUploadError('')
    setLinkedinExportFile(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    handleFileSelection(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!linkedinExportFile) {
      setUploadError('Please upload your LinkedIn data export file')
      return
    }
    onSubmit({ linkedinExportFile, useCache })
  }

  const isValid = linkedinExportFile !== null

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        
        {/* LinkedIn Export Upload */}
        <FormControl isRequired>
          <FormLabel>LinkedIn Data Export</FormLabel>
          <Box
            border="2px dashed"
            borderColor={dragActive ? "brand.500" : "gray.300"}
            borderRadius="md"
            p={8}
            textAlign="center"
            bg={dragActive ? "brand.50" : "gray.50"}
            cursor="pointer"
            transition="all 0.2s"
            minH="120px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('linkedin-upload')?.click()}
          >
            <Input
              id="linkedin-upload"
              type="file"
              accept=".zip"
              onChange={handleFileChange}
              display="none"
            />
            {linkedinExportFile ? (
              <VStack spacing={2}>
                <Text color="green.600" fontWeight="medium" fontSize="lg">
                  ✅ {linkedinExportFile.name}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Click to change file
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Size: {(linkedinExportFile.size / (1024 * 1024)).toFixed(2)} MB
                </Text>
              </VStack>
            ) : (
              <VStack spacing={3}>
                <Text color="gray.600" fontSize="lg">
                  📁 Drop your LinkedIn export ZIP file here
                </Text>
                <Text fontSize="md" color="gray.600" fontWeight="medium">
                  or click to browse files
                </Text>
                <Text fontSize="sm" color="gray.500" maxW="400px" lineHeight="tall">
                  Upload the ZIP file you downloaded from LinkedIn's "Request a download of your data" feature
                </Text>
              </VStack>
            )}
          </Box>
          
          <FormHelperText>
            <VStack spacing={2} align="start" mt={3}>
              <Text fontSize="sm">
                <strong>How to get your LinkedIn data:</strong>
              </Text>
              <Text fontSize="sm" color="gray.600">
                1. Go to LinkedIn → Settings & Privacy → Data Privacy → Get a copy of your data
              </Text>
              <Text fontSize="sm" color="gray.600">
                2. Select "Want something in particular? Select the data files you're most interested in"
              </Text>
              <Text fontSize="sm" color="gray.600">
                3. Check: Profile, Connections, Experience, Education, Skills, Certifications
              </Text>
              <Text fontSize="sm" color="gray.600">
                4. Click "Request archive" and wait for the email with download link
              </Text>
              <Text fontSize="sm" color="blue.600" as="a" href="https://www.linkedin.com/help/linkedin/answer/50191" target="_blank">
                📖 Detailed instructions on LinkedIn Help →
              </Text>
            </VStack>
          </FormHelperText>
          
          {uploadError && (
            <Alert status="error" mt={3}>
              <AlertIcon />
              <Text fontSize="sm">{uploadError}</Text>
            </Alert>
          )}
        </FormControl>

        {/* Information Box */}
        <Box bg="blue.50" p={4} borderRadius="md" border="1px solid" borderColor="blue.200">
          <Text fontSize="sm" color="blue.800" fontWeight="medium" mb={2}>
            📋 What happens next:
          </Text>
          <VStack spacing={1} align="start">
            <Text fontSize="sm" color="blue.700">
              • Your LinkedIn data will be parsed automatically
            </Text>
            <Text fontSize="sm" color="blue.700">
              • AI will enhance and format your experience descriptions
            </Text>
            <Text fontSize="sm" color="blue.700">
              • A JSON Resume following jsonresume.org schema will be generated
            </Text>
            <Text fontSize="sm" color="blue.700">
              • You can download the JSON file or copy it to clipboard
            </Text>
          </VStack>
        </Box>

        {/* Cache Control */}
        <Box bg="gray.50" p={4} borderRadius="md" border="1px solid" borderColor="gray.200">
          <Checkbox
            isChecked={useCache}
            onChange={(e) => setUseCache(e.target.checked)}
            colorScheme="brand"
          >
            <Text fontSize="sm" fontWeight="medium">
              Use cache for faster processing
            </Text>
          </Checkbox>
          <Text fontSize="xs" color="gray.600" mt={1} ml={6}>
            {useCache 
              ? "Will use cached OpenAI responses if available (faster, uses less API quota)"
              : "Will bypass cache and generate fresh content (slower, uses more API quota)"
            }
          </Text>
        </Box>

        {/* Generate Button */}
        <Button
          type="submit"
          colorScheme="brand"
          size="lg"
          isLoading={isGenerating}
          loadingText="Processing LinkedIn data..."
          isDisabled={!isValid}
          py={6}
        >
          🚀 Generate JSON Resume from LinkedIn Data
          {!useCache && " (Fresh)"}
        </Button>
        
        {isGenerating && (
          <Box bg="yellow.50" p={4} borderRadius="md" border="1px solid" borderColor="yellow.200">
            <Text fontSize="sm" color="yellow.800" textAlign="center">
              ⏳ This may take 30-60 seconds as we parse your LinkedIn data and enhance it with AI...
            </Text>
          </Box>
        )}
      </VStack>
    </form>
  )
}

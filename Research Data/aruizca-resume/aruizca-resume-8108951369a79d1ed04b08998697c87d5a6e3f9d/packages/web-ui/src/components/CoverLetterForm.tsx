import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
  Textarea,
  VStack,
  Alert,
  AlertIcon,
  Checkbox,
} from '@chakra-ui/react'
import { useState } from 'react'
import type { CoverLetterFormData } from '../App'

interface CoverLetterFormProps {
  onSubmit: (data: CoverLetterFormData) => void
  isGenerating: boolean
}

export function CoverLetterForm({ onSubmit, isGenerating }: CoverLetterFormProps) {
  const [formData, setFormData] = useState<CoverLetterFormData>({
    resumeFile: null,
    jobUrl: '',
    wordCount: 300,
    additionalConsiderations: '',
    useCache: true,
  })
  
  const [dragActive, setDragActive] = useState(false)
  const [uploadError, setUploadError] = useState<string>('')

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    handleFileSelection(file)
  }

  const handleFileSelection = (file: File | undefined) => {
    if (!file) return

    // Validate file type
    if (file.type !== 'application/json') {
      setUploadError('Please upload a valid JSON file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB')
      return
    }

    setUploadError('')
    setFormData(prev => ({ ...prev, resumeFile: file }))
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
    if (!formData.resumeFile || !formData.jobUrl.trim()) {
      return
    }
    onSubmit(formData)
  }

  const isValid = formData.resumeFile && formData.jobUrl.trim()

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        {/* JSON Resume Upload */}
        <FormControl isRequired>
          <FormLabel>JSON Resume File</FormLabel>
          <Box
            border="2px dashed"
            borderColor={dragActive ? "brand.500" : "gray.300"}
            borderRadius="md"
            p={6}
            textAlign="center"
            bg={dragActive ? "brand.50" : "gray.50"}
            cursor="pointer"
            transition="all 0.2s"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <Input
              id="file-upload"
              type="file"
              accept=".json"
              onChange={handleFileChange}
              display="none"
            />
            {formData.resumeFile ? (
              <VStack spacing={2}>
                <Text color="green.600" fontWeight="medium">
                  ✅ {formData.resumeFile.name}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Click to change file
                </Text>
              </VStack>
            ) : (
              <VStack spacing={2}>
                <Text color="gray.600">
                  📄 Drop your JSON resume here or click to browse
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Supports JSON Resume format
                </Text>
              </VStack>
            )}
          </Box>
          <FormHelperText>
            Upload a valid JSON Resume file following the{' '}
            <Text as="a" href="https://jsonresume.org/schema/" target="_blank" color="brand.500">
              JSON Resume schema
            </Text>
          </FormHelperText>
          {uploadError && (
            <Alert status="error" mt={2}>
              <AlertIcon />
              {uploadError}
            </Alert>
          )}
        </FormControl>

        {/* Job URL */}
        <FormControl isRequired>
          <FormLabel>Job Offer URL</FormLabel>
          <Input
            type="url"
            placeholder="https://example.com/job-posting"
            value={formData.jobUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, jobUrl: e.target.value }))}
          />
          <FormHelperText>
            Enter the URL of the job posting you're applying for
          </FormHelperText>
        </FormControl>

        {/* Word Count (Optional) */}
        <FormControl>
          <FormLabel>Target Word Count (Optional)</FormLabel>
          <NumberInput
            defaultValue={300}
            min={100}
            max={1000}
            value={formData.wordCount}
            onChange={(_, valueAsNumber) => 
              setFormData(prev => ({ ...prev, wordCount: valueAsNumber }))
            }
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <FormHelperText>
            Approximate length for the cover letter (100-1000 words)
          </FormHelperText>
        </FormControl>

        {/* Additional Considerations */}
        <FormControl>
          <FormLabel>Additional Considerations (Optional)</FormLabel>
          <Textarea
            placeholder="Any specific points you'd like to emphasize or tone adjustments..."
            value={formData.additionalConsiderations}
            onChange={(e) => 
              setFormData(prev => ({ ...prev, additionalConsiderations: e.target.value }))
            }
            rows={4}
          />
          <FormHelperText>
            Provide any additional context or requirements for the cover letter
          </FormHelperText>
        </FormControl>

        {/* Cache Control */}
        <Box bg="gray.50" p={4} borderRadius="md" border="1px solid" borderColor="gray.200">
          <Checkbox
            isChecked={formData.useCache}
            onChange={(e) => setFormData(prev => ({ ...prev, useCache: e.target.checked }))}
            colorScheme="brand"
          >
            <Text fontSize="sm" fontWeight="medium">
              Use cache for faster processing
            </Text>
          </Checkbox>
          <Text fontSize="xs" color="gray.600" mt={1} ml={6}>
            {formData.useCache 
              ? "Will use cached job posting data and OpenAI responses if available (faster, uses less API quota)"
              : "Will bypass cache and fetch fresh job posting data with new OpenAI content (slower, uses more API quota)"
            }
          </Text>
        </Box>

        {/* Submit Button */}
        <Button
          type="submit"
          colorScheme="brand"
          size="lg"
          isLoading={isGenerating}
          loadingText="Generating..."
          isDisabled={!isValid}
        >
          Generate Cover Letter
          {!formData.useCache && " (Fresh)"}
        </Button>
      </VStack>
    </form>
  )
}

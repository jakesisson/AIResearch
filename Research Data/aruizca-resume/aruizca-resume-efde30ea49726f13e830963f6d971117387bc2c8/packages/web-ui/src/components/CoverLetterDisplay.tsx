import {
  Alert,
  AlertIcon,
  Box,
  Button,
  HStack,
  Spinner,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react'
import { useState } from 'react'

interface CoverLetterDisplayProps {
  coverLetter: string
  isGenerating: boolean
  wordCount?: number
}

export function CoverLetterDisplay({ 
  coverLetter, 
  isGenerating, 
  wordCount = 300 
}: CoverLetterDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const toast = useToast()

  // Convert markdown to HTML for display (simple implementation)
  const renderMarkdownAsHtml = (markdown: string) => {
    if (!markdown) return ''
    
    return markdown
      // Headers
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Line breaks
      .replace(/\n/g, '<br>')
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(coverLetter)
      toast({
        title: 'Copied to clipboard',
        description: 'The cover letter markdown has been copied to your clipboard.',
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

  const downloadPdf = async () => {
    setIsDownloading(true)
    
    try {
      // Placeholder for PDF generation (Iteration 1)
      // This will be connected to the core PDF generation in Iteration 2
      setTimeout(() => {
        toast({
          title: 'PDF generation not yet implemented',
          description: 'PDF download will be available in the next iteration.',
          status: 'info',
          duration: 3000,
          isClosable: true,
        })
        setIsDownloading(false)
      }, 1000)
    } catch (error) {
      toast({
        title: 'PDF generation failed',
        description: 'Failed to generate PDF. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      setIsDownloading(false)
    }
  }

  const actualWordCount = coverLetter 
    ? coverLetter.split(/\s+/).filter(word => word.length > 0).length 
    : 0

  if (isGenerating) {
    return (
      <VStack spacing={4} align="center" py={8}>
        <Spinner size="xl" color="brand.500" />
        <Text color="gray.600">Generating your cover letter...</Text>
        <Text fontSize="sm" color="gray.500">
          This may take a few moments while we analyze the job posting and your resume.
        </Text>
      </VStack>
    )
  }

  if (!coverLetter) {
    return (
      <Box py={8}>
        <Alert status="info">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="medium">Ready to generate your cover letter</Text>
            <Text fontSize="sm">
              Fill in the form on the left and click "Generate Cover Letter" to get started.
            </Text>
          </VStack>
        </Alert>
      </Box>
    )
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Action Buttons */}
      <HStack spacing={4} justify="space-between">
        <HStack spacing={3}>
          <Button
            onClick={copyToClipboard}
            variant="outline"
            colorScheme="brand"
            size="sm"
          >
            📝 Copy Markdown
          </Button>
          <Button
            onClick={downloadPdf}
            colorScheme="brand"
            size="sm"
            isLoading={isDownloading}
            loadingText="Generating PDF..."
          >
            📄 Download PDF
          </Button>
        </HStack>
        
        {/* Word Count Stats */}
        <Stat size="sm" textAlign="right">
          <StatLabel>Word Count</StatLabel>
          <StatNumber fontSize="md">{actualWordCount}</StatNumber>
          <StatHelpText>
            Target: {wordCount} words
          </StatHelpText>
        </Stat>
      </HStack>

      {/* Cover Letter Preview */}
      <Box
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        p={6}
        bg="white"
        minH="400px"
        fontSize="sm"
        lineHeight="1.6"
        fontFamily="'Georgia', serif"
      >
        <Box
          dangerouslySetInnerHTML={{
            __html: renderMarkdownAsHtml(coverLetter)
          }}
          sx={{
            '& h1': {
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: 'brand.600',
            },
            '& h2': {
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '0.75rem',
              marginTop: '1.5rem',
              color: 'gray.700',
            },
            '& h3': {
              fontSize: '1.1rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              marginTop: '1rem',
              color: 'gray.600',
            },
            '& strong': {
              fontWeight: 'bold',
              color: 'gray.800',
            },
            '& em': {
              fontStyle: 'italic',
            },
            '& p': {
              marginBottom: '1rem',
            },
          }}
        />
      </Box>

      {/* Word Count Analysis */}
      {actualWordCount > 0 && (
        <Box fontSize="sm" color="gray.600">
          <Text>
            <strong>Analysis:</strong> {' '}
            {actualWordCount < wordCount * 0.8 && 'Consider adding more detail to reach your target word count.'}
            {actualWordCount >= wordCount * 0.8 && actualWordCount <= wordCount * 1.2 && 'Perfect length! Your cover letter matches the target word count.'}
            {actualWordCount > wordCount * 1.2 && 'Consider condensing to better match your target word count.'}
          </Text>
        </Box>
      )}
    </VStack>
  )
}

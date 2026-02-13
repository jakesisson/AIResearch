import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Textarea,
  Text,
  Box,
  FormHelperText,
  Alert,
  AlertIcon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  SimpleGrid,
  HStack,
  IconButton,
} from '@chakra-ui/react'
import { useState } from 'react'
import { AddIcon, DeleteIcon } from '@chakra-ui/icons'

export interface ResumeFormData {
  linkedInFiles: {
    contacts?: File
    experience?: File
    education?: File
    skills?: File
    certifications?: File
  }
  basics: {
    name: string
    email: string
    phone: string
    website: string
    summary: string
    location: {
      city: string
      countryCode: string
    }
  }
  work: Array<{
    company: string
    position: string
    startDate: string
    endDate: string
    summary: string
  }>
  education: Array<{
    institution: string
    area: string
    studyType: string
    startDate: string
    endDate: string
  }>
  skills: Array<{
    name: string
    level: string
    keywords: string[]
  }>
}

interface ResumeFormProps {
  onSubmit: (data: ResumeFormData) => void
  isGenerating: boolean
}

export function ResumeForm({ onSubmit, isGenerating }: ResumeFormProps) {
  const [formData, setFormData] = useState<ResumeFormData>({
    linkedInFiles: {},
    basics: {
      name: '',
      email: '',
      phone: '',
      website: '',
      summary: '',
      location: {
        city: '',
        countryCode: '',
      },
    },
    work: [{ company: '', position: '', startDate: '', endDate: '', summary: '' }],
    education: [{ institution: '', area: '', studyType: '', startDate: '', endDate: '' }],
    skills: [{ name: '', level: '', keywords: [] }],
  })

  const [dragActive, setDragActive] = useState<string>('')
  const [uploadErrors, setUploadErrors] = useState<{ [key: string]: string }>({})

  const handleFileUpload = (fileType: keyof ResumeFormData['linkedInFiles']) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    handleFileSelection(fileType, file)
  }

  const handleFileSelection = (fileType: string, file: File | undefined) => {
    if (!file) return

    // Validate file type
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setUploadErrors(prev => ({ ...prev, [fileType]: 'Please upload a valid CSV file' }))
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadErrors(prev => ({ ...prev, [fileType]: 'File size must be less than 10MB' }))
      return
    }

    setUploadErrors(prev => ({ ...prev, [fileType]: '' }))
    setFormData(prev => ({
      ...prev,
      linkedInFiles: { ...prev.linkedInFiles, [fileType]: file }
    }))
  }

  const handleDrag = (fileType: string) => (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(fileType)
    } else if (e.type === 'dragleave') {
      setDragActive('')
    }
  }

  const handleDrop = (fileType: string) => (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive('')
    
    const file = e.dataTransfer.files?.[0]
    handleFileSelection(fileType, file)
  }

  const addWorkExperience = () => {
    setFormData(prev => ({
      ...prev,
      work: [...prev.work, { company: '', position: '', startDate: '', endDate: '', summary: '' }]
    }))
  }

  const removeWorkExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      work: prev.work.filter((_, i) => i !== index)
    }))
  }

  const updateWorkExperience = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      work: prev.work.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const isValid = formData.basics.name && formData.basics.email

  const FileUploadBox = ({ 
    fileType, 
    label, 
    description 
  }: { 
    fileType: keyof ResumeFormData['linkedInFiles']
    label: string
    description: string 
  }) => (
    <FormControl>
      <FormLabel fontSize="sm">{label}</FormLabel>
      <Box
        border="2px dashed"
        borderColor={dragActive === fileType ? "brand.500" : "gray.300"}
        borderRadius="md"
        p={4}
        textAlign="center"
        bg={dragActive === fileType ? "brand.50" : "gray.50"}
        cursor="pointer"
        transition="all 0.2s"
        minH="80px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        onDragEnter={handleDrag(fileType)}
        onDragLeave={handleDrag(fileType)}
        onDragOver={handleDrag(fileType)}
        onDrop={handleDrop(fileType)}
        onClick={() => document.getElementById(`file-upload-${fileType}`)?.click()}
      >
        <Input
          id={`file-upload-${fileType}`}
          type="file"
          accept=".csv"
          onChange={handleFileUpload(fileType)}
          display="none"
        />
        {formData.linkedInFiles[fileType] ? (
          <VStack spacing={1}>
            <Text color="green.600" fontWeight="medium" fontSize="sm">
              ✅ {formData.linkedInFiles[fileType]!.name}
            </Text>
            <Text fontSize="xs" color="gray.600">
              Click to change file
            </Text>
          </VStack>
        ) : (
          <VStack spacing={1}>
            <Text color="gray.600" fontSize="sm">
              📄 Drop {label} here or click
            </Text>
            <Text fontSize="xs" color="gray.500">
              {description}
            </Text>
          </VStack>
        )}
      </Box>
      {uploadErrors[fileType] && (
        <Alert status="error" mt={2} size="sm">
          <AlertIcon />
          <Text fontSize="sm">{uploadErrors[fileType]}</Text>
        </Alert>
      )}
    </FormControl>
  )

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        
        {/* LinkedIn Export Files */}
        <Accordion defaultIndex={[0]} allowMultiple>
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                <Text fontWeight="medium">LinkedIn Export Files (Optional)</Text>
                <Text fontSize="sm" color="gray.600">Upload CSV files from your LinkedIn data export</Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FileUploadBox 
                  fileType="experience" 
                  label="Experience.csv" 
                  description="Work experience data"
                />
                <FileUploadBox 
                  fileType="education" 
                  label="Education.csv" 
                  description="Education history data"
                />
                <FileUploadBox 
                  fileType="skills" 
                  label="Skills.csv" 
                  description="Skills and endorsements"
                />
                <FileUploadBox 
                  fileType="certifications" 
                  label="Certifications.csv" 
                  description="Certifications and licenses"
                />
              </SimpleGrid>
              <FormHelperText mt={4}>
                <Text fontSize="sm">
                  These files can be obtained from your LinkedIn data export. They will be automatically parsed to populate your resume.
                  <Text as="a" href="https://www.linkedin.com/help/linkedin/answer/50191" target="_blank" color="brand.500" ml={1}>
                    Learn how to export your LinkedIn data →
                  </Text>
                </Text>
              </FormHelperText>
            </AccordionPanel>
          </AccordionItem>

          {/* Basic Information */}
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                <Text fontWeight="medium">Basic Information *</Text>
                <Text fontSize="sm" color="gray.600">Personal details and contact information</Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    value={formData.basics.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      basics: { ...prev.basics, name: e.target.value }
                    }))}
                    placeholder="John Doe"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={formData.basics.email}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      basics: { ...prev.basics, email: e.target.value }
                    }))}
                    placeholder="john@example.com"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Phone</FormLabel>
                  <Input
                    type="tel"
                    value={formData.basics.phone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      basics: { ...prev.basics, phone: e.target.value }
                    }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Website</FormLabel>
                  <Input
                    type="url"
                    value={formData.basics.website}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      basics: { ...prev.basics, website: e.target.value }
                    }))}
                    placeholder="https://johndoe.com"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>City</FormLabel>
                  <Input
                    value={formData.basics.location.city}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      basics: { 
                        ...prev.basics, 
                        location: { ...prev.basics.location, city: e.target.value }
                      }
                    }))}
                    placeholder="San Francisco"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Country Code</FormLabel>
                  <Input
                    value={formData.basics.location.countryCode}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      basics: { 
                        ...prev.basics, 
                        location: { ...prev.basics.location, countryCode: e.target.value }
                      }
                    }))}
                    placeholder="US"
                    maxLength={2}
                  />
                </FormControl>
              </SimpleGrid>
              <FormControl mt={4}>
                <FormLabel>Professional Summary</FormLabel>
                <Textarea
                  value={formData.basics.summary}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    basics: { ...prev.basics, summary: e.target.value }
                  }))}
                  placeholder="A brief professional summary highlighting your key strengths and career objectives..."
                  rows={4}
                />
              </FormControl>
            </AccordionPanel>
          </AccordionItem>

          {/* Work Experience */}
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                <Text fontWeight="medium">Work Experience</Text>
                <Text fontSize="sm" color="gray.600">Add or override work experience entries</Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <VStack spacing={4} align="stretch">
                {formData.work.map((work, index) => (
                  <Box key={index} p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                    <HStack justify="space-between" mb={3}>
                      <Text fontWeight="medium" fontSize="sm">Experience #{index + 1}</Text>
                      {formData.work.length > 1 && (
                        <IconButton
                          aria-label="Remove experience"
                          icon={<DeleteIcon />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => removeWorkExperience(index)}
                        />
                      )}
                    </HStack>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                      <FormControl>
                        <FormLabel fontSize="sm">Company</FormLabel>
                        <Input
                          size="sm"
                          value={work.company}
                          onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
                          placeholder="Company Name"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">Position</FormLabel>
                        <Input
                          size="sm"
                          value={work.position}
                          onChange={(e) => updateWorkExperience(index, 'position', e.target.value)}
                          placeholder="Job Title"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">Start Date</FormLabel>
                        <Input
                          size="sm"
                          type="date"
                          value={work.startDate}
                          onChange={(e) => updateWorkExperience(index, 'startDate', e.target.value)}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">End Date</FormLabel>
                        <Input
                          size="sm"
                          type="date"
                          value={work.endDate}
                          onChange={(e) => updateWorkExperience(index, 'endDate', e.target.value)}
                          placeholder="Leave empty if current"
                        />
                      </FormControl>
                    </SimpleGrid>
                    <FormControl mt={3}>
                      <FormLabel fontSize="sm">Summary</FormLabel>
                      <Textarea
                        size="sm"
                        value={work.summary}
                        onChange={(e) => updateWorkExperience(index, 'summary', e.target.value)}
                        placeholder="Describe your role and achievements..."
                        rows={3}
                      />
                    </FormControl>
                  </Box>
                ))}
                <Button
                  leftIcon={<AddIcon />}
                  variant="outline"
                  size="sm"
                  onClick={addWorkExperience}
                >
                  Add Work Experience
                </Button>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>

        {/* Generate Button */}
        <Button
          type="submit"
          colorScheme="brand"
          size="lg"
          isLoading={isGenerating}
          loadingText="Generating JSON Resume..."
          isDisabled={!isValid}
        >
          Generate JSON Resume
        </Button>
      </VStack>
    </form>
  )
}

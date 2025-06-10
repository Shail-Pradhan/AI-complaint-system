import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  useToast,
  Container,
  Heading,
  Textarea,
  Select,
  Image,
  VStack,
  useColorModeValue,
  Spinner,
  Center,
  Collapse,
  Flex,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import Layout from '../../components/Layout'
import { useRouter } from 'next/router'
import axios from 'axios'
import AIAnalysisDisplay from '../../components/AIAnalysisDisplay'
import TypingAnimation from '../../components/TypingAnimation'
import { FaList } from 'react-icons/fa'
import { Icon } from '@chakra-ui/react'

interface ComplaintForm {
  title: string
  description: string
  district: 'Gangtok' | 'Mangan' | 'Pakyong' | 'Namchi' | 'Gyalshing' | 'Soreng'
  location: string
}

export default function NewComplaint() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [complaintAnalysis, setComplaintAnalysis] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showTypingAnimation, setShowTypingAnimation] = useState(false)
  const [showFinalAnalysis, setShowFinalAnalysis] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const analysisRef = useRef<HTMLDivElement>(null)
  const { register, handleSubmit, formState: { errors } } = useForm<ComplaintForm>()
  const { user } = useAuth()
  const router = useRouter()
  const toast = useToast()

  useEffect(() => {
    if (isSubmitted && analysisRef.current) {
      analysisRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [isSubmitted, isAnalyzing, showTypingAnimation])

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      setSelectedImage(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setPreviewUrl(null)
  }

  const pollForAnalysis = async (complaintId: string) => {
    const maxAttempts = 10
    const delayMs = 2000
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      console.log(`Polling attempt ${attempt + 1} for analysis...`)
      const response = await axios.get(`/api/complaints/${complaintId}`)
      
      if (response.data.ai_analysis) {
        console.log('Analysis found:', response.data.ai_analysis)
        return response.data.ai_analysis
      }
      
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
    
    throw new Error('Analysis timed out after maximum attempts')
  }

  const onSubmit = async (data: ComplaintForm) => {
    try {
      setIsLoading(true)
      setIsSubmitted(true)
      const complaintData = {
        ...data,
        citizen_id: user?.email || 'anonymous'
      }

      const complaintResponse = await axios.post('/api/complaints', complaintData)
      const complaintId = complaintResponse.data._id

      if (selectedImage) {
        const formData = new FormData()
        formData.append('file', selectedImage)
        await axios.post(
          `/api/complaints/${complaintId}/image`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        )
      }

      setIsAnalyzing(true)
      
      try {
        const analysis = await pollForAnalysis(complaintId)
        setComplaintAnalysis(analysis)
        setShowTypingAnimation(true)
      } catch (error) {
        console.error('Error getting analysis:', error)
        toast({
          title: 'Analysis Error',
          description: 'Could not retrieve the AI analysis. You can view it later in your complaints.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        })
      } finally {
        setIsAnalyzing(false)
      }

    } catch (error: any) {
      console.error('Error submitting complaint:', error)
      toast({
        title: 'Error submitting complaint',
        description: error.response?.data?.detail || error.message || 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      setIsSubmitted(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTypingComplete = () => {
    setShowTypingAnimation(false)
    setShowFinalAnalysis(true)
  }

  const handleViewComplaints = () => {
    router.push('/complaints')
  }

  const formatAnalysisText = (analysis: any) => {
    const sections = analysis.analysis_text.split('\n')
    const formattedSections = sections.map(section => {
      if (section.startsWith('Department:')) {
        return `**${section}**`
      }
      if (section.startsWith('Analysis:')) {
        return `**Analysis:**\n${section.replace('Analysis:', '')}`
      }
      if (section.startsWith('Officer:')) {
        return `**Officer Recommendation:**\n${section.replace('Officer:', '')}`
      }
      return section
    })
    return formattedSections.join('\n\n')
  }

  return (
    <Layout>
      <Box
        minH="100vh"
        bg={useColorModeValue('gray.50', 'gray.900')}
        pt={{ base: 4, md: 8 }}
        pb={8}
      >
        <Container maxW="container.md">
          <Stack spacing={6}>
            <Box
              bg={useColorModeValue('white', 'gray.800')}
              p={8}
              rounded="xl"
              shadow="base"
            >
              <VStack spacing={8} align="stretch">
                <Heading size="lg">Submit a New Complaint</Heading>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <Stack spacing={6}>
                    <FormControl isRequired>
                      <FormLabel>Title</FormLabel>
                      <Input
                        {...register('title')}
                        placeholder="Brief title of your complaint"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Description</FormLabel>
                      <Textarea
                        {...register('description')}
                        placeholder="Detailed description of your complaint"
                        rows={4}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>District</FormLabel>
                      <Select {...register('district')} placeholder="Select district">
                        <option value="Gangtok">Gangtok</option>
                        <option value="Mangan">Mangan</option>
                        <option value="Pakyong">Pakyong</option>
                        <option value="Namchi">Namchi</option>
                        <option value="Gyalshing">Gyalshing</option>
                        <option value="Soreng">Soreng</option>
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Location</FormLabel>
                      <Input
                        {...register('location')}
                        placeholder="Location of the issue"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Upload Image (Optional)</FormLabel>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        display="none"
                        id="image-upload"
                      />
                      <Button
                        as="label"
                        htmlFor="image-upload"
                        colorScheme="blue"
                        variant="outline"
                        cursor="pointer"
                      >
                        Choose Image
                      </Button>
                      {previewUrl && (
                        <Box mt={4} position="relative">
                          <Image
                            src={previewUrl}
                            alt="Preview"
                            maxH="200px"
                            objectFit="contain"
                          />
                          <Button
                            position="absolute"
                            top={2}
                            right={2}
                            size="sm"
                            colorScheme="red"
                            onClick={removeImage}
                          >
                            Remove
                          </Button>
                        </Box>
                      )}
                    </FormControl>

                    <Button
                      type="submit"
                      colorScheme="blue"
                      size="lg"
                      isLoading={isLoading}
                      loadingText="Submitting..."
                      isDisabled={isSubmitted}
                    >
                      Submit Complaint
                    </Button>
                  </Stack>
                </form>
              </VStack>
            </Box>

            <Box ref={analysisRef}>
              <Collapse in={isSubmitted} animateOpacity>
                <Box
                  bg={useColorModeValue('white', 'gray.800')}
                  p={8}
                  rounded="xl"
                  shadow="base"
                >
                  {isAnalyzing ? (
                    <Center py={8}>
                      <VStack spacing={4}>
                        <Spinner size="xl" color="blue.500" thickness="3px" />
                        <Text fontSize="lg" color="gray.600">
                          Analyzing your complaint...
                        </Text>
                        <Text color="gray.500" fontSize="sm">
                          This may take a few moments
                        </Text>
                      </VStack>
                    </Center>
                  ) : showTypingAnimation ? (
                    <TypingAnimation
                      text={formatAnalysisText(complaintAnalysis)}
                      onComplete={handleTypingComplete}
                      speed={40}
                    />
                  ) : showFinalAnalysis ? (
                    <VStack spacing={6} align="stretch">
                      <AIAnalysisDisplay analysis={complaintAnalysis} />
                      <Flex justify="center" pt={4}>
                        <Button
                          colorScheme="blue"
                          size="lg"
                          onClick={handleViewComplaints}
                          leftIcon={<Icon as={FaList} />}
                        >
                          View All Complaints
                        </Button>
                      </Flex>
                    </VStack>
                  ) : null}
                </Box>
              </Collapse>
            </Box>
          </Stack>
        </Container>
      </Box>
    </Layout>
  )
} 
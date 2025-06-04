import React, { useState } from 'react'
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Spinner,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import Layout from '../../components/Layout'
import { useRouter } from 'next/router'
import axios from 'axios'
import AIAnalysisDisplay from '../../components/AIAnalysisDisplay'

interface ComplaintForm {
  title: string
  description: string
  category: 'infrastructure' | 'public_services' | 'administration' | 'sanitation' | 'others'
  location: string
}

export default function NewComplaint() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [complaintAnalysis, setComplaintAnalysis] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { register, handleSubmit, formState: { errors } } = useForm<ComplaintForm>()
  const { user } = useAuth()
  const router = useRouter()
  const toast = useToast()

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
    const delayMs = 2000 // 2 seconds between attempts
    
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
      const complaintData = {
        ...data,
        citizen_id: user?.email || 'anonymous'
      }

      console.log('Submitting complaint data:', complaintData)
      const complaintResponse = await axios.post('/api/complaints', complaintData)
      console.log('Complaint creation response:', complaintResponse.data)
      
      const complaintId = complaintResponse.data._id

      // Handle image upload if present
      if (selectedImage) {
        console.log('Uploading image for complaint:', complaintId)
        const formData = new FormData()
        formData.append('file', selectedImage)
        const imageResponse = await axios.post(
          `/api/complaints/${complaintId}/image`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        )
        console.log('Image upload response:', imageResponse.data)
      }

      // Show analysis modal and start polling
      onOpen()
      setIsAnalyzing(true)
      
      try {
        const analysis = await pollForAnalysis(complaintId)
        setComplaintAnalysis(analysis)
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
      console.error('Full error object:', error)
      console.error('Error response data:', error.response?.data)
      console.error('Error stack:', error.stack)
      
      toast({
        title: 'Error submitting complaint',
        description: error.response?.data?.detail || error.message || 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    router.push('/complaints')
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
          <Box
            bg={useColorModeValue('white', 'gray.800')}
            p={8}
            rounded="xl"
            shadow="base"
          >
            <VStack spacing={8} align="stretch">
              <Heading size="lg" mb={6}>
                Submit a New Complaint
              </Heading>

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
                    <FormLabel>Category</FormLabel>
                    <Select {...register('category')} placeholder="Select category">
                      <option value="infrastructure">Infrastructure</option>
                      <option value="public_services">Public Services</option>
                      <option value="administration">Administration</option>
                      <option value="sanitation">Sanitation</option>
                      <option value="others">Others</option>
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
                    bgGradient="linear(to-r, blue.400, purple.500)"
                    color="white"
                    size="lg"
                    height="14"
                    fontSize="md"
                    fontWeight="medium"
                    _hover={{
                      bgGradient: 'linear(to-r, blue.500, purple.600)',
                    }}
                    _active={{
                      bgGradient: 'linear(to-r, blue.600, purple.700)',
                    }}
                    isLoading={isLoading}
                  >
                    Submit Complaint
                  </Button>
                </Stack>
              </form>
            </VStack>
          </Box>
        </Container>
      </Box>

      {/* Analysis Modal */}
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        closeOnOverlayClick={false}
        size="2xl"
        isCentered
      >
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent
          bg={useColorModeValue('gray.50', 'gray.900')}
          maxW="800px"
          mx={4}
        >
          <ModalCloseButton />
          <ModalBody p={6}>
            {isAnalyzing ? (
              <VStack py={10} spacing={4}>
                <Spinner
                  thickness="4px"
                  speed="0.65s"
                  emptyColor="gray.200"
                  color="blue.500"
                  size="xl"
                />
                <Text fontSize="lg" fontWeight="medium">
                  Analyzing your complaint...
                </Text>
                <Text color="gray.500">
                  Our AI is processing your complaint to provide detailed insights
                </Text>
              </VStack>
            ) : complaintAnalysis ? (
              <AIAnalysisDisplay analysis={complaintAnalysis} />
            ) : (
              <VStack py={10} spacing={4}>
                <Text fontSize="lg" color="red.500">
                  Could not retrieve analysis
                </Text>
                <Button onClick={handleClose}>
                  View Complaint Status
                </Button>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Layout>
  )
} 
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useColorModeValue,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import Layout from '../../components/Layout'
import { useRouter } from 'next/router'
import axios from 'axios'
import AIAnalysisAnimation from '../../components/AIAnalysisAnimation'

interface ComplaintForm {
  title: string
  description: string
  category: 'infrastructure' | 'public_services' | 'administration' | 'sanitation' | 'others'
  location: string
}

export default function NewComplaint() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submittedComplaintId, setSubmittedComplaintId] = useState<string | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { user } = useAuth()
  const toast = useToast()
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ComplaintForm>()

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: ComplaintForm) => {
    try {
      setIsLoading(true)
      const complaintData = {
        ...data,
        citizen_id: user?.email || 'anonymous'
      }

      const complaintResponse = await axios.post('/api/complaints', complaintData)
      setSubmittedComplaintId(complaintResponse.data._id)
      onOpen() // Open the modal with AI analysis animation

      if (selectedImage && complaintResponse.data._id) {
        const formData = new FormData()
        formData.append('file', selectedImage)
        await axios.post(
          `/api/complaints/${complaintResponse.data._id}/image`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        )
      }

      // Don't show success toast or redirect until animation is complete
    } catch (error: any) {
      console.error('Error submitting complaint:', error)
      toast({
        title: 'Error submitting complaint',
        description: error.response?.data?.detail || 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnimationComplete = () => {
    toast({
      title: 'Complaint submitted successfully',
      status: 'success',
      duration: 5000,
      isClosable: true,
    })
  }

  return (
    <Layout>
      <Box
        position="relative"
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgGradient: "linear(to-br, blue.500, purple.600, green.400)",
          opacity: 0.1,
          borderRadius: "2xl",
        }}
      >
        <Container maxW="container.md" py={8} position="relative">
          <Box
            bg="white"
            borderRadius="2xl"
            p={8}
            boxShadow="xl"
            backdropFilter="blur(10px)"
          >
            <VStack spacing={8} align="stretch">
              <Heading
                size="lg"
                bgGradient="linear(to-r, blue.400, purple.500)"
                bgClip="text"
                letterSpacing="tight"
              >
                Submit a New Complaint
              </Heading>

              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={6}>
                  <FormControl isInvalid={!!errors.title}>
                    <FormLabel
                      fontWeight="medium"
                      color="gray.700"
                    >
                      Title
                    </FormLabel>
                    <Input
                      {...register('title', {
                        required: 'Title is required',
                        minLength: {
                          value: 5,
                          message: 'Title must be at least 5 characters',
                        },
                      })}
                      bg="white"
                      borderColor="gray.200"
                      _hover={{ borderColor: 'purple.400' }}
                      _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px purple.500' }}
                      fontSize="md"
                      h="12"
                    />
                    {errors.title && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.title.message}
                      </Text>
                    )}
                  </FormControl>

                  <FormControl isInvalid={!!errors.category}>
                    <FormLabel
                      fontWeight="medium"
                      color="gray.700"
                    >
                      Category
                    </FormLabel>
                    <Select
                      {...register('category', {
                        required: 'Please select a category',
                      })}
                      bg="white"
                      borderColor="gray.200"
                      _hover={{ borderColor: 'purple.400' }}
                      _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px purple.500' }}
                      h="12"
                    >
                      <option value="">Select a category</option>
                      <option value="infrastructure">Infrastructure</option>
                      <option value="public_services">Public Services</option>
                      <option value="administration">Administration</option>
                      <option value="sanitation">Sanitation</option>
                      <option value="others">Others</option>
                    </Select>
                    {errors.category && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.category.message}
                      </Text>
                    )}
                  </FormControl>

                  <FormControl isInvalid={!!errors.location}>
                    <FormLabel
                      fontWeight="medium"
                      color="gray.700"
                    >
                      Location
                    </FormLabel>
                    <Input
                      {...register('location', {
                        required: 'Location is required',
                      })}
                      placeholder="Enter the location of the issue"
                      bg="white"
                      borderColor="gray.200"
                      _hover={{ borderColor: 'purple.400' }}
                      _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px purple.500' }}
                      h="12"
                    />
                    {errors.location && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.location.message}
                      </Text>
                    )}
                  </FormControl>

                  <FormControl isInvalid={!!errors.description}>
                    <FormLabel
                      fontWeight="medium"
                      color="gray.700"
                    >
                      Description
                    </FormLabel>
                    <Textarea
                      {...register('description', {
                        required: 'Description is required',
                        minLength: {
                          value: 20,
                          message: 'Description must be at least 20 characters',
                        },
                      })}
                      placeholder="Provide detailed information about your complaint"
                      bg="white"
                      borderColor="gray.200"
                      _hover={{ borderColor: 'purple.400' }}
                      _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px purple.500' }}
                      rows={5}
                    />
                    {errors.description && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.description.message}
                      </Text>
                    )}
                  </FormControl>

                  <FormControl>
                    <FormLabel
                      fontWeight="medium"
                      color="gray.700"
                    >
                      Upload Image (Optional)
                    </FormLabel>
                    <Box
                      borderWidth={2}
                      borderStyle="dashed"
                      borderColor="gray.200"
                      borderRadius="lg"
                      p={4}
                      transition="all 0.2s"
                      _hover={{ borderColor: 'purple.400' }}
                      position="relative"
                    >
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        height="100%"
                        width="100%"
                        position="absolute"
                        top="0"
                        left="0"
                        opacity="0"
                        aria-hidden="true"
                        cursor="pointer"
                      />
                      <Text color="gray.500" textAlign="center">
                        Click to upload or drag and drop
                      </Text>
                    </Box>
                    {imagePreview && (
                      <Box mt={4}>
                        <Image
                          src={imagePreview}
                          maxH="200px"
                          alt="Preview"
                          borderRadius="lg"
                          objectFit="cover"
                        />
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

      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        closeOnOverlayClick={false}
        closeOnEsc={false}
        size="xl"
      >
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent 
          bg={useColorModeValue('white', 'gray.800')}
          borderRadius="xl"
          overflow="hidden"
          boxShadow="xl"
          my="16"
        >
          <ModalCloseButton 
            size="lg"
            p="6"
            color={useColorModeValue('gray.400', 'gray.600')}
            _hover={{
              color: useColorModeValue('gray.600', 'gray.400'),
            }}
          />
          <ModalBody p={0}>
            {submittedComplaintId && (
              <AIAnalysisAnimation
                complaintId={submittedComplaintId}
                onComplete={handleAnimationComplete}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Layout>
  )
} 
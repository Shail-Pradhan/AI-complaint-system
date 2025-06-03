import React, { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Heading,
  Stack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Select,
  HStack,
  Text,
  useColorModeValue,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react'
import { useAuth } from '../../contexts/AuthContext'
import Layout from '../../components/Layout'
import axios from 'axios'
import { format } from 'date-fns'

interface Complaint {
  _id: string
  title: string
  category: string
  status: string
  location: string
  created_at: string
  image_url?: string
  description: string
  ai_analysis?: {
    priority_score: number
    analysis_text: string
    image_analysis?: {
      objects_detected: string[]
      scene_description: string
      severity_score: number
    }
  }
}

export default function Complaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const { user } = useAuth()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    fetchComplaints()
  }, [statusFilter, categoryFilter])

  const fetchComplaints = async () => {
    try {
      let url = '/api/complaints'
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (categoryFilter) params.append('category', categoryFilter)
      if (params.toString()) url += `?${params.toString()}`

      const response = await axios.get(url)
      setComplaints(response.data)
    } catch (error) {
      console.error('Error fetching complaints:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'yellow'
      case 'in_progress':
        return 'blue'
      case 'resolved':
        return 'green'
      case 'escalated':
        return 'red'
      default:
        return 'gray'
    }
  }

  const handleComplaintClick = (complaint: Complaint) => {
    setSelectedComplaint(complaint)
    onOpen()
  }

  return (
    <Layout>
      <Container maxW="container.xl" py={8}>
        <Stack spacing={8}>
          <Box>
            <Heading size="lg" mb={6}>
              {user?.role === 'citizen' ? 'My Complaints' : 'All Complaints'}
            </Heading>

            <HStack spacing={4} mb={6}>
              <Select
                placeholder="Filter by Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                maxW="200px"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="escalated">Escalated</option>
              </Select>

              <Select
                placeholder="Filter by Category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                maxW="200px"
              >
                <option value="infrastructure">Infrastructure</option>
                <option value="public_services">Public Services</option>
                <option value="administration">Administration</option>
                <option value="sanitation">Sanitation</option>
                <option value="others">Others</option>
              </Select>
            </HStack>
          </Box>

          <Box
            bg={bgColor}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
            overflow="hidden"
          >
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Title</Th>
                  <Th>Category</Th>
                  <Th>Location</Th>
                  <Th>Status</Th>
                  <Th>Date</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {complaints.map((complaint) => (
                  <Tr key={complaint._id}>
                    <Td>{complaint.title}</Td>
                    <Td>
                      <Badge colorScheme="purple">
                        {complaint.category.replace('_', ' ')}
                      </Badge>
                    </Td>
                    <Td>{complaint.location}</Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(complaint.status)}>
                        {complaint.status.replace('_', ' ')}
                      </Badge>
                    </Td>
                    <Td>
                      {format(new Date(complaint.created_at), 'MMM d, yyyy')}
                    </Td>
                    <Td>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        onClick={() => handleComplaintClick(complaint)}
                      >
                        View Details
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Stack>

        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Complaint Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {selectedComplaint && (
                <Stack spacing={4}>
                  <Box>
                    <Text fontWeight="bold">Title</Text>
                    <Text>{selectedComplaint.title}</Text>
                  </Box>

                  <Box>
                    <Text fontWeight="bold">Description</Text>
                    <Text>{selectedComplaint.description}</Text>
                  </Box>

                  <Box>
                    <Text fontWeight="bold">Category</Text>
                    <Badge colorScheme="purple">
                      {selectedComplaint.category.replace('_', ' ')}
                    </Badge>
                  </Box>

                  <Box>
                    <Text fontWeight="bold">Status</Text>
                    <Badge colorScheme={getStatusColor(selectedComplaint.status)}>
                      {selectedComplaint.status.replace('_', ' ')}
                    </Badge>
                  </Box>

                  <Box>
                    <Text fontWeight="bold">Location</Text>
                    <Text>{selectedComplaint.location}</Text>
                  </Box>

                  {selectedComplaint.ai_analysis && (
                    <>
                      <Box borderTop="1px" borderColor="gray.200" pt={4}>
                        <Text fontWeight="bold" fontSize="lg" mb={2}>
                          AI Analysis
                        </Text>
                        
                        <Box bg="gray.50" p={4} borderRadius="md">
                          <Stack spacing={3}>
                            <Box>
                              <Text fontWeight="semibold">Priority Score</Text>
                              <Badge
                                colorScheme={
                                  selectedComplaint.ai_analysis.priority_score >= 0.7
                                    ? 'red'
                                    : selectedComplaint.ai_analysis.priority_score >= 0.4
                                    ? 'yellow'
                                    : 'green'
                                }
                              >
                                {Math.round(selectedComplaint.ai_analysis.priority_score * 100)}%
                              </Badge>
                            </Box>

                            <Box>
                              <Text fontWeight="semibold">Analysis</Text>
                              <Text>{selectedComplaint.ai_analysis.analysis_text}</Text>
                            </Box>

                            {selectedComplaint.ai_analysis.image_analysis && (
                              <Box>
                                <Text fontWeight="semibold">Image Analysis</Text>
                                <Text>
                                  {selectedComplaint.ai_analysis.image_analysis.scene_description}
                                </Text>
                                {selectedComplaint.ai_analysis.image_analysis.objects_detected.length > 0 && (
                                  <Box mt={2}>
                                    <Text fontWeight="semibold" fontSize="sm">
                                      Objects Detected:
                                    </Text>
                                    <HStack spacing={2} mt={1} flexWrap="wrap">
                                      {selectedComplaint.ai_analysis.image_analysis.objects_detected.map(
                                        (object, index) => (
                                          <Badge key={index} colorScheme="blue">
                                            {object}
                                          </Badge>
                                        )
                                      )}
                                    </HStack>
                                  </Box>
                                )}
                              </Box>
                            )}
                          </Stack>
                        </Box>
                      </Box>
                    </>
                  )}

                  {selectedComplaint.image_url && (
                    <Box>
                      <Text fontWeight="bold">Image</Text>
                      <Image
                        src={selectedComplaint.image_url}
                        alt="Complaint"
                        maxH="300px"
                        objectFit="contain"
                      />
                    </Box>
                  )}

                  <Box>
                    <Text fontWeight="bold">Submitted On</Text>
                    <Text>
                      {format(
                        new Date(selectedComplaint.created_at),
                        'MMMM d, yyyy'
                      )}
                    </Text>
                  </Box>
                </Stack>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </Container>
    </Layout>
  )
} 
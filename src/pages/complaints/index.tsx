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
  district: string
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

// Helper function to extract department from AI analysis
const extractDepartment = (analysisText: string): string => {
  return analysisText?.split('\n')
    .find(line => line.startsWith('Department:'))
    ?.split(':')[1]
    ?.trim() || 'Pending Analysis'
}

export default function Complaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [prioritySort, setPrioritySort] = useState('')
  const { user } = useAuth()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    fetchComplaints()
  }, [statusFilter, prioritySort])

  const fetchComplaints = async () => {
    try {
      let url = '/api/complaints'
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (prioritySort) params.append('priority_sort', prioritySort)
      if (params.toString()) url += `?${params.toString()}`

      const response = await axios.get(url)
      let sortedComplaints = [...response.data]
      
      if (prioritySort && sortedComplaints.length > 0) {
        sortedComplaints.sort((a, b) => {
          const scoreA = a.ai_analysis?.priority_score || 0
          const scoreB = b.ai_analysis?.priority_score || 0
          return prioritySort === 'desc' ? scoreB - scoreA : scoreA - scoreB
        })
      }
      
      setComplaints(sortedComplaints)
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
                placeholder="Sort by Priority"
                value={prioritySort}
                onChange={(e) => setPrioritySort(e.target.value)}
                maxW="200px"
              >
                <option value="desc">High to Low Priority</option>
                <option value="asc">Low to High Priority</option>
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
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th width="15%">Title</Th>
                  <Th width="10%">District</Th>
                  <Th width="15%">Location</Th>
                  <Th width="15%">Recommended Department</Th>
                  <Th width="10%">Priority</Th>
                  <Th width="10%">Status</Th>
                  <Th width="15%">Date</Th>
                  <Th width="10%">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {complaints.map((complaint) => (
                  <Tr key={complaint._id}>
                    <Td>{complaint.title}</Td>
                    <Td>
                      <Badge colorScheme="purple">
                        {complaint.district || "Unknown"}
                      </Badge>
                    </Td>
                    <Td>{complaint.location}</Td>
                    <Td>
                      <Badge colorScheme="blue" fontSize="sm">
                        {complaint.ai_analysis 
                          ? extractDepartment(complaint.ai_analysis.analysis_text)
                          : 'Pending Analysis'}
                      </Badge>
                    </Td>
                    <Td>
                      {complaint.ai_analysis ? (
                        <Badge
                          colorScheme={
                            complaint.ai_analysis.priority_score >= 0.7
                              ? 'red'
                              : complaint.ai_analysis.priority_score >= 0.4
                              ? 'yellow'
                              : 'green'
                          }
                        >
                          {Math.round(complaint.ai_analysis.priority_score * 10)}/10
                        </Badge>
                      ) : (
                        <Badge colorScheme="gray">Pending</Badge>
                      )}
                    </Td>
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
                        View AI Analysis
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
            <ModalHeader>AI Analysis</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {selectedComplaint && (
                <Stack spacing={4}>
                  <Box>
                    <Text fontWeight="bold">Description</Text>
                    <Text>{selectedComplaint.description}</Text>
                  </Box>

                  {selectedComplaint.ai_analysis && (
                    <>
                      <Box borderTop="1px" borderColor="gray.200" pt={4}>
                        <Text fontWeight="bold" fontSize="lg" mb={2}>
                          AI Analysis
                        </Text>
                        
                        <Box bg="gray.50" p={4} borderRadius="md">
                          <Stack spacing={4}>
                            <Box>
                              <Text fontWeight="semibold">Department</Text>
                              <Badge colorScheme="blue" fontSize="sm">
                                {selectedComplaint.ai_analysis.analysis_text.split('\n').find(line => 
                                  line.startsWith('Department:'))?.split(':')[1]?.trim() || 'Not specified'}
                              </Badge>
                            </Box>

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
                                {Math.round(selectedComplaint.ai_analysis.priority_score * 10)}/10
                              </Badge>
                            </Box>

                            <Box>
                              <Text fontWeight="semibold">Analysis</Text>
                              <Text>
                                {selectedComplaint.ai_analysis.analysis_text.split('\n').find(line => 
                                  line.startsWith('Analysis:'))?.split(':')[1]?.trim() || 'No analysis available'}
                              </Text>
                            </Box>

                            <Box>
                              <Text fontWeight="semibold">Officer Recommendation</Text>
                              <Text>
                                {selectedComplaint.ai_analysis.analysis_text.split('\n').find(line => 
                                  line.startsWith('Officer:'))?.split(':')[1]?.trim() || 'No recommendation available'}
                              </Text>
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
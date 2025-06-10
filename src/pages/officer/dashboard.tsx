import React, { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Grid,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  useDisclosure,
  useColorModeValue,
  Stack,
  HStack,
  Text,
  Image,
  Icon,
  SimpleGrid,
} from '@chakra-ui/react'
import { useAuth } from '../../contexts/AuthContext'
import Layout from '../../components/Layout'
import axios from 'axios'
import { format } from 'date-fns'
import { WarningIcon } from '@chakra-ui/icons'
import { useRouter } from 'next/router'

interface Complaint {
  _id: string
  title: string
  description: string
  category: string
  status: string
  location: string
  created_at: string
  image_url?: string
  ai_analysis?: {
    priority_score: number
    analysis_text: string
    department_id: string
    image_analysis?: {
      objects_detected: string[]
      scene_description: string
      severity_score: number
    }
  }
}

interface DashboardStats {
  totalComplaints: number
  pendingComplaints: number
  resolvedComplaints: number
  averageResolutionTime: number
}

export default function OfficerDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    averageResolutionTime: 0,
  })
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [actionDescription, setActionDescription] = useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { user, loading, isAuthenticated } = useAuth()
  const toast = useToast()
  const router = useRouter()

  const bgColor = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
    if (user?.role !== 'officer') {
      const redirectPath = user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'
      router.push(redirectPath)
    }
  }, [loading, isAuthenticated, user, router])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch complaints assigned to the officer
      const complaintsResponse = await axios.get('/api/complaints', {
        params: { assigned_to: user?._id },
      })
      setComplaints(complaintsResponse.data)

      // Fetch officer's dashboard stats
      const statsResponse = await axios.get('/api/analytics/officer-stats')
      setStats(statsResponse.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const handleUpdateStatus = async () => {
    if (!selectedComplaint || !newStatus || !actionDescription) return

    try {
      await axios.put(`/api/complaints/${selectedComplaint._id}`, {
        status: newStatus,
        action_description: actionDescription,
      })

      toast({
        title: 'Status updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      // Refresh data
      fetchDashboardData()
      onClose()
      setNewStatus('')
      setActionDescription('')
    } catch (error) {
      toast({
        title: 'Error updating status',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleComplaintClick = (complaint: Complaint) => {
    setSelectedComplaint(complaint)
    setNewStatus(complaint.status)
    onOpen()
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

  if (loading || !user) {
    return null // Or a loading spinner
  }

  return (
    <Layout>
      <Container maxW="container.xl" py={8}>
        <Box mb={8}>
          <Heading size="lg">Welcome, Officer {user.name}!</Heading>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          <Stat
            px={{ base: 4, md: 8 }}
            py={5}
            shadow="base"
            rounded="lg"
            bg="white"
          >
            <StatLabel>Assigned Complaints</StatLabel>
            <StatNumber>{stats.totalComplaints}</StatNumber>
            <StatHelpText>Total complaints in your department</StatHelpText>
          </Stat>

          <Stat
            px={{ base: 4, md: 8 }}
            py={5}
            shadow="base"
            rounded="lg"
            bg="white"
          >
            <StatLabel>Pending Review</StatLabel>
            <StatNumber>{stats.pendingComplaints}</StatNumber>
            <StatHelpText>Complaints needing attention</StatHelpText>
          </Stat>

          <Stat
            px={{ base: 4, md: 8 }}
            py={5}
            shadow="base"
            rounded="lg"
            bg="white"
          >
            <StatLabel>Resolved This Month</StatLabel>
            <StatNumber>{stats.resolvedComplaints}</StatNumber>
            <StatHelpText>Successfully resolved complaints</StatHelpText>
          </Stat>
        </SimpleGrid>

        <Box bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor} overflow="hidden">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Priority</Th>
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
                  <Td>
                    {complaint.ai_analysis ? (
                      <HStack>
                        <Badge
                          colorScheme={
                            complaint.ai_analysis.priority_score >= 0.7
                              ? 'red'
                              : complaint.ai_analysis.priority_score >= 0.4
                              ? 'yellow'
                              : 'green'
                          }
                          fontSize="sm"
                        >
                          {Math.round(complaint.ai_analysis.priority_score * 100)}%
                        </Badge>
                        {complaint.ai_analysis.priority_score >= 0.7 && (
                          <Icon as={WarningIcon} color="red.500" />
                        )}
                      </HStack>
                    ) : (
                      <Badge colorScheme="gray">N/A</Badge>
                    )}
                  </Td>
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
                  <Td>{format(new Date(complaint.created_at), 'MMM d, yyyy')}</Td>
                  <Td>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => handleComplaintClick(complaint)}
                    >
                      Update Status
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Update Complaint Status</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedComplaint && (
                <Stack spacing={4}>
                  {selectedComplaint.ai_analysis && (
                    <Box
                      bg="blue.50"
                      p={4}
                      borderRadius="lg"
                      borderWidth="1px"
                      borderColor="blue.200"
                    >
                      <Stack spacing={3}>
                        <Heading size="sm" color="blue.700">
                          AI Insights
                        </Heading>
                        
                        <HStack>
                          <Text fontWeight="semibold" color="blue.700">
                            Priority Level:
                          </Text>
                          <Badge
                            colorScheme={
                              selectedComplaint.ai_analysis.priority_score >= 0.7
                                ? 'red'
                                : selectedComplaint.ai_analysis.priority_score >= 0.4
                                ? 'yellow'
                                : 'green'
                            }
                            fontSize="sm"
                          >
                            {Math.round(selectedComplaint.ai_analysis.priority_score * 100)}%
                          </Badge>
                        </HStack>

                        <Box>
                          <Text fontWeight="semibold" color="blue.700">
                            AI Analysis:
                          </Text>
                          <Text color="blue.800">{selectedComplaint.ai_analysis.analysis_text}</Text>
                        </Box>

                        {selectedComplaint.ai_analysis.image_analysis && (
                          <Box>
                            <Text fontWeight="semibold" color="blue.700">
                              Image Analysis:
                            </Text>
                            <Text color="blue.800">
                              {selectedComplaint.ai_analysis.image_analysis.scene_description}
                            </Text>
                            {selectedComplaint.ai_analysis.image_analysis.objects_detected.length > 0 && (
                              <Box mt={2}>
                                <Text fontWeight="semibold" fontSize="sm" color="blue.700">
                                  Objects Detected:
                                </Text>
                                <HStack spacing={2} mt={1} flexWrap="wrap">
                                  {selectedComplaint.ai_analysis.image_analysis.objects_detected.map(
                                    (object, index) => (
                                      <Badge key={index} colorScheme="blue" variant="subtle">
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
                  )}

                  <FormControl mb={4}>
                    <FormLabel>New Status</FormLabel>
                    <Select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="escalated">Escalated</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Action Description</FormLabel>
                    <Textarea
                      value={actionDescription}
                      onChange={(e) => setActionDescription(e.target.value)}
                      placeholder="Describe the action taken or reason for status change"
                      rows={4}
                    />
                  </FormControl>

                  {selectedComplaint.image_url && (
                    <Box>
                      <Text fontWeight="bold">Complaint Image</Text>
                      <Image
                        src={selectedComplaint.image_url}
                        alt="Complaint"
                        maxH="200px"
                        objectFit="contain"
                        borderRadius="md"
                      />
                    </Box>
                  )}
                </Stack>
              )}
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handleUpdateStatus}>
                Update
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </Layout>
  )
} 
import React, { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Button,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Text,
  Skeleton,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'
import Link from 'next/link'
import axios from 'axios'
import { format } from 'date-fns'
import AIAnalysisDisplay from '../components/AIAnalysisDisplay'

interface DashboardStats {
  total_complaints: number
  active_complaints: number
  resolved_complaints: number
  recent_complaints: Array<{
    _id: string
    title: string
    status: string
    district: string
    location: string
    description: string
    created_at: string
    ai_analysis?: {
      priority_score: number
      analysis_text: string
      officer_recommendation: string
      image_analysis?: {
        objects_detected: string[]
        scene_description: string
        severity_score: number
      }
    }
  }>
}

// Helper function to extract department from AI analysis
const extractDepartment = (analysisText?: string): string => {
  return analysisText?.split('\n')
    .find(line => line.startsWith('Department:'))
    ?.split(':')[1]
    ?.trim() || 'Pending Analysis'
}

export default function Dashboard() {
  const { user, loading, isAuthenticated } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [selectedComplaint, setSelectedComplaint] = useState<DashboardStats['recent_complaints'][0] | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const router = useRouter()
  const toast = useToast()

  const bgColor = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
    if (user?.role !== 'citizen') {
      const redirectPath = user?.role === 'admin' ? '/admin/dashboard' : '/officer/dashboard'
      router.push(redirectPath)
    }
  }, [loading, isAuthenticated, user, router])

  useEffect(() => {
    if (user?.role === 'citizen') {
      fetchDashboardStats()
    }
  }, [user])

  const fetchDashboardStats = async () => {
    try {
      console.log('Fetching dashboard stats for user:', user)
      const response = await axios.get('/api/analytics/citizen-stats')
      console.log('Dashboard stats response:', response.data)
      setStats(response.data)
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error.response || error)
      toast({
        title: 'Error fetching statistics',
        description: error.response?.data?.detail || 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoadingStats(false)
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

  const handleViewAnalysis = (complaint: DashboardStats['recent_complaints'][0]) => {
    setSelectedComplaint(complaint)
    onOpen()
  }

  if (loading || !user) {
    return null
  }

  return (
    <Layout>
      <Container maxW="container.xl" py={8}>
        <Box mb={8}>
          <Heading size="lg">Welcome, {user.name}!</Heading>
          <Text color="gray.600" mt={2}>
            Here's an overview of complaints submitted by citizens.
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          <Skeleton isLoaded={!isLoadingStats}>
            <Stat
              px={{ base: 4, md: 8 }}
              py={5}
              shadow="base"
              rounded="lg"
              bg={bgColor}
            >
              <StatLabel>Total Complaints</StatLabel>
              <StatNumber>{stats?.total_complaints || 0}</StatNumber>
              <StatHelpText>Your submitted complaints</StatHelpText>
            </Stat>
          </Skeleton>

          <Skeleton isLoaded={!isLoadingStats}>
            <Stat
              px={{ base: 4, md: 8 }}
              py={5}
              shadow="base"
              rounded="lg"
              bg={bgColor}
            >
              <StatLabel>Active Complaints</StatLabel>
              <StatNumber>{stats?.active_complaints || 0}</StatNumber>
              <StatHelpText>Currently being processed</StatHelpText>
            </Stat>
          </Skeleton>

          <Skeleton isLoaded={!isLoadingStats}>
            <Stat
              px={{ base: 4, md: 8 }}
              py={5}
              shadow="base"
              rounded="lg"
              bg={bgColor}
            >
              <StatLabel>Resolved Complaints</StatLabel>
              <StatNumber>{stats?.resolved_complaints || 0}</StatNumber>
              <StatHelpText>Successfully resolved</StatHelpText>
            </Stat>
          </Skeleton>
        </SimpleGrid>

        <Box mb={8}>
          <Link href="/complaints/new">
            <Button colorScheme="blue" size="lg">
              Submit New Complaint
            </Button>
          </Link>
        </Box>

        <Box>
          <Heading size="md" mb={4}>Recent Complaints</Heading>
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
                  <Th width="15%">Submitted On</Th>
                  <Th width="10%">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {isLoadingStats ? (
                  [...Array(3)].map((_, index) => (
                    <Tr key={index}>
                      <Td><Skeleton height="20px" /></Td>
                      <Td><Skeleton height="20px" /></Td>
                      <Td><Skeleton height="20px" /></Td>
                      <Td><Skeleton height="20px" /></Td>
                      <Td><Skeleton height="20px" /></Td>
                      <Td><Skeleton height="20px" /></Td>
                      <Td><Skeleton height="20px" /></Td>
                      <Td><Skeleton height="20px" /></Td>
                    </Tr>
                  ))
                ) : stats?.recent_complaints.length ? (
                  stats.recent_complaints.map((complaint) => (
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
                      <Td>{format(new Date(complaint.created_at), 'MMM d, yyyy')}</Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => handleViewAnalysis(complaint)}
                          isDisabled={!complaint.ai_analysis}
                        >
                          View AI Analysis
                        </Button>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={8} textAlign="center" py={4}>
                      <Text color="gray.500">No complaints submitted yet</Text>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </Box>

        {/* AI Analysis Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>AI Analysis for {selectedComplaint?.title}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedComplaint?.ai_analysis ? (
                <AIAnalysisDisplay analysis={selectedComplaint.ai_analysis} />
              ) : (
                <Text>No AI analysis available for this complaint.</Text>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </Container>
    </Layout>
  )
} 
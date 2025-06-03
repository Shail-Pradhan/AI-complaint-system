import { useEffect } from 'react'
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useAuth } from '../../contexts/AuthContext'
import Layout from '../../components/Layout'
import Link from 'next/link'

export default function AdminDashboard() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const toast = useToast()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
    if (user?.role !== 'admin') {
      const redirectPath = user?.role === 'officer' ? '/officer/dashboard' : '/dashboard'
      router.push(redirectPath)
    }
  }, [loading, isAuthenticated, user, router])

  if (loading || !user) {
    return null // Or a loading spinner
  }

  return (
    <Layout>
      <Container maxW="container.xl" py={8}>
        <Box mb={8}>
          <Heading size="lg">Welcome, Administrator {user.name}!</Heading>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
          <Stat
            px={{ base: 4, md: 8 }}
            py={5}
            shadow="base"
            rounded="lg"
            bg="white"
          >
            <StatLabel>Total Users</StatLabel>
            <StatNumber>0</StatNumber>
            <StatHelpText>Registered users</StatHelpText>
          </Stat>

          <Stat
            px={{ base: 4, md: 8 }}
            py={5}
            shadow="base"
            rounded="lg"
            bg="white"
          >
            <StatLabel>Total Complaints</StatLabel>
            <StatNumber>0</StatNumber>
            <StatHelpText>All complaints</StatHelpText>
          </Stat>

          <Stat
            px={{ base: 4, md: 8 }}
            py={5}
            shadow="base"
            rounded="lg"
            bg="white"
          >
            <StatLabel>Active Officers</StatLabel>
            <StatNumber>0</StatNumber>
            <StatHelpText>Government officers</StatHelpText>
          </Stat>

          <Stat
            px={{ base: 4, md: 8 }}
            py={5}
            shadow="base"
            rounded="lg"
            bg="white"
          >
            <StatLabel>Departments</StatLabel>
            <StatNumber>0</StatNumber>
            <StatHelpText>Active departments</StatHelpText>
          </Stat>
        </SimpleGrid>

        <Box mb={8}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Box bg="white" shadow="base" rounded="lg" p={6}>
              <Heading size="md" mb={4}>Recent Users</Heading>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Role</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {/* Add user rows here */}
                  <Tr>
                    <Td colSpan={3} textAlign="center">No users found</Td>
                  </Tr>
                </Tbody>
              </Table>
              <Box mt={4}>
                <Link href="/admin/users">
                  <Button size="sm" colorScheme="blue">View All Users</Button>
                </Link>
              </Box>
            </Box>

            <Box bg="white" shadow="base" rounded="lg" p={6}>
              <Heading size="md" mb={4}>Department Overview</Heading>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Department</Th>
                    <Th>Officers</Th>
                    <Th>Active Cases</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {/* Add department rows here */}
                  <Tr>
                    <Td colSpan={3} textAlign="center">No departments found</Td>
                  </Tr>
                </Tbody>
              </Table>
              <Box mt={4}>
                <Link href="/admin/departments">
                  <Button size="sm" colorScheme="blue">Manage Departments</Button>
                </Link>
              </Box>
            </Box>
          </SimpleGrid>
        </Box>
      </Container>
    </Layout>
  )
} 
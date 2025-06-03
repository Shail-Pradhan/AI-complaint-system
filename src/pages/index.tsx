import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Container, Heading, Text, Button, VStack, useColorModeValue } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import type { NextPage } from 'next';

const Home: NextPage = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const bgColor = useColorModeValue('gray.50', 'gray.800');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      // Redirect based on user role
      if (user?.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (user?.role === 'officer') {
        router.push('/officer/dashboard');
      } else {
        router.push('/complaints');
      }
    }
  }, [isAuthenticated, user, router]);

  return (
    <Container maxW="container.xl" py={10}>
      <Box bg={bgColor} p={8} borderRadius="lg" boxShadow="base">
        <VStack spacing={6} align="center">
          <Heading size="2xl">Complaint Management System</Heading>
          <Text fontSize="xl" textAlign="center">
            Welcome to the Complaint Management System. Please wait while we redirect you...
          </Text>
          <Button
            colorScheme="blue"
            size="lg"
            onClick={() => router.push('/login')}
          >
            Go to Login
          </Button>
        </VStack>
      </Box>
    </Container>
  );
};

export default Home; 
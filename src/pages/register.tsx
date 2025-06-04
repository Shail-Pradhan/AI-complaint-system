import React, { useState, useMemo } from 'react'
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
  useColorModeValue,
  Select,
  InputGroup,
  InputRightElement,
  IconButton,
  Image,
  Center,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import skmgovLogo from '../assets/skmgov.png'

// Dynamically import Layout with no SSR to improve initial page load
const Layout = dynamic(() => import('../components/Layout'), { ssr: false })

interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
  contact?: string
  location?: string
  role: 'citizen' | 'officer'
}

const Register = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { register: registerUser } = useAuth()
  const toast = useToast()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>()

  const password = watch('password')
  const bgColor = useColorModeValue('white', 'gray.700')

  // Memoize the form validation functions
  const validationRules = useMemo(() => ({
    name: {
      required: 'Name is required',
      minLength: {
        value: 2,
        message: 'Name must be at least 2 characters',
      },
    },
    email: {
      required: 'Email is required',
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'Invalid email address',
      },
    },
    password: {
      required: 'Password is required',
      minLength: {
        value: 6,
        message: 'Password must be at least 6 characters',
      },
    },
    confirmPassword: {
      required: 'Please confirm your password',
      validate: (value: string) => value === password || 'The passwords do not match',
    },
    role: {
      required: 'Please select a role',
    },
  }), [password])

  const onSubmit = async (data: RegisterForm) => {
    try {
      setIsLoading(true)
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        contact: data.contact,
        location: data.location,
        role: data.role,
      })
      toast({
        title: 'Registration successful',
        description: 'You can now log in with your credentials.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.message || 'An error occurred during registration.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
        <Stack spacing="8">
          <Stack spacing="6">
            <Stack spacing={{ base: '2', md: '3' }} textAlign="center">
              <Center>
                <Image src={skmgovLogo.src} alt="SKM Government Logo" height="80px" mb={4} />
              </Center>
              <Heading size={{ base: 'xs', md: 'sm' }}>Create an account</Heading>
              <Text color="gray.600">
                Already have an account?{' '}
                <Link href="/login">
                  <Text as="span" color="blue.500" _hover={{ textDecoration: 'underline' }}>
                    Sign in
                  </Text>
                </Link>
              </Text>
            </Stack>
          </Stack>
          <Box
            py={{ base: '0', sm: '8' }}
            px={{ base: '4', sm: '10' }}
            bg={bgColor}
            boxShadow={{ base: 'none', sm: 'md' }}
            borderRadius={{ base: 'none', sm: 'xl' }}
          >
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing="6">
                <Stack spacing="5">
                  <FormControl isInvalid={!!errors.name}>
                    <FormLabel>Full Name</FormLabel>
                    <Input {...register('name', validationRules.name)} />
                    {errors.name && (
                      <Text color="red.500" fontSize="sm">
                        {errors.name.message}
                      </Text>
                    )}
                  </FormControl>

                  <FormControl isInvalid={!!errors.email}>
                    <FormLabel>Email</FormLabel>
                    <Input type="email" {...register('email', validationRules.email)} />
                    {errors.email && (
                      <Text color="red.500" fontSize="sm">
                        {errors.email.message}
                      </Text>
                    )}
                  </FormControl>

                  <FormControl isInvalid={!!errors.password}>
                    <FormLabel>Password</FormLabel>
                    <InputGroup>
                      <Input 
                        type={showPassword ? 'text' : 'password'} 
                        {...register('password', validationRules.password)} 
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                          onClick={() => setShowPassword(!showPassword)}
                          variant="ghost"
                          size="sm"
                        />
                      </InputRightElement>
                    </InputGroup>
                    {errors.password && (
                      <Text color="red.500" fontSize="sm">
                        {errors.password.message}
                      </Text>
                    )}
                  </FormControl>

                  <FormControl isInvalid={!!errors.confirmPassword}>
                    <FormLabel>Confirm Password</FormLabel>
                    <InputGroup>
                      <Input 
                        type={showConfirmPassword ? 'text' : 'password'} 
                        {...register('confirmPassword', validationRules.confirmPassword)} 
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          variant="ghost"
                          size="sm"
                        />
                      </InputRightElement>
                    </InputGroup>
                    {errors.confirmPassword && (
                      <Text color="red.500" fontSize="sm">
                        {errors.confirmPassword.message}
                      </Text>
                    )}
                  </FormControl>

                  <FormControl>
                    <FormLabel>Contact Number (Optional)</FormLabel>
                    <Input {...register('contact')} />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Location (Optional)</FormLabel>
                    <Input {...register('location')} />
                  </FormControl>

                  <FormControl isInvalid={!!errors.role}>
                    <FormLabel>Role</FormLabel>
                    <Select {...register('role', validationRules.role)} defaultValue="">
                      <option value="" disabled>Select a role</option>
                      <option value="citizen">Citizen</option>
                      <option value="officer">Government Officer</option>
                    </Select>
                    {errors.role && (
                      <Text color="red.500" fontSize="sm">
                        {errors.role.message}
                      </Text>
                    )}
                  </FormControl>
                </Stack>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  fontSize="md"
                  isLoading={isLoading}
                >
                  Create Account
                </Button>
              </Stack>
            </form>
          </Box>
        </Stack>
      </Container>
    </Layout>
  )
}

export default Register
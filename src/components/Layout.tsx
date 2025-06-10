import React from 'react'
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  useColorModeValue,
  Stack,
  Container,
  Text,
  Image,
} from '@chakra-ui/react'
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'
import Link from 'next/link'
import skmgovLogo from '../assets/skmgov.png'

interface NavItem {
  label: string
  href: string
  roles?: string[]
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    roles: ['citizen', 'officer', 'admin'],
  },
  {
    label: 'Submit Complaint',
    href: '/complaints/new',
    roles: ['citizen'],
  },
  {
    label: 'Complaints',
    href: '/complaints',
    roles: ['citizen'],
  },
  {
    label: 'Department Dashboard',
    href: '/officer/dashboard',
    roles: ['officer'],
  },
  {
    label: 'Admin Dashboard',
    href: '/admin/dashboard',
    roles: ['admin'],
  },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { user, logout } = useAuth()
  const router = useRouter()

  const filteredNavItems = NAV_ITEMS.filter(
    item => !item.roles || (user && item.roles.includes(user.role))
  )

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Box
        bg={useColorModeValue('white', 'gray.800')}
        px={4}
        boxShadow="sm"
        position="fixed"
        width="full"
        zIndex={999}
      >
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <IconButton
            size="md"
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label="Open Menu"
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems="center">
            <Box cursor="pointer" fontWeight="bold" fontSize="xl">
              <Link href="/">
                <HStack spacing={2}>
                  <Image src={skmgovLogo.src} alt="SKM Government Logo" height="40px" />
                  <Text color="brand.500" fontSize="md">AI Automated Complaint Redressal and Recognition System</Text>
                </HStack>
              </Link>
            </Box>
            <HStack as="nav" spacing={4} display={{ base: 'none', md: 'flex' }}>
              {filteredNavItems.map((item) => (
                <Link key={item.label} href={item.href}>
                  <Button
                    variant="ghost"
                    p={2}
                    fontSize="sm"
                    fontWeight={router.pathname === item.href ? 'bold' : 'normal'}
                    color={router.pathname === item.href ? 'brand.500' : undefined}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </HStack>
          </HStack>
          <Flex alignItems="center">
            {user ? (
              <Menu>
                <MenuButton
                  as={Button}
                  rounded="full"
                  variant="link"
                  cursor="pointer"
                  minW={0}
                >
                  {user.name}
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={logout}>Sign Out</MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <Button
                as={Link}
                href="/login"
                fontSize="sm"
                fontWeight={600}
                color="white"
                bg="brand.500"
                _hover={{
                  bg: 'brand.400',
                }}
              >
                Sign In
              </Button>
            )}
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: 'none' }}>
            <Stack as="nav" spacing={4}>
              {filteredNavItems.map((item) => (
                <Link key={item.label} href={item.href}>
                  <Button
                    w="full"
                    variant="ghost"
                    p={2}
                    fontSize="sm"
                    fontWeight={router.pathname === item.href ? 'bold' : 'normal'}
                    color={router.pathname === item.href ? 'brand.500' : undefined}
                    onClick={onClose}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Box>

      <Container maxW="container.xl" pt={20} pb={10}>
        {children}
      </Container>
    </Box>
  )
} 
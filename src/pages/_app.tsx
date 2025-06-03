import React from 'react'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { AuthProvider } from '../contexts/AuthContext'
import type { AppProps } from 'next/app'

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'transparent',
        color: 'gray.800',
      },
    },
  },
  colors: {
    brand: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'medium',
      },
    },
    Input: {
      variants: {
        filled: {
          field: {
            _focus: {
              borderColor: 'purple.500',
            },
          },
        },
      },
    },
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ChakraProvider>
  )
}

export default MyApp 
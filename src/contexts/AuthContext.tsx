import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

// Configure axios defaults
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
axios.defaults.baseURL = API_BASE_URL

interface User {
  _id: string
  email: string
  name: string
  role: 'citizen' | 'officer' | 'admin'
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          const userResponse = await axios.get('/api/users/me')
          setUser(userResponse.data)
        } catch (error) {
          console.error('Token validation failed:', error)
          localStorage.removeItem('token')
          delete axios.defaults.headers.common['Authorization']
        }
      }
      setLoading(false)
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      // Create form data object
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      // Convert FormData to URLSearchParams
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);

      const response = await axios.post('/api/auth/token', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      
      const { access_token } = response.data
      localStorage.setItem('token', access_token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      
      // Get user profile
      const userResponse = await axios.get('/api/users/me')
      setUser(userResponse.data)
      
      // Redirect based on role
      if (userResponse.data.role === 'admin') {
        router.push('/admin/dashboard')
      } else if (userResponse.data.role === 'officer') {
        router.push('/officer/dashboard')
      } else {
        router.push('/dashboard')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password')
      }
      throw new Error(error.response?.data?.detail || 'Login failed')
    }
  }

  const register = async (userData: any) => {
    try {
      await axios.post('/api/auth/register', userData)
      await login(userData.email, userData.password)
    } catch (error: any) {
      console.error('Registration error:', error)
      if (error.response?.status === 400 && error.response?.data?.detail?.includes('already registered')) {
        throw new Error('Email is already registered')
      }
      throw new Error(error.response?.data?.detail || 'Registration failed')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 
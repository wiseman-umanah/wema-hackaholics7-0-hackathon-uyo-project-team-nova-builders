import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { type User } from '../types/foid'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const USERS_STORAGE_KEY = 'foid_users'
const CURRENT_USER_KEY = 'foid_current_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Load current user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem(CURRENT_USER_KEY)
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        localStorage.removeItem(CURRENT_USER_KEY)
      }
    }
  }, [])

  const signup = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      // Get existing users
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY)
      const users: User[] = storedUsers ? JSON.parse(storedUsers) : []

      // Check if email already exists
      if (users.some(u => u.email === userData.email)) {
        return false
      }

      // Create new user
      const newUser: User = {
        ...userData,
        id: generateId(),
        createdAt: new Date().toISOString(),
      }

      // Save to localStorage
      users.push(newUser)
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))

      // Auto-login after signup
      setUser(newUser)
      setIsAuthenticated(true)
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser))

      return true
    } catch (error) {
      console.error('Signup failed:', error)
      return false
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY)
      if (!storedUsers) return false

      const users: User[] = JSON.parse(storedUsers)
      const foundUser = users.find(u => u.email === email && u.password === password)

      if (foundUser) {
        setUser(foundUser)
        setIsAuthenticated(true)
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(foundUser))
        return true
      }

      return false
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem(CURRENT_USER_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout }}>
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

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

/**
 * Authentication Store
 * Modern auth state management with tRPC integration
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: Date
}

interface AuthState {
  // State
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  hydrate: () => void
  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state - DEV: Always logged in
      user: {
        id: 'dev-user-123',
        name: 'Development User',
        email: 'dev@krushr.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dev',
        createdAt: new Date()
      },
      token: 'dev-token-123',
      isAuthenticated: true,
      isLoading: false,

      // Initialize from localStorage - DEV: Always stay logged in
      hydrate: () => {
        if (typeof window !== 'undefined') {
          // DEV MODE: Force development login state
          localStorage.setItem('auth-token', 'dev-token-123')
          set({ 
            user: {
              id: 'dev-user-123',
              name: 'Development User',
              email: 'dev@krushr.com',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dev',
              createdAt: new Date()
            },
            token: 'dev-token-123',
            isAuthenticated: true,
            isLoading: false 
          })
        }
      },

      // Actions
      setUser: (user) => 
        set({ 
          user, 
          isAuthenticated: true,
          isLoading: false 
        }),

      setToken: (token) => {
        // Store token in localStorage for tRPC client
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth-token', token)
        }
        set({ token })
      },

      logout: () => {
        // Clear token from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-token')
        }
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          isLoading: false 
        })
      },

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)
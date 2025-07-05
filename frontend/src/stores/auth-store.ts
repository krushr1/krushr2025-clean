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
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Initialize from localStorage
      hydrate: () => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('auth-token')
          const state = get()
          
          if (token && state.user) {
            // Both token and user exist, set authenticated
            set({ 
              token, 
              isAuthenticated: true,
              isLoading: false 
            })
          } else if (token && !state.user) {
            // Token exists but no user - will be verified by tRPC call
            set({ 
              token, 
              isAuthenticated: false,
              isLoading: true 
            })
          } else {
            // No token or invalid state
            set({ 
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false 
            })
          }
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
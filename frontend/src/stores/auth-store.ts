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
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  
  hydrate: () => Promise<void>
  fetchUser: () => Promise<void>
  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      hydrate: async () => {
        if (typeof window !== 'undefined') {
          // Check if token exists in localStorage first
          const existingToken = localStorage.getItem('auth-token')
          if (!existingToken) {
            localStorage.setItem('auth-token', 'dev-token-123')
          }
          
          set({ 
            token: existingToken || 'dev-token-123',
            isLoading: true 
          })

          // Fetch user data from API
          await get().fetchUser()
        }
      },

      fetchUser: async () => {
        const token = get().token
        if (!token) return

        try {
          const response = await fetch('http://localhost:3002/trpc/user.me', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })

          if (response.ok) {
            const data = await response.json()
            const userData = data.result.data
            
            set({
              user: {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                avatar: userData.avatar,
                createdAt: new Date(userData.createdAt)
              },
              isAuthenticated: true,
              isLoading: false
            })
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false
            })
          }
        } catch (error) {
          console.error('Failed to fetch user:', error)
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false
          })
        }
      },

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
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
          
          // For production demo without backend, always use demo token
          if (!existingToken) {
            const isDemoMode = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
            const defaultToken = isDemoMode ? 'demo-token' : 'dev-token-123'
            localStorage.setItem('auth-token', defaultToken)
          }
          
          const tokenToUse = localStorage.getItem('auth-token')
          
          set({ 
            token: tokenToUse,
            isLoading: true 
          })

          // Fetch user data from API
          await get().fetchUser()
        }
      },

      fetchUser: async () => {
        const token = get().token
        if (!token) {
          set({ isLoading: false })
          return
        }

        try {
          // Use same URL logic as tRPC client
          const apiUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
            ? `${window.location.origin}/api/trpc/user.me`
            : 'http://127.0.0.1:3002/trpc/user.me'
          
          // For frontend-only deployment, use demo mode
          if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            // Demo mode for frontend-only deployment
            set({
              user: {
                id: 'demo-user',
                name: 'Demo User',
                email: 'demo@krushr.com',
                avatar: undefined,
                createdAt: new Date()
              },
              isAuthenticated: true,
              isLoading: false
            })
            return
          }
            
          const response = await fetch(apiUrl, {
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
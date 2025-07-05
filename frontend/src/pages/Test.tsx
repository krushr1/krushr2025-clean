/**
 * Test page to verify tRPC connection and Universal Input Form
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { trpc } from '../lib/trpc'
import { useAuthStore } from '../stores/auth-store'
import UniversalFormDemo from '../components/forms/UniversalFormDemo'
import UniversalInputFormCompact from '../components/forms/UniversalInputFormCompact'
import KanbanQuickCreate from '../components/kanban/KanbanQuickCreate'
import WorkspaceHeader from '../components/workspace/WorkspaceHeader'
import { FloatingInput } from '../components/ui/floating-input'
import { ContentType } from '../types/universal-form'
import { TaskStatus } from '../types/enums'

export default function Test() {
  const [email, setEmail] = useState('alice@krushr.dev')
  const [password, setPassword] = useState('password123')
  const [name, setName] = useState('Test User')
  const [isRegistering, setIsRegistering] = useState(false)

  const { user, isAuthenticated, setUser, setToken, logout } = useAuthStore()
  const navigate = useNavigate()

  // Redirect to home if already authenticated (disabled for integration testing)
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     navigate('/home')
  //   }
  // }, [isAuthenticated, navigate])

  // tRPC hooks
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      setUser(data.user)
      setToken(data.token)
      console.log('✅ Login successful:', data)
    },
    onError: (error) => {
      console.error('❌ Login failed:', error.message)
    }
  })

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      setUser(data.user)
      setToken(data.token)
      console.log('✅ Registration successful:', data)
    },
    onError: (error) => {
      console.error('❌ Registration failed:', error.message)
    }
  })

  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: isAuthenticated,
  })

  const handleLogin = () => {
    console.log('🔐 Attempting login with:', { email, password })
    loginMutation.mutate({ email, password })
  }

  const handleRegister = () => {
    console.log('📝 Attempting registration with:', { email, password, name })
    registerMutation.mutate({ email, password, name })
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">🚀 Krushr tRPC Test</h1>
      
      {isAuthenticated ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h2 className="text-lg font-semibold text-green-800">✅ Authenticated!</h2>
            <p className="text-green-700">Welcome, {user?.name}!</p>
            <p className="text-sm text-green-600">{user?.email}</p>
          </div>
          
          {meQuery.data && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800">Profile from API:</h3>
              <pre className="text-sm text-blue-700 mt-2">
                {JSON.stringify(meQuery.data, null, 2)}
              </pre>
            </div>
          )}
          
          <button
            onClick={logout}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
          
          {/* Universal Input Form Demo */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🎨 Universal Input Form Demo</h2>
            <UniversalFormDemo />
          </div>
          
          {/* Compact Form Integration Demo */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🔧 Workspace Panel Integration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Compact Form Preview */}
              <div>
                <h3 className="text-lg font-medium mb-3">Compact Panel Form</h3>
                <div className="border rounded-lg">
                  <UniversalInputFormCompact 
                    workspaceId="demo-workspace"
                    contentType={ContentType.TASK}
                    maxHeight="400px"
                    integrationMode="panel"
                  />
                </div>
              </div>
              
              {/* Kanban Integration Preview */}
              <div>
                <h3 className="text-lg font-medium mb-3">Kanban Quick Create</h3>
                <div className="space-y-2">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-600 mb-2">To Do Column</div>
                    <KanbanQuickCreate 
                      workspaceId="demo-workspace"
                      columnId="todo"
                      columnStatus={TaskStatus.TODO}
                    />
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-600 mb-2">In Progress Column</div>
                    <KanbanQuickCreate 
                      workspaceId="demo-workspace"
                      columnId="in-progress"
                      columnStatus={TaskStatus.IN_PROGRESS}
                    />
                  </div>
                </div>
              </div>
              
            </div>
            
            {/* Workspace Header Demo */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Workspace Header Integration</h3>
              <div className="border rounded-lg overflow-hidden">
                <WorkspaceHeader 
                  workspaceName="Demo Workspace"
                  workspaceId="demo-workspace"
                  currentPanel="kanban"
                />
              </div>
            </div>
            
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <FloatingInput
              id="email"
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <FloatingInput
              id="password"
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          
          {isRegistering && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <FloatingInput
                id="name"
                type="text"
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <button
              onClick={isRegistering ? handleRegister : handleLogin}
              disabled={loginMutation.isPending || registerMutation.isPending}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loginMutation.isPending || registerMutation.isPending
                ? 'Loading...'
                : isRegistering
                ? 'Register'
                : 'Login'
              }
            </button>
            
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              {isRegistering ? 'Switch to Login' : 'Switch to Register'}
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>Demo credentials:</p>
            <p>Email: alice@krushr.dev</p>
            <p>Password: password123</p>
          </div>
        </div>
      )}
    </div>
  )
}
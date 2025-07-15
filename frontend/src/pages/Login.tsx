/**
 * Login Page
 * User authentication interface
 */

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { FloatingInput } from '../components/ui/floating-input'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react'
import { trpc } from '../lib/trpc'
import { useAuthStore } from '../stores/auth-store'
import KrushrLogo from '../components/common/KrushrLogo'

export default function Login() {
  const navigate = useNavigate()
  const { setUser, setToken } = useAuthStore()
  
  const [email, setEmail] = useState('alice@krushr.dev')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      setUser(data.user)
      setToken(data.token)
      navigate('/board')
    },
    onError: (error) => {
      setError(error.message || 'Invalid email or password')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    loginMutation.mutate({ email, password })
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <KrushrLogo size="xl" />
          </div>
          <p className="text-muted-foreground">Welcome back! Please sign in to continue.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription>
              Enter your email and password to access your workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-20" />
                  <FloatingInput
                    id="email"
                    type="email"
                    label="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-20" />
                  <FloatingInput
                    id="password"
                    type="password"
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                style={{ backgroundColor: '#143197', color: 'white' }}
                disabled={loginMutation.isLoading}
              >
                {loginMutation.isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">New to Krushr?</span>
                </div>
              </div>

              <Link to="/register">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={loginMutation.isLoading}
                >
                  Create Free Account
                </Button>
              </Link>

              <div className="text-center text-sm">
                <span className="text-gray-600">Don't have an account? </span>
                <Link
                  to="/register"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
/**
 * Register Page
 * User registration interface
 */

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { FloatingInput } from '../components/ui/floating-input'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Loader2, Mail, Lock, User, AlertCircle } from 'lucide-react'
import { trpc } from '../lib/trpc'
import { useAuthStore } from '../stores/auth-store'
import KrushrLogo from '../components/common/KrushrLogo'

export default function Register() {
  const navigate = useNavigate()
  const { setUser, setToken } = useAuthStore()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      setUser(data.user)
      setToken(data.token)
      navigate('/board')
    },
    onError: (error) => {
      setError(error.message || 'Registration failed')
    }
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    registerMutation.mutate({
      name: formData.name,
      email: formData.email,
      password: formData.password
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <KrushrLogo size="xl" />
          </div>
          <p className="text-muted-foreground">Create your account to get started</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign up for an account</CardTitle>
            <CardDescription>
              Join Krushr to manage your projects and collaborate with your team
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
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-20" />
                  <FloatingInput
                    id="name"
                    name="name"
                    type="text"
                    label="Full name"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10"
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-20" />
                  <FloatingInput
                    id="email"
                    name="email"
                    type="email"
                    label="Email address"
                    value={formData.email}
                    onChange={handleChange}
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
                    name="password"
                    type="password"
                    label="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10"
                    autoComplete="new-password"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Must be at least 6 characters long
                </p>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-20" />
                  <FloatingInput
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    label="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                    required
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary hover:text-primary/80">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-primary hover:text-primary/80">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={registerMutation.isLoading}
              >
                {registerMutation.isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </Button>

              <div className="text-center text-sm">
                <span className="text-gray-600">Already have an account? </span>
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
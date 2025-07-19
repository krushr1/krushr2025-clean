import { HashRouter, Route, Routes, Navigate } from 'react-router'
import TRPCProvider from './providers/TRPCProvider'
import { useAuthStore } from './stores/auth-store'
import { useEffect } from 'react'
import Test from './pages/Test'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Board from './pages/Board'
import Calendar from './pages/Calendar'
import Notes from './pages/Notes'
import Chat from './pages/Chat'
import Teams from './pages/Teams'
import Projects from './pages/Projects'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Pricing from './pages/Pricing'
import Workspace from './pages/Workspace'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  const { hydrate } = useAuthStore()

  useEffect(() => {
    hydrate().catch(console.error)
  }, [hydrate])

  return (
    <TRPCProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/workspace" replace />} />
          <Route path="/test" element={<Test />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/board" element={<ProtectedRoute><Board /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
          <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/workspace" element={<ProtectedRoute><Workspace /></ProtectedRoute>} />
          <Route path="/workspace/:workspaceId" element={<ProtectedRoute><Workspace /></ProtectedRoute>} />
          <Route path="/workspaces/new" element={<ProtectedRoute><Workspace /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </HashRouter>
    </TRPCProvider>
  )
}
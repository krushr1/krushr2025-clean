import { HashRouter, Route, Routes, Navigate } from 'react-router'
import TRPCProvider from './providers/TRPCProvider'
import { useAuthStore } from './stores/auth-store'
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
import Landing from './pages/Landing'

/**
 * Protected Route Component
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

/**
 * Krushr Project Management Platform
 * Modern tRPC-powered project management with type safety
 */
export default function App() {
  return (
    <TRPCProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
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
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </HashRouter>
    </TRPCProvider>
  )
}
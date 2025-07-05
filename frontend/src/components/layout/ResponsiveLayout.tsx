/**
 * Responsive Layout Component
 * Adaptive layout that works across all device sizes
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet'
import { 
  Menu, 
  Search,
  Settings,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react'
import { useAuthStore } from '../../stores/auth-store'
// import { useRealtimeConnection } from '../../hooks/use-realtime' // Temporarily disabled
import Sidebar from '../project/Sidebar'
import MobileNavigation from './MobileNavigation'
import NotificationBell from '../notifications/NotificationBell'
import ToastContainer from '../notifications/ToastContainer'
import GlobalSearch from '../common/GlobalSearch'
import { cn } from '../../lib/utils'
import KrushrLogo from '../common/KrushrLogo'

interface ResponsiveLayoutProps {
  children: React.ReactNode
}

export default function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  const { user } = useAuthStore()
  // const { isConnected } = useRealtimeConnection() // Temporarily disabled
  const isConnected = true // Mock connected state for now
  const activeWorkspace = null // Mock workspace for now

  // Detect mobile screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Update current page based on URL
  useEffect(() => {
    const path = window.location.pathname.slice(1) || 'home'
    setCurrentPage(path)
  }, [])

  const handlePageChange = (page: string) => {
    setCurrentPage(page)
    const routes: Record<string, string> = {
      home: '/home',
      workspace: '/workspace',
      board: '/board',
      calendar: '/calendar',
      chat: '/chat',
      notes: '/notes',
      teams: '/teams',
      projects: '/projects',
    }
    if (routes[page]) {
      navigate(routes[page])
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Mobile Header */}
      {isMobile && (
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between md:hidden">
          <div className="flex items-center space-x-3">
            {/* Mobile Menu */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <Sidebar currentPage={currentPage} onPageChange={handlePageChange} />
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <KrushrLogo size="md" />
          </div>

          <div className="flex items-center space-x-2">
            {/* Connection Status */}
            <Badge 
              variant={isConnected ? "default" : "outline"} 
              className={cn(
                'text-xs',
                isConnected ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-300"
              )}
            >
              {isConnected ? 'Live' : 'Offline'}
            </Badge>

            {/* Search */}
            <Button variant="ghost" size="sm" className="p-2" onClick={() => setShowSearch(true)}>
              <Search className="w-5 h-5" />
            </Button>

            {/* Notifications */}
            <NotificationBell variant="mobile" />

            {/* User Avatar */}
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <header className="bg-white/95 backdrop-blur-sm border-b border-border px-6 py-4 hidden md:block">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <KrushrLogo size="sm" showText={false} />
                <h1 className="text-xl font-semibold text-foreground">
                  {activeWorkspace?.name || 'Workspace'}
                </h1>
              </div>
              <Badge 
                variant={isConnected ? "default" : "outline"} 
                className={cn(
                  'text-xs',
                  isConnected ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-300"
                )}
              >
                {isConnected ? 'Live' : 'Connecting...'}
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <Button
                variant="outline"
                className="w-64 justify-start text-muted-foreground hover:text-foreground"
                onClick={() => setShowSearch(true)}
              >
                <Search className="mr-2 h-4 w-4" />
                Search...
              </Button>

              {/* Notifications */}
              <NotificationBell variant="desktop" />

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:block">
                  <div className="text-sm font-medium text-foreground">
                    {user?.name || 'User'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user?.email || 'user@example.com'}
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <div className="hidden md:block">
            <Sidebar currentPage={currentPage} onPageChange={handlePageChange} />
          </div>
        )}

        {/* Main Content */}
        <main className={cn(
          'flex-1 overflow-auto',
          isMobile && 'pb-16' // Add padding for mobile navigation
        )}>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <MobileNavigation
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer />

      {/* Global Search */}
      <GlobalSearch 
        open={showSearch}
        onClose={() => setShowSearch(false)}
      />
    </div>
  )
}
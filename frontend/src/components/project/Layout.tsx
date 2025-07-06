import { ReactNode, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router'
import Sidebar from './Sidebar'

interface LayoutProps {
  children: ReactNode
}

/**
 * Main layout component that wraps all pages
 * Provides consistent sidebar navigation and content area
 */
export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [currentPage, setCurrentPage] = useState('home')

  // Update current page based on URL (works with HashRouter)
  useEffect(() => {
    const pathToPageMap: Record<string, string> = {
      '/': 'home',
      '/home': 'home',
      '/workspace': 'workspace',
      '/board': 'board',
      '/calendar': 'calendar',
      '/chat': 'chat',
      '/notes': 'notes',
      '/teams': 'teams',
      '/projects': 'projects',
    }
    
    // For HashRouter, we need to check location.pathname (the part after #)
    // location.pathname is the actual route, location.hash would be empty with HashRouter
    const currentPath = location.pathname
    const page = pathToPageMap[currentPath] || 'home'
    // console.log('Layout - Current path:', currentPath, 'Mapped to page:', page)
    setCurrentPage(page)
  }, [location.pathname])

  const handlePageChange = (page: string) => {
    console.log('Navigation clicked:', page)
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
    console.log('Will navigate to:', routes[page])
    if (routes[page]) {
      console.log('Navigating to:', routes[page])
      navigate(routes[page])
    } else {
      console.log('No route found for page:', page)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onPageChange={handlePageChange} />
      <main className="flex-1 overflow-x-visible overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
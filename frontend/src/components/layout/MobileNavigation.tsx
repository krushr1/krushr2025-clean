
import React from 'react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { 
  Home, 
  BarChart3, 
  Calendar, 
  MessageCircle, 
  StickyNote,
  Users,
  Bell
} from 'lucide-react'
import { useAppStore } from '../../stores/app-store'
import { cn } from '../../lib/utils'

interface MobileNavigationProps {
  currentPage: string
  onPageChange: (page: string) => void
  className?: string
}

export default function MobileNavigation({ 
  currentPage, 
  onPageChange, 
  className 
}: MobileNavigationProps) {
  const { notifications } = useAppStore()
  const unreadCount = notifications.filter(n => !n.is_read).length

  const navigationItems = [
    {
      key: 'home',
      label: 'Home',
      icon: Home,
      href: '/',
      badge: null
    },
    {
      key: 'board',
      label: 'Board',
      icon: BarChart3,
      href: '/board',
      badge: null
    },
    {
      key: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      href: '/calendar',
      badge: null
    },
    {
      key: 'chat',
      label: 'Chat',
      icon: MessageCircle,
      href: '/chat',
      badge: unreadCount > 0 ? unreadCount : null
    },
    {
      key: 'notes',
      label: 'Notes',
      icon: StickyNote,
      href: '/notes',
      badge: null
    }
  ]

  return (
    <nav className={cn(
      'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden',
      className
    )}>
      <div className="grid grid-cols-5 h-16">
        {navigationItems.map((item) => {
          const IconComponent = item.icon
          const isActive = currentPage === item.key
          
          return (
            <Button
              key={item.key}
              variant="ghost"
              className={cn(
                'h-full rounded-none flex flex-col items-center justify-center space-y-1 relative',
                isActive && 'text-blue-600 bg-blue-50'
              )}
              onClick={() => onPageChange(item.key)}
            >
              <div className="relative">
                <IconComponent className={cn(
                  'w-5 h-5',
                  isActive ? 'text-blue-600' : 'text-gray-900/90'
                )} />
                {item.badge && (
                  <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-xs bg-red-500">
                    {item.badge > 9 ? '9+' : item.badge}
                  </Badge>
                )}
              </div>
              <span className={cn(
                'text-xs font-light',
                isActive ? 'text-blue-600' : 'text-gray-900/90'
              )}>
                {item.label}
              </span>
            </Button>
          )
        })}
      </div>
    </nav>
  )
}
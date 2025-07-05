/**
 * Notification Bell Component
 * Clickable bell icon with notification count and dropdown
 */

import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover'
import { Bell } from 'lucide-react'
import { useAppStore } from '../../stores/app-store'
import NotificationCenter from './NotificationCenter'
import { cn } from '../../lib/utils'

interface NotificationBellProps {
  className?: string
  variant?: 'desktop' | 'mobile'
}

export default function NotificationBell({ 
  className,
  variant = 'desktop' 
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications } = useAppStore()
  
  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size={variant === 'mobile' ? 'sm' : 'default'}
          className={cn(
            'relative',
            variant === 'mobile' && 'p-2',
            className
          )}
        >
          <Bell className={cn(
            variant === 'mobile' ? 'w-5 h-5' : 'w-5 h-5'
          )} />
          {unreadCount > 0 && (
            <Badge className={cn(
              'absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500',
              variant === 'mobile' && 'h-4 w-4'
            )}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-96 p-0" 
        align="end"
        side={variant === 'mobile' ? 'bottom' : 'bottom'}
        sideOffset={8}
      >
        <NotificationCenter className="border-0 shadow-none" />
      </PopoverContent>
    </Popover>
  )
}
/**
 * Notification Toast Component
 * Real-time notification alerts that appear as toasts
 */

import React, { useEffect, useState } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { 
  X, 
  Bell, 
  CheckCircle2, 
  MessageCircle, 
  Calendar, 
  UserPlus, 
  AlertTriangle, 
  FileText,
  ExternalLink
} from 'lucide-react'
import { Notification } from '../../../../shared/types'
import { formatDateTime } from '../../../../shared/utils'
import { cn } from '../../lib/utils'

interface NotificationToastProps {
  notification: Notification
  onClose: () => void
  onAction?: () => void
  className?: string
}

export default function NotificationToast({ 
  notification, 
  onClose, 
  onAction,
  className 
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 200)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_assigned':
      case 'task_completed':
      case 'task_updated':
        return <CheckCircle2 className="w-5 h-5 text-blue-600" />
      case 'comment_added':
      case 'mention':
        return <MessageCircle className="w-5 h-5 text-purple-600" />
      case 'meeting_scheduled':
      case 'deadline_reminder':
        return <Calendar className="w-5 h-5 text-green-600" />
      case 'team_invitation':
      case 'user_invited':
        return <UserPlus className="w-5 h-5 text-indigo-600" />
      case 'file_shared':
        return <FileText className="w-5 h-5 text-orange-600" />
      case 'system_alert':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'task_assigned':
      case 'task_completed':
      case 'task_updated':
        return 'border-l-blue-500 bg-blue-50'
      case 'comment_added':
      case 'mention':
        return 'border-l-purple-500 bg-purple-50'
      case 'meeting_scheduled':
      case 'deadline_reminder':
        return 'border-l-green-500 bg-green-50'
      case 'team_invitation':
      case 'user_invited':
        return 'border-l-indigo-500 bg-indigo-50'
      case 'file_shared':
        return 'border-l-orange-500 bg-orange-50'
      case 'system_alert':
        return 'border-l-red-500 bg-red-50'
      default:
        return 'border-l-gray-300 bg-white'
    }
  }

  return (
    <Card className={cn(
      'fixed top-4 right-4 w-96 max-w-[calc(100vw-2rem)] shadow-lg border-l-4 z-50 transition-all duration-200',
      getNotificationColor(notification.type),
      isVisible && !isClosing ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
      className
    )}>
      <div className="p-4">
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {getNotificationIcon(notification.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-2">
                <h4 className="font-medium text-gray-900 text-sm">
                  {notification.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {notification.message}
                </p>
                
                {/* Metadata */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {formatDateTime(notification.created_at)}
                    </span>
                    {notification.sender && (
                      <div className="flex items-center space-x-1">
                        <Avatar className="w-4 h-4">
                          <AvatarImage src={notification.sender.avatar} />
                          <AvatarFallback className="text-xs bg-gray-100">
                            {notification.sender.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-500">
                          {notification.sender.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                onClick={handleClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 mt-3">
              {onAction && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={onAction}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-gray-500 hover:text-gray-700"
                onClick={handleClose}
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
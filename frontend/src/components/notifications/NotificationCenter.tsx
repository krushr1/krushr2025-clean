
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { ScrollArea } from '../ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  Bell, 
  Check, 
  CheckCheck, 
  X, 
  Settings,
  Filter,
  Search,
  MessageCircle,
  Calendar,
  UserPlus,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ExternalLink
} from 'lucide-react'
import { useAppStore } from '../../stores/app-store'
import { Notification } from '../../../../shared/types'
import { formatDateTime } from '../../../../shared/utils'
import { cn } from '../../lib/utils'

interface NotificationCenterProps {
  className?: string
}

export default function NotificationCenter({ className }: NotificationCenterProps) {
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  const { notifications, markNotificationRead } = useAppStore()

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = !searchTerm || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTab = activeTab === 'all' || 
      (activeTab === 'unread' && !notification.is_read) ||
      (activeTab === 'mentions' && notification.type.includes('mention')) ||
      (activeTab === 'tasks' && notification.type.includes('task'))

    return matchesSearch && matchesTab
  })

  const unreadCount = notifications.filter(n => !n.is_read).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_assigned':
      case 'task_completed':
      case 'task_updated':
        return <CheckCircle2 className="w-4 h-4 text-blue-600" />
      case 'comment_added':
      case 'mention':
        return <MessageCircle className="w-4 h-4 text-purple-600" />
      case 'meeting_scheduled':
      case 'deadline_reminder':
        return <Calendar className="w-4 h-4 text-green-600" />
      case 'team_invitation':
      case 'user_invited':
        return <UserPlus className="w-4 h-4 text-indigo-600" />
      case 'file_shared':
        return <FileText className="w-4 h-4 text-orange-600" />
      case 'system_alert':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      default:
        return <Bell className="w-4 h-4 text-gray-600" />
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

  const handleMarkAsRead = (notificationId: string) => {
    markNotificationRead(notificationId)
  }

  const handleMarkAllAsRead = () => {
    notifications
      .filter(n => !n.is_read)
      .forEach(notification => markNotificationRead(notification.id))
  }

  const formatNotificationType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <Card className={cn('h-full flex flex-col', className)}>
      {/* Header */}
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-red-100 text-red-700">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Filter className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      </CardHeader>

      {/* Tabs */}
      <div className="flex-shrink-0 px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">
              Unread
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="mentions" className="text-xs">Mentions</TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs">Tasks</TabsTrigger>
          </TabsList>

          {/* Actions */}
          {unreadCount > 0 && (
            <div className="flex items-center justify-between mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-blue-600 hover:text-blue-700"
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark all as read
              </Button>
            </div>
          )}
        </Tabs>
      </div>

      {/* Notifications List */}
      <ScrollArea className="flex-1">
        <div className="p-6 pt-4 space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No matching notifications' : 'No notifications'}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'You\'re all caught up! New notifications will appear here.'
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'group p-4 rounded-lg border-l-4 transition-all duration-200 hover:shadow-sm cursor-pointer',
                  notification.is_read ? 'bg-white' : getNotificationColor(notification.type),
                  !notification.is_read && 'shadow-sm'
                )}
                onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-2">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        
                        {/* Metadata */}
                        <div className="flex items-center space-x-3 mt-2">
                          <span className="text-xs text-gray-500">
                            {formatDateTime(notification.created_at)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {formatNotificationType(notification.type)}
                          </Badge>
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

                      {/* Actions */}
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkAsRead(notification.id)
                            }}
                            title="Mark as read"
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          title="Open"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          title="Dismiss"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Unread Indicator */}
                    {!notification.is_read && (
                      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full" />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  )
}
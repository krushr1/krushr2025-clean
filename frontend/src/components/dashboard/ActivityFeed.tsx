
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { 
  CheckCircle2, 
  MessageCircle, 
  Plus, 
  Calendar, 
  FileText,
  Users,
  Clock,
  RefreshCw
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface ActivityItem {
  id: string
  type: 'task_created' | 'task_completed' | 'task_assigned' | 'comment_added' | 'file_uploaded' | 'meeting_scheduled'
  user: {
    id: string
    name: string
    avatar?: string
  }
  description: string
  target?: {
    type: 'task' | 'project' | 'team'
    id: string
    name: string
  }
  timestamp: string
  priority?: 'high' | 'medium' | 'low'
}

interface ActivityFeedProps {
  className?: string
}

export default function ActivityFeed({ className }: ActivityFeedProps) {
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'task_completed',
      user: { id: '1', name: 'Sarah Chen', avatar: '' },
      description: 'completed task',
      target: { type: 'task', id: '1', name: 'Database Migration' },
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      priority: 'high'
    },
    {
      id: '2',
      type: 'comment_added',
      user: { id: '2', name: 'Mike Johnson', avatar: '' },
      description: 'added a comment to',
      target: { type: 'task', id: '2', name: 'API Documentation' },
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      type: 'task_created',
      user: { id: '3', name: 'Emma Davis', avatar: '' },
      description: 'created new task',
      target: { type: 'task', id: '3', name: 'User Interface Design' },
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      priority: 'medium'
    },
    {
      id: '4',
      type: 'task_assigned',
      user: { id: '1', name: 'Sarah Chen', avatar: '' },
      description: 'assigned task to Alex Kim',
      target: { type: 'task', id: '4', name: 'Code Review' },
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
    },
    {
      id: '5',
      type: 'meeting_scheduled',
      user: { id: '4', name: 'Alex Kim', avatar: '' },
      description: 'scheduled a meeting for',
      target: { type: 'project', id: '1', name: 'Q1 Planning' },
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString()
    }
  ]

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'task_completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'task_created':
        return <Plus className="w-4 h-4 text-blue-600" />
      case 'task_assigned':
        return <Users className="w-4 h-4 text-purple-600" />
      case 'comment_added':
        return <MessageCircle className="w-4 h-4 text-orange-600" />
      case 'file_uploaded':
        return <FileText className="w-4 h-4 text-gray-600" />
      case 'meeting_scheduled':
        return <Calendar className="w-4 h-4 text-indigo-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'task_completed':
        return 'bg-green-50 border-green-200'
      case 'task_created':
        return 'bg-blue-50 border-blue-200'
      case 'task_assigned':
        return 'bg-purple-50 border-purple-200'
      case 'comment_added':
        return 'bg-orange-50 border-orange-200'
      case 'file_uploaded':
        return 'bg-gray-50 border-gray-200'
      case 'meeting_scheduled':
        return 'bg-indigo-50 border-indigo-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <Card className={cn('h-full flex flex-col', className)}>
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-y-auto">
        <div className="space-y-1">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className={cn(
                'p-4 border-l-4 hover:bg-gray-50 transition-colors cursor-pointer',
                getActivityColor(activity.type),
                index === 0 && 'bg-opacity-50'
              )}
            >
              <div className="flex items-start space-x-3">
                {/* User Avatar */}
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={activity.user.avatar} />
                  <AvatarFallback className="text-xs bg-gray-100">
                    {activity.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    {getActivityIcon(activity.type)}
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {activity.user.name}
                    </span>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {activity.description}{' '}
                    {activity.target && (
                      <span className="font-medium text-gray-900">
                        {activity.target.name}
                      </span>
                    )}
                  </p>

                  {/* Priority Badge */}
                  {activity.priority && (
                    <div className="mt-2">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          'text-xs',
                          activity.priority === 'high' && 'border-red-200 text-red-700 bg-red-50',
                          activity.priority === 'medium' && 'border-orange-200 text-orange-700 bg-orange-50',
                          activity.priority === 'low' && 'border-green-200 text-green-700 bg-green-50'
                        )}
                      >
                        {activity.priority} priority
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="p-4 text-center border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-600 hover:text-gray-900"
            onClick={() => console.log('Loading more activity...')}
          >
            Load more activity
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
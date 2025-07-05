/**
 * Quick Actions Panel
 * Provides fast access to common actions
 */

import React from 'react'
import { useNavigate } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { 
  Plus, 
  Calendar, 
  MessageCircle, 
  FileText, 
  Users, 
  Video,
  Clock,
  Target
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  action: () => void
}

interface QuickActionsProps {
  className?: string
}

export default function QuickActions({ className }: QuickActionsProps) {
  const navigate = useNavigate()
  
  const actions: QuickAction[] = [
    {
      id: 'create-task',
      title: 'Create Task',
      description: 'Add a new task to your board',
      icon: Plus,
      color: 'text-blue-600 bg-blue-50 hover:bg-blue-100',
      action: () => {
        navigate('/board')
      }
    },
    {
      id: 'schedule-meeting',
      title: 'Schedule Meeting',
      description: 'Set up a team meeting',
      icon: Calendar,
      color: 'text-green-600 bg-green-50 hover:bg-green-100',
      action: () => {
        navigate('/calendar')
      }
    },
    {
      id: 'start-chat',
      title: 'Start Chat',
      description: 'Begin a team conversation',
      icon: MessageCircle,
      color: 'text-purple-600 bg-purple-50 hover:bg-purple-100',
      action: () => {
        navigate('/chat')
      }
    },
    {
      id: 'create-note',
      title: 'Quick Note',
      description: 'Capture an idea or note',
      icon: FileText,
      color: 'text-orange-600 bg-orange-50 hover:bg-orange-100',
      action: () => {
        navigate('/notes')
      }
    },
    {
      id: 'invite-member',
      title: 'Invite Member',
      description: 'Add someone to your team',
      icon: Users,
      color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100',
      action: () => {
        navigate('/teams')
      }
    },
    {
      id: 'start-call',
      title: 'Start Call',
      description: 'Begin a video call',
      icon: Video,
      color: 'text-red-600 bg-red-50 hover:bg-red-100',
      action: () => {
        navigate('/chat')
      }
    },
    {
      id: 'track-time',
      title: 'Track Time',
      description: 'Start time tracking',
      icon: Clock,
      color: 'text-teal-600 bg-teal-50 hover:bg-teal-100',
      action: () => {
        navigate('/board')
      }
    },
    {
      id: 'set-goal',
      title: 'Set Goal',
      description: 'Define a new objective',
      icon: Target,
      color: 'text-pink-600 bg-pink-50 hover:bg-pink-100',
      action: () => {
        navigate('/projects')
      }
    }
  ]

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      
      <CardContent className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const IconComponent = action.icon
          
          return (
            <Button
              key={action.id}
              variant="ghost"
              className={cn(
                'h-auto p-4 flex flex-col items-center text-center space-y-2 hover:scale-105 transition-all duration-200',
                action.color
              )}
              onClick={action.action}
            >
              <IconComponent className="w-6 h-6" />
              <div>
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs opacity-75">{action.description}</div>
              </div>
            </Button>
          )
        })}
      </CardContent>
    </Card>
  )
}
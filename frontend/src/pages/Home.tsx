import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import ResponsiveLayout from '../components/layout/ResponsiveLayout'
import ActivityFeed from '../components/dashboard/ActivityFeed'
import QuickActions from '../components/dashboard/QuickActions'
import TasksSummary from '../components/dashboard/TasksSummary'
import UniversalInputForm from '../components/forms/UniversalInputForm'
import { useAuthStore } from '../stores/auth-store'
import { trpc } from '../lib/trpc'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { ContentType } from '../types/universal-form'
import { 
  Calendar, 
  Users, 
  MessageCircle, 
  StickyNote, 
  Plus, 
  Bell,
  Loader2,
  ChevronRight,
  BarChart3
} from 'lucide-react'

export default function Home() {
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [showUniversalForm, setShowUniversalForm] = useState(false)
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])
  
  const { data: notificationData } = trpc.notification.list.useQuery({})
  const { data: workspaces = [] } = trpc.workspace.list.useQuery()
  const notifications = notificationData?.notifications || []
  const activeWorkspace = workspaces[0] // Use first workspace for now

  const unreadNotifications = notifications.filter(n => !n.isRead).length

  const quickNavItems = [
    { 
      title: 'Board', 
      icon: BarChart3, 
      href: '/board', 
      description: 'Manage your kanban boards',
      color: 'text-blue-600 bg-blue-50'
    },
    { 
      title: 'Calendar', 
      icon: Calendar, 
      href: '/calendar', 
      description: 'View deadlines and schedule',
      color: 'text-green-600 bg-green-50'
    },
    { 
      title: 'Chat', 
      icon: MessageCircle, 
      href: '/chat', 
      description: 'Team conversations',
      color: 'text-purple-600 bg-purple-50'
    },
    { 
      title: 'Notes', 
      icon: StickyNote, 
      href: '/notes', 
      description: 'Capture ideas and knowledge',
      color: 'text-orange-600 bg-orange-50'
    },
  ]

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  return (
    <ResponsiveLayout>
      <div className="h-full flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.name?.split(' ')[0] || 'User'}!
              </h1>
              <p className="text-gray-600 mt-1">
                {activeWorkspace ? `Working in ${activeWorkspace.name}` : 'Here\'s what\'s happening today'}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </Badge>
                )}
              </Button>

              <Button onClick={() => setShowUniversalForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Item
              </Button>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Left Column - Quick Navigation & Actions */}
            <div className="space-y-6">
              {/* Quick Navigation */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold">Quick Navigation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {quickNavItems.map((item) => {
                    const IconComponent = item.icon
                    return (
                      <Button
                        key={item.title}
                        variant="ghost"
                        className="w-full justify-between h-auto p-4 hover:bg-gray-50"
                        onClick={() => {
                          console.log('Button clicked:', item.title, item.href);
                          navigate(item.href);
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${item.color}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-gray-900">{item.title}</div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </Button>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <QuickActions />
            </div>

            {/* Middle Column - Tasks Summary */}
            <div>
              <TasksSummary />
            </div>

            {/* Right Column - Activity Feed */}
            <div>
              <ActivityFeed />
            </div>
          </div>
        </div>
      </div>
      
      {/* Universal Input Form */}
      <UniversalInputForm
        open={showUniversalForm}
        onClose={() => setShowUniversalForm(false)}
        onSuccess={(data, type) => {
          console.log('Created:', { data, type })
          setShowUniversalForm(false)
        }}
        contentType={ContentType.MIXED}
        workspaceId={activeWorkspace?.id || 'demo-workspace'}
        allowContentTypeSwitch={true}
        showWorkflowToggles={true}
        showFileUploads={true}
      />
    </ResponsiveLayout>
  )
}

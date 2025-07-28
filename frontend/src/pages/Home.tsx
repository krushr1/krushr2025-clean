import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router'
import ResponsiveLayout from '../components/layout/ResponsiveLayout'
import ActivityFeed from '../components/dashboard/ActivityFeed'
import QuickActions from '../components/dashboard/QuickActions'
import TasksSummary from '../components/dashboard/TasksSummary'
import TaskFilters, { TaskFilter } from '../components/dashboard/TaskFilters'
import UniversalInputForm from '../components/forms/UniversalInputForm'
import ProductivityInsights from '../components/dashboard/ProductivityInsights'
import KeyboardShortcutsHelp from '../components/common/KeyboardShortcutsHelp'
import { KeyboardHint, KeyboardTooltip } from '../components/common/KeyboardHint'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
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
  BarChart3,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

export default function Home() {
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [showUniversalForm, setShowUniversalForm] = useState(false)
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('all')
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])
  
  const { data: notificationData, refetch: refetchNotifications } = trpc.notification.list.useQuery({})
  const { data: workspaces = [], refetch: refetchWorkspaces } = trpc.workspace.list.useQuery()
  const notifications = notificationData?.notifications || []
  const activeWorkspace = workspaces[0] // Use first workspace for now

  const unreadNotifications = notifications.filter(n => !n.isRead).length

  // Calculate tasks due today for greeting
  const { data: allTasks = [] } = trpc.task.list.useQuery(
    { workspaceId: activeWorkspace?.id || '' },
    { enabled: !!activeWorkspace?.id }
  )

  const tasksDueToday = React.useMemo(() => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
    
    return allTasks.filter(task => {
      if (!task.dueDate) return false
      const dueDate = new Date(task.dueDate)
      return dueDate >= todayStart && dueDate < todayEnd
    }).length
  }, [allTasks])

  // Dynamic greeting logic
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return { text: 'Good morning', icon: 'cs-sun' }
    if (hour >= 12 && hour < 17) return { text: 'Good afternoon', icon: 'cs-cloud-sun' }
    if (hour >= 17 && hour < 22) return { text: 'Good evening', icon: 'cs-moon' }
    return { text: 'Working late?', icon: 'cs-moon' }
  }

  const getMotivationalSubtitle = () => {
    const totalTasks = allTasks.filter(task => 
      task.status !== 'DONE' && task.status !== 'COMPLETED'
    ).length
    
    if (totalTasks === 0) return 'All caught up! Time to relax or plan ahead.'
    if (totalTasks < 5) return 'Ready to crush it today!'
    if (totalTasks < 10) return 'Let\'s make progress!'
    return 'You\'ve got this! One task at a time.'
  }

  const getGradientClass = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return 'bg-gradient-to-r from-orange-500 to-yellow-500'
    if (hour >= 12 && hour < 17) return 'bg-gradient-to-r from-blue-500 to-purple-500'
    if (hour >= 17 && hour < 22) return 'bg-gradient-to-r from-purple-500 to-pink-500'
    return 'bg-gradient-to-r from-indigo-600 to-purple-600'
  }

  const formatDate = () => {
    const date = new Date()
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    }
    const formattedDate = date.toLocaleDateString('en-US', options)
    
    // Add ordinal suffix
    const day = date.getDate()
    const suffix = ['th', 'st', 'nd', 'rd'][
      day % 10 > 3 || [11, 12, 13].includes(day % 100) ? 0 : day % 10
    ]
    
    return formattedDate.replace(/\d+/, `${day}${suffix}`)
  }

  const greeting = getGreeting()
  const firstName = user?.name?.split(' ')[0] || 'User'

  // Keyboard shortcuts handlers
  const handleCreateTask = useCallback(() => {
    setShowUniversalForm(true)
  }, [])

  const handleChangeFilter = useCallback((filter: TaskFilter) => {
    setActiveFilter(filter)
  }, [])

  const handleToggleFocusMode = useCallback(() => {
    setFocusMode(prev => !prev)
    toast.success(focusMode ? 'Focus mode disabled' : 'Focus mode enabled - completed tasks hidden')
  }, [focusMode])

  const handleShowHelp = useCallback(() => {
    setShowKeyboardHelp(true)
  }, [])

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      refetchNotifications(),
      refetchWorkspaces()
    ])
    toast.success('Data refreshed')
  }, [refetchNotifications, refetchWorkspaces])

  const handleCloseModal = useCallback(() => {
    if (showUniversalForm) {
      setShowUniversalForm(false)
    } else if (showKeyboardHelp) {
      setShowKeyboardHelp(false)
    }
  }, [showUniversalForm, showKeyboardHelp])

  // Initialize keyboard shortcuts
  useKeyboardShortcuts({
    onCreateTask: handleCreateTask,
    onChangeFilter: handleChangeFilter,
    onToggleFocusMode: handleToggleFocusMode,
    onShowHelp: handleShowHelp,
    onRefresh: handleRefresh,
    onCloseModal: handleCloseModal
  })

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
        {/* Header - Compact and Space Efficient */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="animate-fade-in flex items-center gap-4">
              <i className={`${greeting.icon} text-2xl text-gray-400`}></i>
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  <span className={`${getGradientClass()} bg-clip-text text-transparent`}>
                    {greeting.text}
                  </span>
                  <span className="text-gray-900">{firstName}!</span>
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                  <span className="font-medium">{formatDate()}</span>
                  <span className="text-gray-400">•</span>
                  <span>{getMotivationalSubtitle()}</span>
                  {tasksDueToday > 0 && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="font-medium text-blue-600">
                        {tasksDueToday} task{tasksDueToday > 1 ? 's' : ''} due today
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <Button 
                variant="ghost" 
                size="icon"
                className="relative h-9 w-9"
                onClick={() => navigate('/notifications')}
              >
                <Bell className="w-4 h-4" />
                {unreadNotifications > 0 && (
                  <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-red-500">
                    {unreadNotifications}
                  </Badge>
                )}
              </Button>

              <KeyboardTooltip keys={['C']} description="Press">
                <Button onClick={() => setShowUniversalForm(true)} size="sm" className="h-9">
                  <Plus className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:inline">Create Item</span>
                  <span className="sm:hidden">Create</span>
                  <KeyboardHint keys={['C']} className="ml-2" />
                </Button>
              </KeyboardTooltip>
            </div>
          </div>
        </div>

        {/* Universal Form Modal */}
        {showUniversalForm && (
          <UniversalInputForm
            onClose={() => setShowUniversalForm(false)}
            defaultType={ContentType.TASK}
            workspaceId={activeWorkspace?.id}
          />
        )}

        {/* Task Filters */}
        <div className="relative">
          <TaskFilters 
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            workspaceId={activeWorkspace?.id}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {focusMode && (
              <Badge variant="secondary" className="text-xs">
                Focus Mode
              </Badge>
            )}
            <KeyboardTooltip keys={['?']} description="Keyboard shortcuts">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowKeyboardHelp(true)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="text-xs">Shortcuts</span>
                <KeyboardHint keys={['?']} />
              </Button>
            </KeyboardTooltip>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Left Column - Quick Navigation & Actions */}
            <div className="space-y-6">
              {/* Productivity Insights */}
              <ProductivityInsights workspaceId={activeWorkspace?.id} />

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
              <TasksSummary 
                activeFilter={activeFilter} 
                focusMode={focusMode}
              />
            </div>

            {/* Right Column - Activity Feed */}
            <div>
              <ActivityFeed />
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts Help Modal */}
        <KeyboardShortcutsHelp 
          open={showKeyboardHelp}
          onOpenChange={setShowKeyboardHelp}
        />
      </div>
    </ResponsiveLayout>
  )
}

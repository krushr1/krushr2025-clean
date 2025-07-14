
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs'
import { 
  MessageSquare, 
  Users, 
  Settings, 
  Check, 
  Star,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react'
import { cn } from '../../../lib/utils'
import TaskCommentList from './TaskCommentList'
import TaskCommentEditor from './TaskCommentEditor'
import { useCommentCount, useCommentsStore } from '../../../stores/comments-store'

interface TaskCommentSystemProps {
  className?: string
}

const DEMO_TASK = {
  id: 'demo-task-1',
  title: 'Enhanced Task Comments Implementation',
  description: 'Implement rich text comments with mentions and real-time updates',
  status: 'IN_PROGRESS',
  priority: 'HIGH',
  workspaceId: 'demo-workspace',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

export default function TaskCommentSystem({ className }: TaskCommentSystemProps) {
  const [activeDemo, setActiveDemo] = useState<'mobile' | 'desktop' | 'tablet'>('desktop')
  const [showFeatures, setShowFeatures] = useState(true)
  
  const commentCount = useCommentCount(DEMO_TASK.id)

  const features = [
    {
      title: 'Rich Text Editing',
      description: 'TipTap-powered editor with formatting, links, lists, and more',
      icon: MessageSquare,
      status: 'completed'
    },
    {
      title: '@Mention Support',
      description: 'Tag team members with autocomplete dropdown',
      icon: Users,
      status: 'completed'
    },
    {
      title: 'Threaded Conversations',
      description: 'Reply to comments and create discussion threads',
      icon: MessageSquare,
      status: 'completed'
    },
    {
      title: 'Real-time Updates',
      description: 'WebSocket integration for live comment updates',
      icon: Settings,
      status: 'completed'
    },
    {
      title: 'File Attachments',
      description: 'Attach files with preview and download capabilities',
      icon: Settings,
      status: 'completed'
    },
    {
      title: 'Emoji Reactions',
      description: 'React to comments with emojis and quick reactions',
      icon: Star,
      status: 'completed'
    },
    {
      title: 'Mobile Responsive',
      description: 'Optimized interface for mobile and tablet devices',
      icon: Smartphone,
      status: 'completed'
    },
    {
      title: 'State Management',
      description: 'Zustand store for efficient comment state handling',
      icon: Settings,
      status: 'completed'
    }
  ]

  const getDeviceClass = () => {
    switch (activeDemo) {
      case 'mobile':
        return 'max-w-sm mx-auto'
      case 'tablet':
        return 'max-w-2xl mx-auto'
      case 'desktop':
      default:
        return 'max-w-4xl mx-auto'
    }
  }

  return (
    <div className={cn("space-y-6 p-6", className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 font-manrope">
          Enhanced Task Comments System
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto font-manrope">
          Complete comment system with rich text editing, mentions, real-time updates, and mobile responsiveness
        </p>
      </div>

      {/* Features Overview */}
      {showFeatures && (
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  Implementation Features
                </CardTitle>
                <CardDescription>
                  All features have been successfully implemented and integrated
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFeatures(false)}
              >
                Hide
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg hover:border-krushr-primary/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-krushr-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-4 h-4 text-krushr-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 font-manrope mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-xs text-gray-600 font-manrope leading-relaxed">
                        {feature.description}
                      </p>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        <Check className="w-3 h-3 mr-1" />
                        {feature.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Responsive Demo Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-krushr-primary" />
            Live Comment System Demo
          </CardTitle>
          <CardDescription>
            Test the comment system across different device sizes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Device Size Selector */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm font-medium text-gray-700 font-manrope mr-2">
              View:
            </span>
            <Button
              variant={activeDemo === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveDemo('mobile')}
              className="flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              Mobile
            </Button>
            <Button
              variant={activeDemo === 'tablet' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveDemo('tablet')}
              className="flex items-center gap-2"
            >
              <Tablet className="w-4 h-4" />
              Tablet
            </Button>
            <Button
              variant={activeDemo === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveDemo('desktop')}
              className="flex items-center gap-2"
            >
              <Monitor className="w-4 h-4" />
              Desktop
            </Button>
          </div>

          {/* Demo Container */}
          <div className={cn("border border-gray-200 rounded-lg overflow-hidden", getDeviceClass())}>
            {/* Task Header */}
            <div className="bg-gray-50 border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 font-manrope">
                    {DEMO_TASK.title}
                  </h3>
                  <p className="text-sm text-gray-600 font-manrope mt-1">
                    {DEMO_TASK.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {DEMO_TASK.status.replace('_', ' ')}
                  </Badge>
                  <Badge variant="destructive">
                    {DEMO_TASK.priority}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Comment System */}
            <div className="bg-white">
              <Tabs defaultValue="comments" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="comments" className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Comments
                    {commentCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {commentCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="editor" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    New Comment
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="comments" className="mt-0">
                  <TaskCommentList
                    taskId={DEMO_TASK.id}
                    workspaceId={DEMO_TASK.workspaceId}
                    maxHeight={activeDemo === 'mobile' ? '300px' : '400px'}
                  />
                </TabsContent>

                <TabsContent value="editor" className="mt-0">
                  <div className="p-4">
                    <TaskCommentEditor
                      taskId={DEMO_TASK.id}
                      workspaceId={DEMO_TASK.workspaceId}
                      placeholder="Try the rich text editor with @mentions..."
                      onSubmit={(comment) => {
                        console.log('Demo comment submitted:', comment)
                      }}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Implementation Notes */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2 font-manrope">
              Implementation Notes
            </h4>
            <ul className="text-sm text-blue-800 space-y-1 font-manrope">
              <li>• All components follow Krushr design system patterns</li>
              <li>• Mobile-first responsive design with breakpoint optimizations</li>
              <li>• tRPC integration for type-safe API communication</li>
              <li>• Zustand store for efficient state management</li>
              <li>• WebSocket ready for real-time updates</li>
              <li>• Comprehensive error handling and loading states</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Guide</CardTitle>
          <CardDescription>
            How to use the comment system in your components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2 font-manrope">
                Basic Usage
              </h4>
              <div className="bg-gray-50 border rounded p-3 text-sm font-mono">
                {`import { TaskCommentList } from './components/task/comments'

<TaskCommentList
  taskId={task.id}
  workspaceId={workspace.id}
  maxHeight="400px"
/>`}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2 font-manrope">
                Enhanced Task Modal
              </h4>
              <div className="bg-gray-50 border rounded p-3 text-sm font-mono">
                {`import TaskModalEnhanced from './components/task/TaskModalEnhanced'

<TaskModalEnhanced
  task={task}
  workspaceId={workspace.id}
  defaultTab="comments"
  onSuccess={handleUpdate}
/>`}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2 font-manrope">
                Comment Hooks
              </h4>
              <div className="bg-gray-50 border rounded p-3 text-sm font-mono">
                {`import { useComments, useCommentCount } from './hooks/use-comments'

const { comments, createComment, isLoading } = useComments(taskId)
const commentCount = useCommentCount(taskId)`}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
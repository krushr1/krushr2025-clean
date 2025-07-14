
import React, { useState, useEffect, useMemo } from 'react'
import { Button } from '../../ui/button'
import { MessageSquare, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { trpc } from '../../../lib/trpc'
import { toast } from 'sonner'
import TaskCommentItem from './TaskCommentItem'
import TaskCommentEditor from './TaskCommentEditor'
import { useWebSocket } from '../../../stores/app-store'

interface TaskCommentListProps {
  taskId: string
  workspaceId: string
  className?: string
  showAddComment?: boolean
  maxHeight?: string
}

interface TaskComment {
  id: string
  content: string
  plainText?: string
  taskId: string
  authorId: string
  parentId?: string
  isEdited: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  replies?: TaskComment[]
  mentions?: any[]
  reactions?: any[]
  attachments?: any[]
}

export default function TaskCommentList({
  taskId,
  workspaceId,
  className,
  showAddComment = true,
  maxHeight = '400px'
}: TaskCommentListProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [showEditor, setShowEditor] = useState(false)
  const { connected: wsConnected } = useWebSocket()

  const {
    data: comments = [],
    isLoading,
    error,
    refetch,
    isRefetching
  } = trpc.comment.list.useQuery(
    { taskId },
    {
      enabled: !!taskId,
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30 seconds
    }
  )

  useEffect(() => {
    if (wsConnected) {
      const interval = setInterval(() => {
        refetch()
      }, 60000) // Refresh every minute when connected

      return () => clearInterval(interval)
    }
  }, [wsConnected, refetch])

  const commentThreads = useMemo(() => {
    const topLevelComments = comments.filter(comment => !comment.parentId)
    const repliesMap = new Map<string, TaskComment[]>()

    comments
      .filter(comment => comment.parentId)
      .forEach(reply => {
        const parentId = reply.parentId!
        if (!repliesMap.has(parentId)) {
          repliesMap.set(parentId, [])
        }
        repliesMap.get(parentId)!.push(reply)
      })

    const threaded = topLevelComments.map(comment => ({
      ...comment,
      replies: repliesMap.get(comment.id) || []
    }))

    return threaded.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
    })
  }, [comments, sortOrder])

  const handleCommentUpdate = () => {
    refetch()
  }

  const handleNewComment = (comment: any) => {
    setShowEditor(false)
    refetch()
    toast.success('Comment added successfully')
  }

  const handleReplyToComment = (parentComment: TaskComment) => {
    refetch()
  }

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
  }

  const totalCommentCount = comments.length

  if (error) {
    return (
      <div className={cn("p-4 text-center", className)}>
        <div className="text-red-500 text-sm font-manrope">
          Failed to load comments
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="mt-2"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className={cn("bg-white", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-0 h-auto hover:bg-transparent"
          >
            <div className="flex items-center gap-2">
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              )}
              <MessageSquare className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900 font-manrope">
                Comments ({totalCommentCount})
              </span>
            </div>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSortOrder}
            className="text-xs text-gray-500 hover:text-gray-700"
            title={`Sort ${sortOrder === 'asc' ? 'newest' : 'oldest'} first`}
          >
            {sortOrder === 'asc' ? 'Oldest' : 'Newest'} first
          </Button>

          {/* Refresh button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="text-gray-500 hover:text-gray-700"
            title="Refresh comments"
          >
            <RefreshCw className={cn(
              "h-4 w-4",
              isRefetching && "animate-spin"
            )} />
          </Button>
        </div>
      </div>

      {/* Comments content */}
      {!isCollapsed && (
        <div>
          {/* Comments list */}
          <div 
            className="overflow-y-auto"
            style={{ maxHeight }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-krushr-primary rounded-full animate-spin" />
                  <span className="text-sm font-manrope">Loading comments...</span>
                </div>
              </div>
            ) : commentThreads.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm font-manrope mb-2">
                  No comments yet
                </p>
                <p className="text-gray-400 text-xs font-manrope">
                  Be the first to add a comment to this task
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {commentThreads.map((comment) => (
                  <TaskCommentItem
                    key={comment.id}
                    comment={comment}
                    workspaceId={workspaceId}
                    onUpdate={handleCommentUpdate}
                    onReply={handleReplyToComment}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Add comment section */}
          {showAddComment && (
            <div className="p-4 border-t border-gray-100">
              {showEditor ? (
                <TaskCommentEditor
                  taskId={taskId}
                  workspaceId={workspaceId}
                  placeholder="Add a comment..."
                  onSubmit={handleNewComment}
                  onCancel={() => setShowEditor(false)}
                  autoFocus={true}
                />
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowEditor(true)}
                  className="w-full justify-start text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Add a comment...
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Real-time indicator */}
      {wsConnected && (
        <div className="px-4 py-2 bg-green-50 border-t border-green-100">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-600 font-manrope">
              Real-time updates active
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
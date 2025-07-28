
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { 
  CheckCircle2, 
  MessageCircle, 
  Plus, 
  Calendar, 
  FileText,
  Users,
  Clock,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Send
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { trpc } from '../../lib/trpc'
import { useRealtimeActivities } from '../../hooks/use-realtime-activities'
import { format, isToday, isYesterday, isSameDay, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns'

interface ActivityFeedProps {
  className?: string
}

interface ActivityGroup {
  id: string
  type: 'single' | 'grouped'
  timestamp: Date
  activities: any[]
  isExpanded: boolean
}

interface ActivityReaction {
  emoji: string
  count: number
  users: string[]
}

const REACTION_EMOJIS = ['👍', '👏', '🎉'] as const

export default function ActivityFeed({ className }: ActivityFeedProps) {
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [reactions, setReactions] = useState<Record<string, ActivityReaction[]>>({})
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 })
  
  // Get the first workspace
  const { data: workspaces = [] } = trpc.workspace.list.useQuery()
  const workspaceId = workspaces[0]?.id
  const { data: currentUser } = trpc.user.me.useQuery()
  
  const { data: activities = [], isLoading, refetch } = trpc.activity.getRecent.useQuery(
    { 
      workspaceId: workspaceId || '',
      limit: 50 
    },
    { 
      enabled: !!workspaceId,
      refetchInterval: false, // Disable polling - we'll use WebSocket
      refetchOnWindowFocus: true,
      staleTime: 1000 // Consider data stale after 1 second
    }
  )

  // Enable real-time updates via WebSocket
  useRealtimeActivities(workspaceId)

  // Virtual scrolling
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return
    
    const container = scrollContainerRef.current
    const scrollTop = container.scrollTop
    const itemHeight = 80 // Approximate height of each item
    const containerHeight = container.clientHeight
    
    const start = Math.floor(scrollTop / itemHeight)
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const end = start + visibleCount + 5 // Buffer of 5 items
    
    setVisibleRange({ start: Math.max(0, start - 5), end })
  }, [])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Group activities by type and time
  const groupedActivities = useMemo(() => {
    const groups: ActivityGroup[] = []
    const tempGroups: Record<string, any[]> = {}
    
    activities.forEach((activity) => {
      const activityTime = new Date(activity.createdAt)
      const hourKey = format(activityTime, 'yyyy-MM-dd-HH')
      const groupKey = `${activity.type}-${activity.userId}-${hourKey}`
      
      // Group similar activities by same user, type, and hour
      if (activity.type === 'task_completed' || activity.type === 'task_created') {
        if (!tempGroups[groupKey]) {
          tempGroups[groupKey] = []
        }
        tempGroups[groupKey].push(activity)
      } else {
        // Don't group other activity types
        groups.push({
          id: activity.id,
          type: 'single',
          timestamp: activityTime,
          activities: [activity],
          isExpanded: false
        })
      }
    })
    
    // Convert temp groups to ActivityGroups
    Object.entries(tempGroups).forEach(([key, activities]) => {
      if (activities.length > 1) {
        groups.push({
          id: key,
          type: 'grouped',
          timestamp: new Date(activities[0].createdAt),
          activities,
          isExpanded: expandedGroups.has(key)
        })
      } else {
        groups.push({
          id: activities[0].id,
          type: 'single',
          timestamp: new Date(activities[0].createdAt),
          activities,
          isExpanded: false
        })
      }
    })
    
    // Sort by timestamp
    return groups.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [activities, expandedGroups])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_completed':
        return <CheckCircle2 className="w-4 h-4 text-krushr-task-done" />
      case 'task_created':
        return <Plus className="w-4 h-4 text-krushr-primary" />
      case 'task_assigned':
        return <Users className="w-4 h-4 text-krushr-purple" />
      case 'comment_added':
        return <MessageCircle className="w-4 h-4 text-krushr-warning" />
      case 'file_uploaded':
        return <FileText className="w-4 h-4 text-krushr-gray" />
      case 'meeting_scheduled':
        return <Calendar className="w-4 h-4 text-krushr-info" />
      default:
        return <Clock className="w-4 h-4 text-krushr-gray-light" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'task_completed':
        return 'bg-krushr-task-done/10 border-krushr-task-done/20'
      case 'task_created':
        return 'bg-krushr-primary/10 border-krushr-primary/20'
      case 'task_assigned':
        return 'bg-krushr-purple/10 border-krushr-purple/20'
      case 'comment_added':
        return 'bg-krushr-warning/10 border-krushr-warning/20'
      case 'file_uploaded':
        return 'bg-krushr-gray-bg border-krushr-gray-border'
      case 'meeting_scheduled':
        return 'bg-krushr-info/10 border-krushr-info/20'
      default:
        return 'bg-krushr-gray-bg border-krushr-gray-border'
    }
  }

  const formatTimeAgo = (timestamp: string | Date) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = differenceInMinutes(now, time)
    const diffInHours = differenceInHours(now, time)
    const diffInDays = differenceInDays(now, time)

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    // For older activities, show date
    if (isToday(time)) return format(time, 'h:mm a')
    if (isYesterday(time)) return `Yesterday ${format(time, 'h:mm a')}`
    return format(time, 'MMM d, h:mm a')
  }

  const formatGroupHeader = (group: ActivityGroup) => {
    const time = group.timestamp
    if (isToday(time)) return `Today ${format(time, 'h:mm a')}`
    if (isYesterday(time)) return `Yesterday ${format(time, 'h:mm a')}`
    return format(time, 'EEEE, MMM d, h:mm a')
  }

  const handleLoadMore = async () => {
    setIsLoadingMore(true)
    // TODO: Implement pagination
    setTimeout(() => setIsLoadingMore(false), 1000)
  }

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return next
    })
  }

  const handleReaction = async (activityId: string, emoji: string) => {
    // Optimistic update
    setReactions(prev => {
      const current = prev[activityId] || []
      const existingReaction = current.find(r => r.emoji === emoji)
      
      if (existingReaction) {
        if (existingReaction.users.includes(currentUser?.id || '')) {
          // Remove reaction
          return {
            ...prev,
            [activityId]: current.map(r => 
              r.emoji === emoji 
                ? { ...r, count: r.count - 1, users: r.users.filter(u => u !== currentUser?.id) }
                : r
            ).filter(r => r.count > 0)
          }
        } else {
          // Add reaction
          return {
            ...prev,
            [activityId]: current.map(r => 
              r.emoji === emoji 
                ? { ...r, count: r.count + 1, users: [...r.users, currentUser?.id || ''] }
                : r
            )
          }
        }
      } else {
        // New reaction
        return {
          ...prev,
          [activityId]: [...current, { emoji, count: 1, users: [currentUser?.id || ''] }]
        }
      }
    })
    
    // TODO: Send reaction to server
    // Would integrate with a new activity.react mutation
  }

  const handleReply = async (activityId: string) => {
    if (!replyText.trim()) return
    
    // TODO: Send reply to server
    // Would integrate with comment.create mutation
    console.log('Replying to activity:', activityId, 'with text:', replyText)
    
    setReplyText('')
    setReplyingTo(null)
  }

  const renderActivityContent = (activity: any) => {
    const parts = activity.action.split(/(@\w+|#\w+)/g)
    
    return (
      <span className="text-sm text-krushr-gray-dark leading-relaxed">
        {parts.map((part: string, index: number) => {
          if (part.startsWith('@')) {
            return <span key={index} className="font-medium text-krushr-primary">{part}</span>
          }
          if (part.startsWith('#')) {
            return <span key={index} className="font-medium text-krushr-purple">{part}</span>
          }
          return <span key={index}>{part}</span>
        })}
        {activity.entityName && (
          <span className="font-semibold text-krushr-black ml-1">
            "{activity.entityName}"
          </span>
        )}
        {activity.targetUser && (
          <span className="text-krushr-gray-dark">
            {' to '}
            <span className="font-medium text-krushr-primary">
              @{activity.targetUser.name}
            </span>
          </span>
        )}
      </span>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const configs = {
      critical: { bg: 'bg-krushr-priority-critical/10', text: 'text-krushr-priority-critical', border: 'border-krushr-priority-critical/20' },
      high: { bg: 'bg-krushr-priority-high/10', text: 'text-krushr-priority-high', border: 'border-krushr-priority-high/20' },
      medium: { bg: 'bg-krushr-priority-medium/10', text: 'text-krushr-priority-medium', border: 'border-krushr-priority-medium/20' },
      low: { bg: 'bg-krushr-priority-low/10', text: 'text-krushr-priority-low', border: 'border-krushr-priority-low/20' },
    }
    const config = configs[priority] || configs.medium
    
    return (
      <Badge 
        variant="outline" 
        className={cn(
          'text-xs font-medium uppercase tracking-wide',
          config.bg,
          config.text,
          config.border
        )}
      >
        {priority}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <Card className={cn('h-full flex items-center justify-center', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </Card>
    )
  }

  return (
    <Card className={cn('h-full flex flex-col', className)}>
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => refetch()}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-y-auto" ref={scrollContainerRef}>
        {activities.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No recent activity</p>
            <p className="text-xs mt-1 text-gray-400">Activities will appear here as your team works</p>
          </div>
        ) : (
          <div className="space-y-0">
            {/* Virtual scrolling spacer */}
            <div style={{ height: `${visibleRange.start * 80}px` }} />
            
            {groupedActivities.slice(visibleRange.start, visibleRange.end).map((group, index) => {
              const isFirstOfDay = index === 0 || !isSameDay(group.timestamp, groupedActivities[index - 1]?.timestamp)
              
              return (
                <div key={group.id}>
                  {/* Day separator */}
                  {isFirstOfDay && (
                    <div className="sticky top-0 z-10 bg-krushr-gray-bg-light px-4 py-2 border-b border-krushr-gray-border">
                      <p className="text-xs font-medium text-krushr-gray uppercase tracking-wide">
                        {isToday(group.timestamp) ? 'Today' : isYesterday(group.timestamp) ? 'Yesterday' : format(group.timestamp, 'EEEE, MMMM d')}
                      </p>
                    </div>
                  )}
                  
                  {group.type === 'grouped' && group.activities.length > 1 ? (
                    /* Grouped activities */
                    <div className="border-l-4 border-krushr-primary/20 bg-krushr-primary/5">
                      <button
                        onClick={() => toggleGroup(group.id)}
                        className="w-full p-4 hover:bg-krushr-primary/10 transition-colors text-left"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="pt-1">
                            {group.isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-krushr-gray" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-krushr-gray" />
                            )}
                          </div>
                          
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarImage src={group.activities[0].user?.avatar} />
                            <AvatarFallback className="text-xs bg-krushr-gray-bg">
                              {group.activities[0].user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              {getActivityIcon(group.activities[0].type)}
                              <span className="text-sm font-medium text-krushr-black">
                                {group.activities[0].user?.name || 'Unknown User'}
                              </span>
                              <span className="text-xs text-krushr-gray-light">
                                {formatTimeAgo(group.timestamp)}
                              </span>
                            </div>
                            
                            <p className="text-sm font-medium text-krushr-gray-dark">
                              {group.activities[0].type === 'task_completed' 
                                ? `completed ${group.activities.length} tasks`
                                : `created ${group.activities.length} tasks`
                              }
                            </p>
                          </div>
                        </div>
                      </button>
                      
                      {group.isExpanded && (
                        <div className="pl-14 pr-4 pb-4 space-y-2">
                          {group.activities.map((activity) => (
                            <div key={activity.id} className="text-sm text-krushr-gray-dark">
                              • <span className="font-medium text-krushr-black">{activity.entityName}</span>
                              {activity.priority && (
                                <span className="ml-2">
                                  {getPriorityBadge(activity.priority)}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Single activity */
                    <div
                      className={cn(
                        'group relative border-l-4 transition-all duration-200',
                        getActivityColor(group.activities[0].type),
                        'hover:shadow-elevation-sm hover:z-10'
                      )}
                    >
                      <div className="p-4">
                        <div className="flex items-start space-x-3">
                          {/* User Avatar */}
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarImage src={group.activities[0].user?.avatar} />
                            <AvatarFallback className="text-xs bg-krushr-gray-bg">
                              {group.activities[0].user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>

                          {/* Activity Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              {getActivityIcon(group.activities[0].type)}
                              <span className="text-sm font-medium text-krushr-black">
                                {group.activities[0].user?.name || 'Unknown User'}
                              </span>
                              <span className="text-xs text-krushr-gray-light flex-shrink-0">
                                {formatTimeAgo(group.activities[0].createdAt)}
                              </span>
                            </div>
                            
                            <div>{renderActivityContent(group.activities[0])}</div>

                            {/* Priority Badge */}
                            {group.activities[0].priority && (
                              <div className="mt-2">
                                {getPriorityBadge(group.activities[0].priority)}
                              </div>
                            )}
                            
                            {/* Reactions */}
                            <div className="flex items-center gap-2 mt-3">
                              {/* Reaction buttons */}
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {REACTION_EMOJIS.map((emoji) => (
                                  <button
                                    key={emoji}
                                    onClick={() => handleReaction(group.activities[0].id, emoji)}
                                    className="p-1 hover:bg-krushr-gray-bg rounded transition-colors"
                                  >
                                    <span className="text-sm">{emoji}</span>
                                  </button>
                                ))}
                              </div>
                              
                              {/* Existing reactions */}
                              {reactions[group.activities[0].id]?.map((reaction) => (
                                <button
                                  key={reaction.emoji}
                                  onClick={() => handleReaction(group.activities[0].id, reaction.emoji)}
                                  className={cn(
                                    'flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors',
                                    reaction.users.includes(currentUser?.id || '')
                                      ? 'bg-krushr-primary/10 text-krushr-primary border border-krushr-primary/20'
                                      : 'bg-krushr-gray-bg hover:bg-krushr-gray-bg-light'
                                  )}
                                >
                                  <span>{reaction.emoji}</span>
                                  <span className="font-medium">{reaction.count}</span>
                                </button>
                              ))}
                              
                              {/* Task link */}
                              {group.activities[0].entityType === 'task' && group.activities[0].entityId && (
                                <a
                                  href={`#/workspace?task=${group.activities[0].entityId}`}
                                  className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-krushr-primary hover:text-krushr-primary/80"
                                >
                                  View task
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            
                            {/* Reply section */}
                            {(group.activities[0].type === 'task_completed' || group.activities[0].type === 'comment_added') && (
                              <div className="mt-3">
                                {replyingTo === group.activities[0].id ? (
                                  <div className="flex items-center gap-2">
                                    <Input
                                      value={replyText}
                                      onChange={(e) => setReplyText(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                          e.preventDefault()
                                          handleReply(group.activities[0].id)
                                        }
                                        if (e.key === 'Escape') {
                                          setReplyingTo(null)
                                          setReplyText('')
                                        }
                                      }}
                                      placeholder="Add a comment..."
                                      className="flex-1 h-8 text-sm"
                                      autoFocus
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => handleReply(group.activities[0].id)}
                                      disabled={!replyText.trim()}
                                      className="h-8"
                                    >
                                      <Send className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setReplyingTo(group.activities[0].id)}
                                    className="text-xs text-krushr-gray hover:text-krushr-primary transition-colors opacity-0 group-hover:opacity-100"
                                  >
                                    <MessageCircle className="w-3 h-3 inline mr-1" />
                                    Reply
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            
            {/* Virtual scrolling spacer */}
            <div style={{ height: `${Math.max(0, (groupedActivities.length - visibleRange.end) * 80)}px` }} />
          </div>
        )}

        {/* Load More */}
        <div className="p-4 text-center border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-600 hover:text-gray-900"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load more activity'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
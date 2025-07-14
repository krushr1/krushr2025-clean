
import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu'
import { MoreHorizontal, Reply, Edit, Trash2, Heart, ThumbsUp, Smile, Flag } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { trpc } from '../../../lib/trpc'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import TaskCommentEditor from './TaskCommentEditor'
import { CommentAttachment } from './CommentAttachment'
import { useAuth } from '../../../stores/app-store'

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

interface TaskCommentItemProps {
  comment: TaskComment
  workspaceId: string
  onUpdate?: () => void
  onReply?: (comment: TaskComment) => void
  isReply?: boolean
  className?: string
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡']

export default function TaskCommentItem({
  comment,
  workspaceId,
  onUpdate,
  onReply,
  isReply = false,
  className
}: TaskCommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showReplyEditor, setShowReplyEditor] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const { user: currentUser } = useAuth()

  const isAuthor = currentUser?.id === comment.authorId
  const canDelete = isAuthor // Could add admin permissions here

  const deleteComment = trpc.comment.delete.useMutation({
    onSuccess: () => {
      onUpdate?.()
      toast.success('Comment deleted')
    },
    onError: (error) => {
      toast.error('Failed to delete comment')
      console.error('Delete comment error:', error)
    }
  })

  const toggleReaction = trpc.comment.toggleReaction?.useMutation({
    onSuccess: () => {
      onUpdate?.()
    },
    onError: (error) => {
      console.error('Toggle reaction error:', error)
    }
  }) || { mutate: () => {}, isLoading: false }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this comment?')) {
      deleteComment.mutate({ id: comment.id })
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleEditSubmit = (updatedComment: any) => {
    setIsEditing(false)
    onUpdate?.()
  }

  const handleEditCancel = () => {
    setIsEditing(false)
  }

  const handleReply = () => {
    if (onReply) {
      onReply(comment)
    } else {
      setShowReplyEditor(true)
    }
  }

  const handleReplySubmit = (newReply: any) => {
    setShowReplyEditor(false)
    onUpdate?.()
  }

  const handleReplyCancel = () => {
    setShowReplyEditor(false)
  }

  const handleReaction = (emoji: string) => {
    toggleReaction.mutate({
      commentId: comment.id,
      emoji
    })
    setShowReactions(false)
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch {
      return 'some time ago'
    }
  }

  const groupedReactions = comment.reactions?.reduce((acc: any, reaction: any) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = {
        emoji: reaction.emoji,
        count: 0,
        users: [],
        hasCurrentUser: false
      }
    }
    acc[reaction.emoji].count++
    acc[reaction.emoji].users.push(reaction.user)
    if (reaction.userId === currentUser?.id) {
      acc[reaction.emoji].hasCurrentUser = true
    }
    return acc
  }, {}) || {}

  if (comment.isDeleted) {
    return (
      <div className={cn("flex gap-3 py-2 opacity-50", className)}>
        <Avatar className="w-8 h-8">
          <AvatarFallback className="text-xs">?</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="text-sm text-gray-500 italic font-manrope">
            This comment has been deleted
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("group", className)}>
      <div className={cn(
        "flex gap-3 py-3",
        isReply && "ml-6 pl-4 border-l-2 border-gray-100"
      )}>
        {/* Avatar */}
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
          <AvatarFallback className="text-xs font-medium">
            {comment.author.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>

        {/* Comment content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900 font-manrope">
              {comment.author.name}
            </span>
            <span className="text-xs text-gray-500 font-manrope">
              {formatTimestamp(comment.createdAt)}
            </span>
            {comment.isEdited && (
              <Badge variant="secondary" className="text-xs">
                edited
              </Badge>
            )}
          </div>

          {/* Comment body */}
          {isEditing ? (
            <div className="mb-3">
              <TaskCommentEditor
                taskId={comment.taskId}
                workspaceId={workspaceId}
                initialContent={comment.content}
                isEditing={true}
                commentId={comment.id}
                onSubmit={handleEditSubmit}
                onCancel={handleEditCancel}
                autoFocus={true}
              />
            </div>
          ) : (
            <div className="mb-3">
              <div 
                className="prose prose-sm max-w-none text-gray-700 font-manrope"
                dangerouslySetInnerHTML={{ __html: comment.content }}
              />
              
              {/* Attachments */}
              {comment.attachments && comment.attachments.length > 0 && (
                <div className="mt-2">
                  <CommentAttachment attachments={comment.attachments} />
                </div>
              )}
            </div>
          )}

          {/* Reactions */}
          {Object.keys(groupedReactions).length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {Object.values(groupedReactions).map((reaction: any) => (
                <Button
                  key={reaction.emoji}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReaction(reaction.emoji)}
                  className={cn(
                    "h-6 px-2 text-xs rounded-full",
                    reaction.hasCurrentUser
                      ? "bg-krushr-primary/10 text-krushr-primary border border-krushr-primary/20"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                  title={`${reaction.users.map((u: any) => u.name).join(', ')} reacted with ${reaction.emoji}`}
                >
                  <span className="mr-1">{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </Button>
              ))}
            </div>
          )}

          {/* Action buttons */}
          {!isEditing && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Quick reactions */}
              <div className="flex items-center gap-1 mr-2">
                {QUICK_REACTIONS.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReaction(emoji)}
                    className="h-6 w-6 p-0 text-sm hover:bg-gray-100 rounded"
                    title={`React with ${emoji}`}
                  >
                    {emoji}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReactions(!showReactions)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                  title="More reactions"
                >
                  <Smile className="h-3 w-3" />
                </Button>
              </div>

              {/* Reply button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReply}
                className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>

              {/* More actions menu */}
              {(isAuthor || canDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    {isAuthor && (
                      <DropdownMenuItem onClick={handleEdit}>
                        <Edit className="h-3 w-3 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <DropdownMenuItem 
                        onClick={handleDelete}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      <Flag className="h-3 w-3 mr-2" />
                      Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}

          {/* Reply editor */}
          {showReplyEditor && (
            <div className="mt-3">
              <TaskCommentEditor
                taskId={comment.taskId}
                workspaceId={workspaceId}
                placeholder="Write a reply..."
                onSubmit={handleReplySubmit}
                onCancel={handleReplyCancel}
                autoFocus={true}
              />
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-2">
              {comment.replies.map((reply) => (
                <TaskCommentItem
                  key={reply.id}
                  comment={reply}
                  workspaceId={workspaceId}
                  onUpdate={onUpdate}
                  isReply={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
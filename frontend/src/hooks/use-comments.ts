/**
 * useComments Hook
 * Custom hook for managing task comments with tRPC integration
 */

import { useEffect, useCallback } from 'react'
import { trpc } from '../lib/trpc'
import { useCommentsStore } from '../stores/comments-store'
import { useWebSocket } from '../stores/app-store'
import { toast } from 'sonner'

export function useComments(taskId: string) {
  const { sendMessage, connected: wsConnected } = useWebSocket()
  const {
    setComments,
    addComment,
    updateComment,
    deleteComment as removeComment,
    setLoading,
    getCommentsByTask,
    markAsUpdated
  } = useCommentsStore()

  // Fetch comments query
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
      onSuccess: (data) => {
        setComments(taskId, data)
        setLoading(taskId, false)
      },
      onError: (error) => {
        setLoading(taskId, false)
        console.error('Error fetching comments:', error)
      }
    }
  )

  // Create comment mutation
  const createComment = trpc.comment.create.useMutation({
    onMutate: () => {
      setLoading(taskId, true)
    },
    onSuccess: (comment) => {
      addComment(comment)
      setLoading(taskId, false)
      markAsUpdated(taskId)
      
      // Send WebSocket notification
      if (wsConnected) {
        sendMessage('COMMENT_ADDED', {
          taskId,
          commentId: comment.id,
          authorId: comment.authorId
        })
      }
      
      toast.success('Comment added successfully')
    },
    onError: (error) => {
      setLoading(taskId, false)
      toast.error('Failed to add comment')
      console.error('Create comment error:', error)
    }
  })

  // Update comment mutation
  const updateCommentMutation = trpc.comment.update.useMutation({
    onSuccess: (comment) => {
      updateComment(comment.id, comment)
      markAsUpdated(taskId)
      toast.success('Comment updated successfully')
    },
    onError: (error) => {
      toast.error('Failed to update comment')
      console.error('Update comment error:', error)
    }
  })

  // Delete comment mutation
  const deleteComment = trpc.comment.delete.useMutation({
    onSuccess: (_, variables) => {
      removeComment(variables.id)
      markAsUpdated(taskId)
      toast.success('Comment deleted successfully')
    },
    onError: (error) => {
      toast.error('Failed to delete comment')
      console.error('Delete comment error:', error)
    }
  })

  // Toggle reaction mutation (if available)
  const toggleReaction = trpc.comment.toggleReaction?.useMutation({
    onSuccess: () => {
      // Refetch comments to get updated reactions
      refetch()
    },
    onError: (error) => {
      console.error('Toggle reaction error:', error)
    }
  }) || { mutate: () => {}, isLoading: false }

  // Set initial loading state
  useEffect(() => {
    if (isLoading) {
      setLoading(taskId, true)
    }
  }, [isLoading, taskId, setLoading])

  // Auto-refresh comments when WebSocket is connected
  useEffect(() => {
    if (wsConnected && taskId) {
      const interval = setInterval(() => {
        refetch()
      }, 60000) // Refresh every minute

      return () => clearInterval(interval)
    }
  }, [wsConnected, taskId, refetch])

  // WebSocket event handlers
  useEffect(() => {
    if (wsConnected) {
      // Listen for comment events
      // This would be implemented in the WebSocket message handler
      // For now, we'll rely on periodic refetching
    }
  }, [wsConnected, taskId])

  // Memoized handlers
  const handleCreateComment = useCallback(
    (content: string) => {
      createComment.mutate({
        taskId,
        content
      })
    },
    [createComment, taskId]
  )

  const handleUpdateComment = useCallback(
    (commentId: string, content: string) => {
      updateCommentMutation.mutate({
        id: commentId,
        content
      })
    },
    [updateCommentMutation]
  )

  const handleDeleteComment = useCallback(
    (commentId: string) => {
      deleteComment.mutate({ id: commentId })
    },
    [deleteComment]
  )

  const handleToggleReaction = useCallback(
    (commentId: string, emoji: string) => {
      toggleReaction.mutate({
        commentId,
        emoji
      })
    },
    [toggleReaction]
  )

  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  // Get comments from store (this will be real-time)
  const storeComments = getCommentsByTask(taskId)

  return {
    // Data
    comments: storeComments.length > 0 ? storeComments : comments,
    
    // Loading states
    isLoading: isLoading || createComment.isLoading,
    isRefetching,
    isCreating: createComment.isLoading,
    isUpdating: updateCommentMutation.isLoading,
    isDeleting: deleteComment.isLoading,
    
    // Error state
    error,
    
    // Actions
    createComment: handleCreateComment,
    updateComment: handleUpdateComment,
    deleteComment: handleDeleteComment,
    toggleReaction: handleToggleReaction,
    refresh: handleRefresh,
    
    // WebSocket status
    wsConnected,
    
    // Mutation objects (for direct access if needed)
    mutations: {
      create: createComment,
      update: updateCommentMutation,
      delete: deleteComment,
      toggleReaction
    }
  }
}

export type UseCommentsReturn = ReturnType<typeof useComments>
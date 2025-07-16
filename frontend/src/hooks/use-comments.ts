
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
    deleteComment: removeComment,
    setLoading,
    getCommentsByTask,
    markAsUpdated
  } = useCommentsStore()

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

  const createComment = trpc.comment.create.useMutation({
    onMutate: () => {
      setLoading(taskId, true)
    },
    onSuccess: (comment) => {
      addComment(comment)
      setLoading(taskId, false)
      markAsUpdated(taskId)
      
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

  const toggleReaction = trpc.comment.toggleReaction?.useMutation({
    onSuccess: () => {
      refetch()
    },
    onError: (error) => {
      console.error('Toggle reaction error:', error)
    }
  }) || { mutate: () => {}, isLoading: false }

  useEffect(() => {
    if (isLoading) {
      setLoading(taskId, true)
    }
  }, [isLoading, taskId, setLoading])

  useEffect(() => {
    if (wsConnected && taskId) {
      const interval = setInterval(() => {
        refetch()
      }, 60000) // Refresh every minute

      return () => clearInterval(interval)
    }
  }, [wsConnected, taskId, refetch])

  useEffect(() => {
    if (wsConnected) {
    }
  }, [wsConnected, taskId])

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

  const storeComments = getCommentsByTask(taskId)

  return {
    comments: storeComments.length > 0 ? storeComments : comments,
    
    isLoading: isLoading || createComment.isLoading,
    isRefetching,
    isCreating: createComment.isLoading,
    isUpdating: updateCommentMutation.isLoading,
    isDeleting: deleteComment.isLoading,
    
    error,
    
    createComment: handleCreateComment,
    updateComment: handleUpdateComment,
    deleteComment: handleDeleteComment,
    toggleReaction: handleToggleReaction,
    refresh: handleRefresh,
    
    wsConnected,
    
    mutations: {
      create: createComment,
      update: updateCommentMutation,
      delete: deleteComment,
      toggleReaction
    }
  }
}

export type UseCommentsReturn = ReturnType<typeof useComments>
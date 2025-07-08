/**
 * Comments State Management
 * Zustand store for task comments with real-time updates
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

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
  mentions?: CommentMention[]
  reactions?: CommentReaction[]
  attachments?: CommentAttachment[]
}

interface CommentMention {
  id: string
  commentId: string
  userId: string
  startPos: number
  endPos: number
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    avatar?: string
  }
}

interface CommentReaction {
  id: string
  commentId: string
  userId: string
  emoji: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    avatar?: string
  }
}

interface CommentAttachment {
  id: string
  filename: string
  url: string
  mimeType: string
  size: number
  compressed: boolean
  thumbnailUrl?: string
  uploadedAt: string
}

interface CommentDraft {
  taskId: string
  content: string
  lastSaved: string
}

interface CommentsState {
  // Comments data by task ID
  commentsByTask: Record<string, TaskComment[]>
  
  // Loading states
  loadingTasks: Set<string>
  
  // Draft comments (auto-saved)
  drafts: Record<string, CommentDraft>
  
  // UI state
  expandedThreads: Set<string>
  editingComments: Set<string>
  replyingToComments: Set<string>
  
  // Real-time updates
  lastUpdate: Record<string, string>
  
  // Actions
  setComments: (taskId: string, comments: TaskComment[]) => void
  addComment: (comment: TaskComment) => void
  updateComment: (commentId: string, updates: Partial<TaskComment>) => void
  deleteComment: (commentId: string) => void
  addReaction: (commentId: string, reaction: CommentReaction) => void
  removeReaction: (commentId: string, reactionId: string) => void
  
  // Draft management
  saveDraft: (taskId: string, content: string) => void
  getDraft: (taskId: string) => string | null
  clearDraft: (taskId: string) => void
  
  // UI state management
  setLoading: (taskId: string, loading: boolean) => void
  toggleThread: (commentId: string) => void
  setEditing: (commentId: string, editing: boolean) => void
  setReplying: (commentId: string, replying: boolean) => void
  
  // Utilities
  getCommentCount: (taskId: string) => number
  getCommentsByTask: (taskId: string) => TaskComment[]
  getThreadedComments: (taskId: string) => TaskComment[]
  markAsUpdated: (taskId: string) => void
}

export const useCommentsStore = create<CommentsState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    commentsByTask: {},
    loadingTasks: new Set(),
    drafts: {},
    expandedThreads: new Set(),
    editingComments: new Set(),
    replyingToComments: new Set(),
    lastUpdate: {},

    // Comment data actions
    setComments: (taskId, comments) => {
      set(state => ({
        commentsByTask: {
          ...state.commentsByTask,
          [taskId]: comments
        },
        lastUpdate: {
          ...state.lastUpdate,
          [taskId]: new Date().toISOString()
        }
      }))
    },

    addComment: (comment) => {
      set(state => {
        const taskComments = state.commentsByTask[comment.taskId] || []
        return {
          commentsByTask: {
            ...state.commentsByTask,
            [comment.taskId]: [...taskComments, comment]
          },
          lastUpdate: {
            ...state.lastUpdate,
            [comment.taskId]: new Date().toISOString()
          }
        }
      })
    },

    updateComment: (commentId, updates) => {
      set(state => {
        const newCommentsByTask = { ...state.commentsByTask }
        
        Object.keys(newCommentsByTask).forEach(taskId => {
          newCommentsByTask[taskId] = newCommentsByTask[taskId].map(comment => 
            comment.id === commentId 
              ? { ...comment, ...updates, isEdited: true }
              : comment
          )
        })

        return {
          commentsByTask: newCommentsByTask,
          lastUpdate: {
            ...state.lastUpdate,
            ...Object.keys(newCommentsByTask).reduce((acc, taskId) => {
              acc[taskId] = new Date().toISOString()
              return acc
            }, {} as Record<string, string>)
          }
        }
      })
    },

    deleteComment: (commentId) => {
      set(state => {
        const newCommentsByTask = { ...state.commentsByTask }
        
        Object.keys(newCommentsByTask).forEach(taskId => {
          newCommentsByTask[taskId] = newCommentsByTask[taskId].map(comment => 
            comment.id === commentId 
              ? { ...comment, isDeleted: true }
              : comment
          )
        })

        return {
          commentsByTask: newCommentsByTask
        }
      })
    },

    addReaction: (commentId, reaction) => {
      set(state => {
        const newCommentsByTask = { ...state.commentsByTask }
        
        Object.keys(newCommentsByTask).forEach(taskId => {
          newCommentsByTask[taskId] = newCommentsByTask[taskId].map(comment => 
            comment.id === commentId 
              ? { 
                  ...comment, 
                  reactions: [...(comment.reactions || []), reaction]
                }
              : comment
          )
        })

        return { commentsByTask: newCommentsByTask }
      })
    },

    removeReaction: (commentId, reactionId) => {
      set(state => {
        const newCommentsByTask = { ...state.commentsByTask }
        
        Object.keys(newCommentsByTask).forEach(taskId => {
          newCommentsByTask[taskId] = newCommentsByTask[taskId].map(comment => 
            comment.id === commentId 
              ? { 
                  ...comment, 
                  reactions: (comment.reactions || []).filter(r => r.id !== reactionId)
                }
              : comment
          )
        })

        return { commentsByTask: newCommentsByTask }
      })
    },

    // Draft management
    saveDraft: (taskId, content) => {
      set(state => ({
        drafts: {
          ...state.drafts,
          [taskId]: {
            taskId,
            content,
            lastSaved: new Date().toISOString()
          }
        }
      }))
    },

    getDraft: (taskId) => {
      const state = get()
      return state.drafts[taskId]?.content || null
    },

    clearDraft: (taskId) => {
      set(state => {
        const newDrafts = { ...state.drafts }
        delete newDrafts[taskId]
        return { drafts: newDrafts }
      })
    },

    // UI state management
    setLoading: (taskId, loading) => {
      set(state => {
        const newLoadingTasks = new Set(state.loadingTasks)
        if (loading) {
          newLoadingTasks.add(taskId)
        } else {
          newLoadingTasks.delete(taskId)
        }
        return { loadingTasks: newLoadingTasks }
      })
    },

    toggleThread: (commentId) => {
      set(state => {
        const newExpandedThreads = new Set(state.expandedThreads)
        if (newExpandedThreads.has(commentId)) {
          newExpandedThreads.delete(commentId)
        } else {
          newExpandedThreads.add(commentId)
        }
        return { expandedThreads: newExpandedThreads }
      })
    },

    setEditing: (commentId, editing) => {
      set(state => {
        const newEditingComments = new Set(state.editingComments)
        if (editing) {
          newEditingComments.add(commentId)
        } else {
          newEditingComments.delete(commentId)
        }
        return { editingComments: newEditingComments }
      })
    },

    setReplying: (commentId, replying) => {
      set(state => {
        const newReplyingToComments = new Set(state.replyingToComments)
        if (replying) {
          newReplyingToComments.add(commentId)
        } else {
          newReplyingToComments.delete(commentId)
        }
        return { replyingToComments: newReplyingToComments }
      })
    },

    // Utility functions
    getCommentCount: (taskId) => {
      const state = get()
      return (state.commentsByTask[taskId] || []).length
    },

    getCommentsByTask: (taskId) => {
      const state = get()
      return state.commentsByTask[taskId] || []
    },

    getThreadedComments: (taskId) => {
      const state = get()
      const comments = state.commentsByTask[taskId] || []
      
      // Organize comments into threads
      const topLevelComments = comments.filter(comment => !comment.parentId)
      const repliesMap = new Map<string, TaskComment[]>()

      // Group replies by parent comment ID
      comments
        .filter(comment => comment.parentId)
        .forEach(reply => {
          const parentId = reply.parentId!
          if (!repliesMap.has(parentId)) {
            repliesMap.set(parentId, [])
          }
          repliesMap.get(parentId)!.push(reply)
        })

      // Attach replies to their parent comments
      return topLevelComments.map(comment => ({
        ...comment,
        replies: repliesMap.get(comment.id) || []
      }))
    },

    markAsUpdated: (taskId) => {
      set(state => ({
        lastUpdate: {
          ...state.lastUpdate,
          [taskId]: new Date().toISOString()
        }
      }))
    }
  }))
)

// Selectors for optimized component subscriptions
export const useTaskComments = (taskId: string) => 
  useCommentsStore(state => state.getCommentsByTask(taskId))

export const useThreadedComments = (taskId: string) => 
  useCommentsStore(state => state.getThreadedComments(taskId))

export const useCommentCount = (taskId: string) => 
  useCommentsStore(state => state.getCommentCount(taskId))

export const useCommentDraft = (taskId: string) => 
  useCommentsStore(state => state.getDraft(taskId))

export const useCommentLoading = (taskId: string) => 
  useCommentsStore(state => state.loadingTasks.has(taskId))

export const useCommentUI = () => useCommentsStore(state => ({
  expandedThreads: state.expandedThreads,
  editingComments: state.editingComments,
  replyingToComments: state.replyingToComments,
  toggleThread: state.toggleThread,
  setEditing: state.setEditing,
  setReplying: state.setReplying
}))

// Export the store and types
export type { TaskComment, CommentMention, CommentReaction, CommentAttachment }
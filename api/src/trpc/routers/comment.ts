/**
 * Enhanced Comment Router
 * Task comments with rich text, mentions, reactions, and real-time updates
 */

import { z } from 'zod'
import { router, publicProcedure } from '../trpc'
import { isAuthenticated, rateLimit } from '../middleware'
import { TRPCError } from '@trpc/server'
import { sendNotificationToUser, broadcastCommentUpdate, sendCommentMentionNotification } from '../../websocket/handler'

// Validation schemas
const createCommentSchema = z.object({
  taskId: z.string(),
  content: z.string().min(1, 'Comment cannot be empty').max(10000, 'Comment too long'),
  plainText: z.string().optional(),
  parentId: z.string().optional(),
  mentions: z.array(z.object({
    userId: z.string(),
    startPos: z.number(),
    endPos: z.number(),
  })).optional(),
})

const updateCommentSchema = z.object({
  id: z.string(),
  content: z.string().min(1, 'Comment cannot be empty').max(10000, 'Comment too long'),
  plainText: z.string().optional(),
  mentions: z.array(z.object({
    userId: z.string(),
    startPos: z.number(),
    endPos: z.number(),
  })).optional(),
})

const reactionSchema = z.object({
  commentId: z.string(),
  emoji: z.string().min(1, 'Emoji required'),
})

export const commentRouter = router({
  /**
   * List comments for a task (with threading support)
   */
  list: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ 
      taskId: z.string(),
      includeReplies: z.boolean().optional().default(true),
      limit: z.number().optional().default(50),
      offset: z.number().optional().default(0),
    }))
    .query(async ({ input, ctx }) => {
      const comments = await ctx.prisma.taskComment.findMany({
        where: { 
          taskId: input.taskId,
          isDeleted: false,
          // Only top-level comments if not including replies
          ...(input.includeReplies ? {} : { parentId: null }),
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          mentions: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
          reactions: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
          replies: input.includeReplies ? {
            where: { isDeleted: false },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
              mentions: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      avatar: true,
                    },
                  },
                },
              },
              reactions: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      avatar: true,
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          } : undefined,
        },
        orderBy: { createdAt: 'desc' },
        skip: input.offset,
        take: input.limit,
      })

      return comments
    }),

  /**
   * Create a comment with rich text and mentions
   */
  create: publicProcedure
    .use(isAuthenticated)
    .use(rateLimit(20, 60000)) // 20 comments per minute
    .input(createCommentSchema)
    .mutation(async ({ input, ctx }) => {
      // Verify task exists and user has access
      const task = await ctx.prisma.task.findFirst({
        where: { id: input.taskId },
        include: {
          project: {
            include: {
              workspace: {
                include: {
                  members: {
                    where: { userId: ctx.user.id },
                  },
                },
              },
            },
          },
        },
      })

      if (!task) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        })
      }

      // Check workspace access (either owner OR member)
      const isOwner = task.project?.workspace?.ownerId === ctx.user.id
      const isMember = task.project?.workspace?.members.length > 0
      
      if (!isOwner && !isMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'No access to this task',
        })
      }

      // Create comment with transaction for mentions
      const comment = await ctx.prisma.$transaction(async (tx) => {
        // Create the comment
        const newComment = await tx.taskComment.create({
          data: {
            taskId: input.taskId,
            content: input.content,
            plainText: input.plainText || input.content.replace(/<[^>]*>/g, '').trim(),
            authorId: ctx.user.id,
            parentId: input.parentId,
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        })

        // Create mentions if any
        if (input.mentions && input.mentions.length > 0) {
          await tx.taskCommentMention.createMany({
            data: input.mentions.map(mention => ({
              commentId: newComment.id,
              userId: mention.userId,
              startPos: mention.startPos,
              endPos: mention.endPos,
            })),
          })
        }

        return newComment
      })

      // Send real-time notifications for mentions
      if (input.mentions && input.mentions.length > 0) {
        for (const mention of input.mentions) {
          sendCommentMentionNotification(mention.userId, {
            commentId: comment.id,
            taskId: input.taskId,
            authorName: ctx.user.name,
            content: input.plainText || input.content.replace(/<[^>]*>/g, '').trim(),
            type: 'mention',
          })
        }
      }

      // Broadcast real-time comment creation
      broadcastCommentUpdate(input.taskId, 'comment-created', {
        comment,
        taskId: input.taskId,
        authorId: ctx.user.id,
      })

      return comment
    }),

  /**
   * Update a comment
   */
  update: publicProcedure
    .use(isAuthenticated)
    .use(rateLimit(10, 60000)) // 10 updates per minute
    .input(updateCommentSchema)
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const existing = await ctx.prisma.taskComment.findFirst({
        where: {
          id: input.id,
          authorId: ctx.user.id,
          isDeleted: false,
        },
      })

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Comment not found or access denied',
        })
      }

      // Update comment with transaction for mentions
      const comment = await ctx.prisma.$transaction(async (tx) => {
        // Update the comment
        const updatedComment = await tx.taskComment.update({
          where: { id: input.id },
          data: {
            content: input.content,
            plainText: input.plainText || input.content.replace(/<[^>]*>/g, '').trim(),
            isEdited: true,
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        })

        // Delete existing mentions
        await tx.taskCommentMention.deleteMany({
          where: { commentId: input.id },
        })

        // Create new mentions if any
        if (input.mentions && input.mentions.length > 0) {
          await tx.taskCommentMention.createMany({
            data: input.mentions.map(mention => ({
              commentId: input.id,
              userId: mention.userId,
              startPos: mention.startPos,
              endPos: mention.endPos,
            })),
          })
        }

        return updatedComment
      })

      // Broadcast real-time comment update
      broadcastCommentUpdate(existing.taskId, 'comment-updated', {
        comment,
        taskId: existing.taskId,
        authorId: ctx.user.id,
      })

      return comment
    }),

  /**
   * Soft delete a comment
   */
  delete: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const existing = await ctx.prisma.taskComment.findFirst({
        where: {
          id: input.id,
          authorId: ctx.user.id,
          isDeleted: false,
        },
      })

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Comment not found or access denied',
        })
      }

      // Soft delete
      await ctx.prisma.taskComment.update({
        where: { id: input.id },
        data: { 
          isDeleted: true,
          content: '[deleted]',
          plainText: '[deleted]',
        },
      })

      // Broadcast real-time comment deletion
      broadcastCommentUpdate(existing.taskId, 'comment-deleted', {
        commentId: input.id,
        taskId: existing.taskId,
        authorId: ctx.user.id,
      })

      return { success: true }
    }),

  /**
   * Add reaction to comment
   */
  addReaction: publicProcedure
    .use(isAuthenticated)
    .use(rateLimit(30, 60000)) // 30 reactions per minute
    .input(reactionSchema)
    .mutation(async ({ input, ctx }) => {
      // Verify comment exists
      const comment = await ctx.prisma.taskComment.findFirst({
        where: {
          id: input.commentId,
          isDeleted: false,
        },
      })

      if (!comment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Comment not found',
        })
      }

      // Create or update reaction
      const reaction = await ctx.prisma.taskCommentReaction.upsert({
        where: {
          commentId_userId_emoji: {
            commentId: input.commentId,
            userId: ctx.user.id,
            emoji: input.emoji,
          },
        },
        create: {
          commentId: input.commentId,
          userId: ctx.user.id,
          emoji: input.emoji,
        },
        update: {
          createdAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      })

      // Broadcast real-time reaction addition
      broadcastCommentUpdate(comment.taskId, 'comment-reaction-added', {
        commentId: input.commentId,
        taskId: comment.taskId,
        reaction,
        userId: ctx.user.id,
      })

      return reaction
    }),

  /**
   * Remove reaction from comment
   */
  removeReaction: publicProcedure
    .use(isAuthenticated)
    .input(reactionSchema)
    .mutation(async ({ input, ctx }) => {
      // Get comment for taskId
      const comment = await ctx.prisma.taskComment.findFirst({
        where: { id: input.commentId },
        select: { taskId: true },
      })

      await ctx.prisma.taskCommentReaction.delete({
        where: {
          commentId_userId_emoji: {
            commentId: input.commentId,
            userId: ctx.user.id,
            emoji: input.emoji,
          },
        },
      })

      // Broadcast real-time reaction removal
      if (comment) {
        broadcastCommentUpdate(comment.taskId, 'comment-reaction-removed', {
          commentId: input.commentId,
          taskId: comment.taskId,
          emoji: input.emoji,
          userId: ctx.user.id,
        })
      }

      return { success: true }
    }),

  /**
   * Search users for mentions
   */
  searchMentions: publicProcedure
    .use(isAuthenticated)
    .input(z.object({
      query: z.string().min(1),
      taskId: z.string(),
      limit: z.number().optional().default(10),
    }))
    .query(async ({ input, ctx }) => {
      // Get task to find workspace context
      const task = await ctx.prisma.task.findFirst({
        where: { id: input.taskId },
        include: {
          project: {
            include: {
              workspace: {
                include: {
                  members: {
                    include: {
                      user: true,
                    },
                  },
                },
              },
            },
          },
        },
      })

      if (!task?.project?.workspace) {
        return []
      }

      // Search workspace members
      const users = task.project.workspace.members
        .filter(member => 
          member.user.name.toLowerCase().includes(input.query.toLowerCase()) ||
          member.user.email.toLowerCase().includes(input.query.toLowerCase())
        )
        .slice(0, input.limit)
        .map(member => ({
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          avatar: member.user.avatar,
        }))

      return users
    }),

  /**
   * Get comment by ID (for detailed view)
   */
  getById: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const comment = await ctx.prisma.taskComment.findFirst({
        where: {
          id: input.id,
          isDeleted: false,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          mentions: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
          reactions: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
          replies: {
            where: { isDeleted: false },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
              mentions: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      avatar: true,
                    },
                  },
                },
              },
              reactions: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      avatar: true,
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      })

      if (!comment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Comment not found',
        })
      }

      return comment
    }),
})
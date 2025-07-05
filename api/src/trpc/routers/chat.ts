/**
 * Chat Router
 * Handles real-time messaging and chat threads
 */

import { z } from 'zod'
import { protectedProcedure, router } from '../trpc'
import { TRPCError } from '@trpc/server'
import { prisma } from '../../lib/database'

export const chatRouter = router({
  /**
   * Get all chat threads for current user
   */
  getThreads: protectedProcedure
    .query(async ({ ctx }) => {
      const threads = await prisma.chatThread.findMany({
        where: {
          OR: [
            { team: { members: { some: { userId: ctx.user.id } } } },
            { type: 'DIRECT' } // For now, include all direct threads
          ]
        },
        include: {
          team: {
            include: {
              members: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      avatar: true
                    }
                  }
                }
              }
            }
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  avatar: true
                }
              }
            }
          }
        },
        orderBy: { updatedAt: 'desc' }
      })

      return threads
    }),

  /**
   * Get messages for a thread
   */
  getMessages: protectedProcedure
    .input(z.object({
      threadId: z.string(),
      limit: z.number().min(1).max(100).default(50),
      cursor: z.string().optional()
    }))
    .query(async ({ input, ctx }) => {
      // Verify user has access to thread
      const thread = await prisma.chatThread.findFirst({
        where: {
          id: input.threadId,
          OR: [
            { team: { members: { some: { userId: ctx.user.id } } } },
            { type: 'DIRECT' } // Add proper direct message access control
          ]
        }
      })

      if (!thread) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Chat thread not found'
        })
      }

      const messages = await prisma.chatMessage.findMany({
        where: {
          threadId: input.threadId,
          ...(input.cursor ? { id: { lt: input.cursor } } : {})
        },
        take: input.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          },
          replyTo: {
            select: {
              id: true,
              content: true,
              sender: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          reactions: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      })

      return {
        messages: messages.reverse(),
        nextCursor: messages.length === input.limit ? messages[0]?.id : undefined
      }
    }),

  /**
   * Send message to thread
   */
  sendMessage: protectedProcedure
    .input(z.object({
      threadId: z.string(),
      content: z.string().min(1, 'Message content is required'),
      type: z.enum(['TEXT', 'FILE', 'IMAGE']).default('TEXT'),
      replyToId: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify user has access to thread
      const thread = await prisma.chatThread.findFirst({
        where: {
          id: input.threadId,
          OR: [
            { team: { members: { some: { userId: ctx.user.id } } } },
            { type: 'DIRECT' } // Add proper direct message access control
          ]
        }
      })

      if (!thread) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Chat thread not found'
        })
      }

      const message = await prisma.chatMessage.create({
        data: {
          content: input.content,
          type: input.type,
          threadId: input.threadId,
          senderId: ctx.user.id,
          replyToId: input.replyToId
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          }
        }
      })

      // Update thread timestamp
      await prisma.chatThread.update({
        where: { id: input.threadId },
        data: { updatedAt: new Date() }
      })

      return message
    }),

  /**
   * Create new chat thread
   */
  createThread: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      type: z.enum(['TEAM', 'DIRECT', 'GROUP']),
      teamId: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // If team thread, verify user is team member
      if (input.type === 'TEAM' && input.teamId) {
        const team = await prisma.team.findFirst({
          where: {
            id: input.teamId,
            members: { some: { userId: ctx.user.id } }
          }
        })

        if (!team) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Team not found or insufficient permissions'
          })
        }
      }

      const thread = await prisma.chatThread.create({
        data: {
          name: input.name,
          type: input.type,
          teamId: input.teamId
        },
        include: {
          team: {
            include: {
              members: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      avatar: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      return thread
    }),

  /**
   * Delete message (only sender or admin)
   */
  deleteMessage: protectedProcedure
    .input(z.object({
      messageId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      const message = await prisma.chatMessage.findFirst({
        where: {
          id: input.messageId,
          OR: [
            { senderId: ctx.user.id }, // Message sender
            { thread: { team: { members: { some: { userId: ctx.user.id, role: { in: ['owner', 'admin'] } } } } } } // Team admin
          ]
        }
      })

      if (!message) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Message not found or insufficient permissions'
        })
      }

      await prisma.chatMessage.delete({
        where: { id: input.messageId }
      })

      return { success: true }
    }),

  /**
   * List chat threads for a workspace (for panel creation)
   */
  listThreads: protectedProcedure
    .input(z.object({
      workspaceId: z.string()
    }))
    .query(async ({ input, ctx }) => {
      // Verify user has access to workspace
      const workspace = await prisma.workspace.findFirst({
        where: {
          id: input.workspaceId,
          OR: [
            { ownerId: ctx.user.id },
            { members: { some: { userId: ctx.user.id } } }
          ]
        }
      })

      if (!workspace) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workspace not found or access denied'
        })
      }

      // Get chat threads for teams in this workspace
      const threads = await prisma.chatThread.findMany({
        where: {
          team: {
            workspaceId: input.workspaceId,
            members: { some: { userId: ctx.user.id } }
          }
        },
        include: {
          team: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              messages: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      })

      return threads
    }),

  /**
   * Add reaction to message
   */
  addReaction: protectedProcedure
    .input(z.object({
      messageId: z.string(),
      emoji: z.string().min(1, 'Emoji is required')
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify message exists and user has access
      const message = await prisma.chatMessage.findFirst({
        where: {
          id: input.messageId,
          thread: {
            OR: [
              { team: { members: { some: { userId: ctx.user.id } } } },
              { type: 'DIRECT' }
            ]
          }
        }
      })

      if (!message) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Message not found or access denied'
        })
      }

      // Create or update reaction (upsert)
      const reaction = await prisma.chatReaction.upsert({
        where: {
          messageId_userId_emoji: {
            messageId: input.messageId,
            userId: ctx.user.id,
            emoji: input.emoji
          }
        },
        update: {},
        create: {
          messageId: input.messageId,
          userId: ctx.user.id,
          emoji: input.emoji
        },
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })

      return reaction
    }),

  /**
   * Remove reaction from message
   */
  removeReaction: protectedProcedure
    .input(z.object({
      messageId: z.string(),
      emoji: z.string().min(1, 'Emoji is required')
    }))
    .mutation(async ({ input, ctx }) => {
      const deleted = await prisma.chatReaction.deleteMany({
        where: {
          messageId: input.messageId,
          userId: ctx.user.id,
          emoji: input.emoji
        }
      })

      return { success: deleted.count > 0 }
    })
})
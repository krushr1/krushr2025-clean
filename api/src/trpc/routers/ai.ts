import { z } from 'zod'
import { router, protectedProcedure } from '../base'
import { aiService } from '../../lib/ai'
import { prisma } from '../../lib/prisma'
import { TRPCError } from '@trpc/server'

export const aiRouter = router({
  // Get user's AI conversations
  getConversations: protectedProcedure
    .input(z.object({
      workspaceId: z.string()
    }))
    .query(async ({ input, ctx }) => {
      const conversations = await prisma.aiConversation.findMany({
        where: {
          userId: ctx.user.id,
          workspaceId: input.workspaceId
        },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1 // Get last message for preview
          }
        },
        orderBy: { updatedAt: 'desc' }
      })

      return conversations
    }),

  // Get specific conversation with messages
  getConversation: protectedProcedure
    .input(z.object({
      conversationId: z.string()
    }))
    .query(async ({ input, ctx }) => {
      const conversation = await prisma.aiConversation.findFirst({
        where: {
          id: input.conversationId,
          userId: ctx.user.id
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      })

      if (!conversation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Conversation not found'
        })
      }

      return conversation
    }),

  // Create new conversation
  createConversation: protectedProcedure
    .input(z.object({
      workspaceId: z.string(),
      title: z.string().optional(),
      context: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const conversation = await prisma.aiConversation.create({
        data: {
          userId: ctx.user.id,
          workspaceId: input.workspaceId,
          title: input.title,
          context: input.context
        }
      })

      return conversation
    }),

  // Send message to AI
  sendMessage: protectedProcedure
    .input(z.object({
      conversationId: z.string(),
      message: z.string().min(1, 'Message cannot be empty'),
      thinkingBudget: z.number().min(0).max(24576).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify conversation belongs to user
      const conversation = await prisma.aiConversation.findFirst({
        where: {
          id: input.conversationId,
          userId: ctx.user.id
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      })

      if (!conversation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Conversation not found'
        })
      }

      // Save user message
      const userMessage = await prisma.aiMessage.create({
        data: {
          conversationId: input.conversationId,
          role: 'user',
          content: input.message,
          tokenCount: aiService['estimateTokenCount'](input.message)
        }
      })

      try {
        // Prepare conversation history for AI
        const messageHistory = [
          ...conversation.messages.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          })),
          {
            role: 'user' as const,
            content: input.message
          }
        ]

        // Generate AI response
        const aiResponse = await aiService.generateResponse(messageHistory, {
          thinkingBudget: input.thinkingBudget
        })

        // Save AI response
        const assistantMessage = await prisma.aiMessage.create({
          data: {
            conversationId: input.conversationId,
            role: 'assistant',
            content: aiResponse.content,
            tokenCount: aiResponse.tokenCount,
            cost: aiResponse.cost,
            thinkingBudget: aiResponse.thinkingTokens,
            responseTime: aiResponse.responseTime
          }
        })

        // Update conversation totals
        await prisma.aiConversation.update({
          where: { id: input.conversationId },
          data: {
            totalTokens: {
              increment: userMessage.tokenCount + assistantMessage.tokenCount
            },
            totalCost: {
              increment: assistantMessage.cost
            },
            updatedAt: new Date()
          }
        })

        // Update daily usage tracking
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        await prisma.aiUsage.upsert({
          where: {
            userId_workspaceId_date_model: {
              userId: ctx.user.id,
              workspaceId: conversation.workspaceId,
              date: today,
              model: 'gemini-2.5-flash'
            }
          },
          update: {
            totalTokens: {
              increment: userMessage.tokenCount + assistantMessage.tokenCount
            },
            totalCost: {
              increment: assistantMessage.cost
            },
            requestCount: {
              increment: 1
            }
          },
          create: {
            userId: ctx.user.id,
            workspaceId: conversation.workspaceId,
            date: today,
            model: 'gemini-2.5-flash',
            totalTokens: userMessage.tokenCount + assistantMessage.tokenCount,
            totalCost: assistantMessage.cost,
            requestCount: 1
          }
        })

        // Auto-generate title if this is the first exchange
        if (conversation.messages.length === 0 && !conversation.title) {
          const title = await aiService.generateTitle(input.message)
          await prisma.aiConversation.update({
            where: { id: input.conversationId },
            data: { title }
          })
        }

        return {
          userMessage,
          assistantMessage,
          usage: {
            tokens: aiResponse.tokenCount,
            cost: aiResponse.cost,
            responseTime: aiResponse.responseTime
          }
        }
      } catch (error) {
        console.error('AI response error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate AI response'
        })
      }
    }),

  // Delete conversation
  deleteConversation: protectedProcedure
    .input(z.object({
      conversationId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      const conversation = await prisma.aiConversation.findFirst({
        where: {
          id: input.conversationId,
          userId: ctx.user.id
        }
      })

      if (!conversation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Conversation not found'
        })
      }

      await prisma.aiConversation.delete({
        where: { id: input.conversationId }
      })

      return { success: true }
    }),

  // Get usage statistics
  getUsageStats: protectedProcedure
    .input(z.object({
      workspaceId: z.string(),
      days: z.number().min(1).max(90).default(30)
    }))
    .query(async ({ input, ctx }) => {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - input.days)

      const usage = await prisma.aiUsage.findMany({
        where: {
          userId: ctx.user.id,
          workspaceId: input.workspaceId,
          date: {
            gte: startDate
          }
        },
        orderBy: { date: 'desc' }
      })

      const totalStats = usage.reduce((acc, day) => ({
        totalTokens: acc.totalTokens + day.totalTokens,
        totalCost: acc.totalCost + day.totalCost,
        totalRequests: acc.totalRequests + day.requestCount
      }), { totalTokens: 0, totalCost: 0, totalRequests: 0 })

      return {
        dailyUsage: usage,
        totalStats,
        period: {
          days: input.days,
          startDate,
          endDate: new Date()
        }
      }
    }),

  // Update conversation title
  updateConversationTitle: protectedProcedure
    .input(z.object({
      conversationId: z.string(),
      title: z.string().min(1).max(100)
    }))
    .mutation(async ({ input, ctx }) => {
      const conversation = await prisma.aiConversation.findFirst({
        where: {
          id: input.conversationId,
          userId: ctx.user.id
        }
      })

      if (!conversation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Conversation not found'
        })
      }

      await prisma.aiConversation.update({
        where: { id: input.conversationId },
        data: { title: input.title }
      })

      return { success: true }
    })
})
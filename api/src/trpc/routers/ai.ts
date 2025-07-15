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

        // Generate AI response with intelligent thinking budget
        const aiResponse = await aiService.generateResponse(messageHistory, {
          thinkingBudget: input.thinkingBudget,
          workspaceId: conversation.workspaceId,
          autoThinkingBudget: true
        })

        // Save AI response
        const assistantMessage = await prisma.aiMessage.create({
          data: {
            conversationId: input.conversationId,
            role: 'assistant',
            content: aiResponse.content,
            tokenCount: aiResponse.tokenCount,
            cost: aiResponse.cost,
            thinkingBudget: aiResponse.actualThinkingBudget,
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
    }),

  // Parse user input into actionable items and optionally create them
  parseAndCreateActions: protectedProcedure
    .input(z.object({
      workspaceId: z.string(),
      message: z.string().min(1, 'Message cannot be empty'),
      autoCreate: z.boolean().default(false), // Whether to automatically create the parsed items
      conversationId: z.string().optional() // Optional conversation context
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Verify workspace access
        const workspaceMember = await prisma.workspaceMember.findFirst({
          where: {
            userId: ctx.user.id,
            workspaceId: input.workspaceId
          }
        })

        if (!workspaceMember) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied to workspace'
          })
        }

        // Generate AI response with intelligent parsing and thinking budget
        const aiResponse = await aiService.generateResponse([{
          role: 'user',
          content: input.message
        }], {
          workspaceId: input.workspaceId,
          autoThinkingBudget: true
        })

        const parsedActions = aiResponse.parsedActions || []
        const createdItems = []

        // If autoCreate is enabled, create the parsed items in the database
        if (input.autoCreate && parsedActions.length > 0) {
          // Find the "frontend board" Kanban or fall back to first available board
          const targetKanban = await prisma.kanban.findFirst({
            where: {
              workspaceId: input.workspaceId,
              title: {
                contains: 'frontend',
                mode: 'insensitive'
              }
            },
            include: {
              columns: {
                orderBy: { position: 'asc' }
              }
            }
          }) || await prisma.kanban.findFirst({
            where: {
              workspaceId: input.workspaceId
            },
            include: {
              columns: {
                orderBy: { position: 'asc' }
              }
            }
          })

          // Find the first TODO-like column in the target board
          const defaultKanbanColumn = targetKanban?.columns.find(col => 
            ['TODO', 'To Do', 'Backlog', 'New', 'Open'].some(title => 
              col.title.toLowerCase().includes(title.toLowerCase())
            )
          ) || targetKanban?.columns[0] // Fall back to first column

          for (const action of parsedActions) {
            try {
              switch (action.type) {
                case 'task':
                  const task = await prisma.task.create({
                    data: {
                      title: action.data.title,
                      description: action.data.description || '',
                      priority: action.data.priority || 'medium',
                      dueDate: action.data.dueDate,
                      createdById: ctx.user.id,
                      projectId: null, // Could be enhanced to parse project context
                      kanbanColumnId: defaultKanbanColumn?.id || null // Assign to default column if available
                    }
                  })
                  console.log(`[AI] Created task "${task.title}" in column "${defaultKanbanColumn?.title || 'none'}" (Board: "${targetKanban?.title || 'none'}")`)
                  createdItems.push({ type: 'task', item: task })
                  break

                case 'note':
                  const note = await prisma.note.create({
                    data: {
                      title: action.data.title,
                      content: action.data.content,
                      authorId: ctx.user.id,
                      workspaceId: input.workspaceId
                    }
                  })
                  createdItems.push({ type: 'note', item: note })
                  break

                case 'project':
                  const project = await prisma.project.create({
                    data: {
                      name: action.data.name,
                      description: action.data.description || '',
                      workspaceId: input.workspaceId,
                      status: 'ACTIVE'
                    }
                  })
                  createdItems.push({ type: 'project', item: project })
                  break

                case 'event':
                  const event = await prisma.calendarEvent.create({
                    data: {
                      title: action.data.title,
                      description: action.data.description || '',
                      startTime: action.data.startTime,
                      endTime: action.data.endTime || new Date(action.data.startTime.getTime() + 60 * 60 * 1000), // Default 1 hour
                      type: action.data.type || 'EVENT',
                      workspaceId: input.workspaceId,
                      createdById: ctx.user.id
                    }
                  })
                  createdItems.push({ type: 'event', item: event })
                  break
              }
            } catch (createError) {
              console.error(`Failed to create ${action.type}:`, createError)
              // Continue with other items even if one fails
            }
          }
        }

        // Save the interaction if part of a conversation
        if (input.conversationId) {
          const conversation = await prisma.aiConversation.findFirst({
            where: {
              id: input.conversationId,
              userId: ctx.user.id
            }
          })

          if (conversation) {
            // Save user message
            await prisma.aiMessage.create({
              data: {
                conversationId: input.conversationId,
                role: 'user',
                content: input.message,
                tokenCount: aiService['estimateTokenCount'](input.message)
              }
            })

            // Save AI response
            await prisma.aiMessage.create({
              data: {
                conversationId: input.conversationId,
                role: 'assistant',
                content: aiResponse.content,
                tokenCount: aiResponse.tokenCount,
                cost: aiResponse.cost,
                thinkingBudget: aiResponse.actualThinkingBudget,
                responseTime: aiResponse.responseTime
              }
            })
          }
        }

        return {
          aiResponse: aiResponse.content,
          parsedActions,
          createdItems,
          usage: {
            tokens: aiResponse.tokenCount,
            cost: aiResponse.cost,
            responseTime: aiResponse.responseTime
          }
        }
      } catch (error) {
        console.error('Parse and create actions error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to parse and create actions'
        })
      }
    }),

  // Preview what actions would be created without actually creating them
  previewActions: protectedProcedure
    .input(z.object({
      workspaceId: z.string(),
      message: z.string().min(1, 'Message cannot be empty')
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Verify workspace access
        const workspaceMember = await prisma.workspaceMember.findFirst({
          where: {
            userId: ctx.user.id,
            workspaceId: input.workspaceId
          }
        })

        if (!workspaceMember) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied to workspace'
          })
        }

        // Generate AI response with parsing preview and intelligent thinking budget
        const aiResponse = await aiService.generateResponse([{
          role: 'user',
          content: `Preview what actionable items you would create from this input: "${input.message}"`
        }], {
          workspaceId: input.workspaceId,
          autoThinkingBudget: true
        })

        return {
          aiResponse: aiResponse.content,
          parsedActions: aiResponse.parsedActions || [],
          usage: {
            tokens: aiResponse.tokenCount,
            cost: aiResponse.cost,
            responseTime: aiResponse.responseTime
          }
        }
      } catch (error) {
        console.error('Preview actions error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to preview actions'
        })
      }
    }),

  // Test endpoint to demonstrate thinking budget extremes
  testThinkingBudgetExtremes: protectedProcedure
    .query(async ({ ctx }) => {
      const testResults = aiService.testBudgetExtremes()
      return testResults
    })
})
/**
 * Task Router
 * Task management, assignment, and real-time updates
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, publicProcedure } from '../trpc'
import { isAuthenticated } from '../middleware'
import { TaskStatus, Priority } from '../../types/enums'
import { aiService } from '../../services/ai'

export const taskRouter = router({
  /**
   * Get all tasks in a workspace
   */
  list: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        workspaceId: z.string(),
        projectId: z.string().optional(),
        kanbanId: z.string().optional(),
        assigneeId: z.string().optional(),
        status: z.nativeEnum(TaskStatus).optional(),
        priority: z.nativeEnum(Priority).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      // Verify workspace access
      const workspace = await ctx.prisma.workspace.findFirst({
        where: {
          id: input.workspaceId,
          OR: [
            { ownerId: ctx.user.id },
            { members: { some: { userId: ctx.user.id } } },
          ],
        },
      })

      if (!workspace) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied to this workspace',
        })
      }

      const tasks = await ctx.prisma.task.findMany({
        where: {
          OR: [
            // Tasks with projects in this workspace
            { project: { workspaceId: input.workspaceId } },
            // Tasks in kanban columns of this workspace (for tasks without projects)
            { 
              kanbanColumn: { 
                kanban: { workspaceId: input.workspaceId } 
              } 
            }
          ],
          ...(input.projectId && { projectId: input.projectId }),
          ...(input.assigneeId && { assigneeId: input.assigneeId }),
          ...(input.status && { status: input.status }),
          ...(input.priority && { priority: input.priority }),
        },
        include: {
          assignee: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          createdBy: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          project: {
            select: { id: true, name: true },
          },
          kanbanColumn: {
            select: { id: true, title: true, kanbanId: true },
          },
          tags: {
            select: { id: true, name: true },
          },
          checklists: {
            include: {
              items: {
                orderBy: { position: 'asc' },
              },
            },
          },
          comments: {
            include: {
              author: {
                select: { id: true, name: true, email: true, avatar: true },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          attachments: {
            select: {
              id: true,
              filename: true,
              mimeType: true,
              size: true,
              url: true,
              thumbnailUrl: true,
              uploadedAt: true
            }
          },
          _count: {
            select: { comments: true, attachments: true },
          },
        },
        orderBy: [
          { kanbanColumn: { position: 'asc' } },
          { position: 'asc' },
          { createdAt: 'desc' },
        ],
      })

      // Transform attachment URLs to include proper paths
      return tasks.map(task => ({
        ...task,
        attachments: task.attachments.map(attachment => ({
          ...attachment,
          downloadUrl: `http://localhost:3002/api/files/${encodeURIComponent(attachment.url)}`,
          thumbnailUrl: attachment.thumbnailUrl ? `http://localhost:3002/api/files/${encodeURIComponent(attachment.thumbnailUrl)}` : null
        }))
      }))
    }),

  /**
   * Get single task by ID
   */
  get: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const task = await ctx.prisma.task.findFirst({
        where: {
          id: input.id,
          OR: [
            // Tasks with projects in accessible workspaces
            {
              project: {
                workspace: {
                  OR: [
                    { ownerId: ctx.user.id },
                    { members: { some: { userId: ctx.user.id } } },
                  ],
                },
              },
            },
            // Tasks in kanban columns of accessible workspaces (for tasks without projects)
            {
              kanbanColumn: {
                kanban: {
                  workspace: {
                    OR: [
                      { ownerId: ctx.user.id },
                      { members: { some: { userId: ctx.user.id } } },
                    ],
                  },
                },
              },
            },
          ],
        },
        include: {
          assignee: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          createdBy: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          project: {
            select: { 
              id: true, 
              name: true, 
              workspace: { 
                select: { id: true, name: true } 
              }
            },
          },
          kanbanColumn: {
            select: { id: true, title: true, kanbanId: true },
          },
          tags: {
            select: { id: true, name: true },
          },
          checklists: {
            include: {
              items: {
                orderBy: { position: 'asc' },
              },
            },
          },
          attachments: {
            select: {
              id: true,
              filename: true,
              mimeType: true,
              size: true,
              url: true,
              thumbnailUrl: true,
              uploadedAt: true
            }
          },
          _count: {
            select: { comments: true, attachments: true },
          },
        },
      })

      if (!task) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found or access denied',
        })
      }

      // Transform attachment URLs to include proper paths
      return {
        ...task,
        attachments: task.attachments.map(attachment => ({
          ...attachment,
          downloadUrl: `http://localhost:3002/api/files/${encodeURIComponent(attachment.url)}`,
          thumbnailUrl: attachment.thumbnailUrl ? `http://localhost:3002/api/files/${encodeURIComponent(attachment.thumbnailUrl)}` : null
        }))
      }
    }),


  /**
   * Create new task
   */
  create: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        title: z.string().min(1, 'Task title is required'),
        description: z.string().optional(),
        status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
        priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
        dueDate: z.string().optional().nullable(),
        projectId: z.string().optional(),
        kanbanColumnId: z.string().optional(),
        assigneeId: z.string().optional().nullable(),
        workspaceId: z.string(),
        tags: z.array(z.string()).optional(),
        estimatedHours: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify workspace access first
      const workspace = await ctx.prisma.workspace.findFirst({
        where: {
          id: input.workspaceId,
          OR: [
            { ownerId: ctx.user.id },
            { members: { some: { userId: ctx.user.id } } },
          ],
        },
      })

      if (!workspace) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied to this workspace',
        })
      }

      // Verify project access if specified
      if (input.projectId) {
        const project = await ctx.prisma.project.findFirst({
          where: {
            id: input.projectId,
            workspaceId: input.workspaceId, // Ensure project belongs to the workspace
            workspace: {
              OR: [
                { ownerId: ctx.user.id },
                { members: { some: { userId: ctx.user.id } } },
              ],
            },
          },
        })

        if (!project) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied to this project',
          })
        }
      }

      // Get position for new task
      const lastTask = await ctx.prisma.task.findFirst({
        where: { kanbanColumnId: input.kanbanColumnId },
        orderBy: { position: 'desc' },
      })

      const position = (lastTask?.position ?? -1) + 1

      const { workspaceId, tags, ...taskData } = input
      
      const task = await ctx.prisma.task.create({
        data: {
          ...taskData,
          dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
          position,
          createdById: ctx.user.id,
          tags: tags ? {
            create: tags.map(name => ({ name }))
          } : undefined,
        },
        include: {
          assignee: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          createdBy: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          project: {
            select: { id: true, name: true },
          },
          kanbanColumn: {
            select: { id: true, title: true, kanbanId: true },
          },
          tags: {
            select: { id: true, name: true },
          },
          checklists: {
            include: {
              items: {
                orderBy: { position: 'asc' },
              },
            },
          },
        },
      })

      return {
        task,
        message: 'Task created successfully',
      }
    }),

  /**
   * Update task
   */
  update: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1, 'Task title is required').optional(),
        description: z.string().optional(),
        status: z.nativeEnum(TaskStatus).optional(),
        priority: z.nativeEnum(Priority).optional(),
        dueDate: z.string().optional(),
        assigneeId: z.string().optional(),
        kanbanColumnId: z.string().optional(),
        position: z.number().optional(),
        tags: z.array(z.string()).optional(),
        estimatedHours: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, tags, ...data } = input

      // Verify task access
      const task = await ctx.prisma.task.findFirst({
        where: {
          id,
          OR: [
            // Tasks with projects in accessible workspaces
            {
              project: {
                workspace: {
                  OR: [
                    { ownerId: ctx.user.id },
                    { members: { some: { userId: ctx.user.id } } },
                  ],
                },
              },
            },
            // Tasks in kanban columns of accessible workspaces (for tasks without projects)
            {
              kanbanColumn: {
                kanban: {
                  workspace: {
                    OR: [
                      { ownerId: ctx.user.id },
                      { members: { some: { userId: ctx.user.id } } },
                    ],
                  },
                },
              },
            },
          ],
        },
      })

      if (!task) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        })
      }

      const updatedTask = await ctx.prisma.task.update({
        where: { id },
        data: {
          ...data,
          tags: tags ? {
            deleteMany: {},
            create: tags.map(name => ({ name }))
          } : undefined,
        },
        include: {
          assignee: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          createdBy: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          project: {
            select: { id: true, name: true },
          },
          kanbanColumn: {
            select: { id: true, title: true, kanbanId: true },
          },
          tags: {
            select: { id: true, name: true },
          },
          checklists: {
            include: {
              items: {
                orderBy: { position: 'asc' },
              },
            },
          },
        },
      })

      return {
        task: updatedTask,
        message: 'Task updated successfully',
      }
    }),

  /**
   * Delete task
   */
  delete: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Verify task access
      const task = await ctx.prisma.task.findFirst({
        where: {
          id: input.id,
          OR: [
            // Tasks with projects in accessible workspaces
            {
              project: {
                workspace: {
                  OR: [
                    { ownerId: ctx.user.id },
                    { members: { some: { userId: ctx.user.id } } },
                  ],
                },
              },
            },
            // Tasks in kanban columns of accessible workspaces (for tasks without projects)
            {
              kanbanColumn: {
                kanban: {
                  workspace: {
                    OR: [
                      { ownerId: ctx.user.id },
                      { members: { some: { userId: ctx.user.id } } },
                    ],
                  },
                },
              },
            },
          ],
        },
      })

      if (!task) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        })
      }

      await ctx.prisma.task.delete({
        where: { id: input.id },
      })

      return {
        message: 'Task deleted successfully',
      }
    }),

  /**
   * Move task to different column/position
   */
  move: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        taskId: z.string(),
        kanbanColumnId: z.string(),
        position: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify task access
      const task = await ctx.prisma.task.findFirst({
        where: {
          id: input.taskId,
          OR: [
            // Tasks with projects in accessible workspaces
            {
              project: {
                workspace: {
                  OR: [
                    { ownerId: ctx.user.id },
                    { members: { some: { userId: ctx.user.id } } },
                  ],
                },
              },
            },
            // Tasks in kanban columns of accessible workspaces (for tasks without projects)
            {
              kanbanColumn: {
                kanban: {
                  workspace: {
                    OR: [
                      { ownerId: ctx.user.id },
                      { members: { some: { userId: ctx.user.id } } },
                    ],
                  },
                },
              },
            },
          ],
        },
      })

      if (!task) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        })
      }

      // Verify target column access
      const targetColumn = await ctx.prisma.kanbanColumn.findFirst({
        where: {
          id: input.kanbanColumnId,
          kanban: {
            workspace: {
              OR: [
                { ownerId: ctx.user.id },
                { members: { some: { userId: ctx.user.id } } },
              ],
            },
          },
        },
      })

      if (!targetColumn) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied to target column',
        })
      }

      // Update task position and column
      const updatedTask = await ctx.prisma.task.update({
        where: { id: input.taskId },
        data: {
          kanbanColumnId: input.kanbanColumnId,
          position: input.position,
        },
        include: {
          assignee: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          kanbanColumn: {
            select: { id: true, title: true, kanbanId: true },
          },
          tags: {
            select: { id: true, name: true },
          },
          checklists: {
            include: {
              items: {
                orderBy: { position: 'asc' },
              },
            },
          },
        },
      })

      return {
        task: updatedTask,
        message: 'Task moved successfully',
      }
    }),

  /**
   * Add comment to task
   */
  addComment: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        taskId: z.string(),
        content: z.string().min(1, 'Comment content is required'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify task access
      const task = await ctx.prisma.task.findFirst({
        where: {
          id: input.taskId,
          OR: [
            // Tasks with projects in accessible workspaces
            {
              project: {
                workspace: {
                  OR: [
                    { ownerId: ctx.user.id },
                    { members: { some: { userId: ctx.user.id } } },
                  ],
                },
              },
            },
            // Tasks in kanban columns of accessible workspaces (for tasks without projects)
            {
              kanbanColumn: {
                kanban: {
                  workspace: {
                    OR: [
                      { ownerId: ctx.user.id },
                      { members: { some: { userId: ctx.user.id } } },
                    ],
                  },
                },
              },
            },
          ],
        },
      })

      if (!task) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        })
      }

      const comment = await ctx.prisma.taskComment.create({
        data: {
          content: input.content,
          taskId: input.taskId,
          authorId: ctx.user.id,
        },
        include: {
          author: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
      })

      return {
        comment,
        message: 'Comment added successfully',
      }
    }),

  /**
   * Update comment
   */
  updateComment: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        id: z.string(),
        content: z.string().min(1, 'Comment content is required'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify comment ownership
      const comment = await ctx.prisma.taskComment.findFirst({
        where: {
          id: input.id,
          authorId: ctx.user.id,
        },
      })

      if (!comment) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Can only edit your own comments',
        })
      }

      const updatedComment = await ctx.prisma.taskComment.update({
        where: { id: input.id },
        data: { content: input.content },
        include: {
          author: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
      })

      return {
        comment: updatedComment,
        message: 'Comment updated successfully',
      }
    }),

  /**
   * Delete comment
   */
  deleteComment: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Verify comment ownership
      const comment = await ctx.prisma.taskComment.findFirst({
        where: {
          id: input.id,
          authorId: ctx.user.id,
        },
      })

      if (!comment) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Can only delete your own comments',
        })
      }

      await ctx.prisma.taskComment.delete({
        where: { id: input.id },
      })

      return {
        message: 'Comment deleted successfully',
      }
    }),

  /**
   * Reorder tasks within a column
   */
  reorder: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        kanbanColumnId: z.string(),
        taskIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify column access
      const column = await ctx.prisma.kanbanColumn.findFirst({
        where: {
          id: input.kanbanColumnId,
          kanban: {
            workspace: {
              OR: [
                { ownerId: ctx.user.id },
                { members: { some: { userId: ctx.user.id } } },
              ],
            },
          },
        },
      })

      if (!column) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied to this column',
        })
      }

      // Update task positions
      const updatePromises = input.taskIds.map((taskId, index) =>
        ctx.prisma.task.update({
          where: { id: taskId },
          data: { position: index },
        })
      )

      await Promise.all(updatePromises)

      return {
        message: 'Tasks reordered successfully',
      }
    }),

  // ========================================
  // 2025 ENHANCED ENTERPRISE FEATURES
  // ========================================

  /**
   * Create enhanced task with 2025 enterprise features
   */
  createEnhanced: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        title: z.string().min(1, 'Task title is required'),
        description: z.string().optional(),
        status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
        priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
        dueDate: z.string().optional(),
        startDate: z.string().optional(),
        projectId: z.string().optional(),
        kanbanColumnId: z.string().optional(),
        assigneeId: z.string().optional(),
        workspaceId: z.string(),
        tags: z.array(z.string()).optional(),
        estimatedHours: z.number().optional(),
        // Enhanced 2025 fields
        storyPoints: z.number().optional(),
        epicId: z.string().optional(),
        parentTaskId: z.string().optional(),
        template: z.string().optional(),
        recurringPattern: z.string().optional(),
        watchers: z.array(z.string()).optional(),
        customFields: z.record(z.string(), z.any()).optional(),
        riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('LOW'),
        businessValue: z.number().min(1).max(10).optional(),
        complexity: z.number().min(1).max(10).optional(),
        isTemplate: z.boolean().default(false),
        isPrivate: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify workspace access
      const workspace = await ctx.prisma.workspace.findFirst({
        where: {
          id: input.workspaceId,
          OR: [
            { ownerId: ctx.user.id },
            { members: { some: { userId: ctx.user.id } } },
          ],
        },
      })

      if (!workspace) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied to this workspace',
        })
      }

      // Verify parent task if specified
      if (input.parentTaskId) {
        const parentTask = await ctx.prisma.task.findFirst({
          where: {
            id: input.parentTaskId,
            OR: [
              { project: { workspaceId: input.workspaceId } },
              { kanbanColumn: { kanban: { workspaceId: input.workspaceId } } }
            ]
          }
        })

        if (!parentTask) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Parent task not found or access denied',
          })
        }
      }

      const { workspaceId, tags, watchers, customFields, ...taskData } = input
      
      const task = await ctx.prisma.task.create({
        data: {
          ...taskData,
          startDate: input.startDate ? new Date(input.startDate) : undefined,
          dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
          createdById: ctx.user.id,
          watchers: JSON.stringify(watchers || []),
          customFields: JSON.stringify(customFields || {}),
          tags: tags ? {
            create: tags.map(name => ({ name }))
          } : undefined,
        },
        include: {
          assignee: { select: { id: true, name: true, email: true, avatar: true } },
          createdBy: { select: { id: true, name: true, email: true, avatar: true } },
          project: { select: { id: true, name: true } },
          kanbanColumn: { select: { id: true, title: true, kanbanId: true } },
          tags: { select: { id: true, name: true } },
          parentTask: { select: { id: true, title: true } },
          subtasks: { select: { id: true, title: true, status: true } },
        },
      })

      return {
        task: {
          ...task,
          watchers: JSON.parse(task.watchers),
          customFields: JSON.parse(task.customFields),
        },
        message: 'Enhanced task created successfully',
      }
    }),

  /**
   * Start time tracking for a task
   */
  startTimeTracking: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        taskId: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify task access
      const task = await ctx.prisma.task.findFirst({
        where: {
          id: input.taskId,
          OR: [
            { project: { workspace: { OR: [{ ownerId: ctx.user.id }, { members: { some: { userId: ctx.user.id } } }] } } },
            { kanbanColumn: { kanban: { workspace: { OR: [{ ownerId: ctx.user.id }, { members: { some: { userId: ctx.user.id } } }] } } } }
          ],
        },
      })

      if (!task) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        })
      }

      // Check if user already has active time tracking
      const activeEntry = await ctx.prisma.taskTimeEntry.findFirst({
        where: {
          userId: ctx.user.id,
          endTime: null,
        },
      })

      if (activeEntry) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'You already have an active time tracking session',
        })
      }

      const timeEntry = await ctx.prisma.taskTimeEntry.create({
        data: {
          taskId: input.taskId,
          userId: ctx.user.id,
          description: input.description,
          startTime: new Date(),
        },
        include: {
          task: { select: { id: true, title: true } },
          user: { select: { id: true, name: true } },
        },
      })

      return {
        timeEntry,
        message: 'Time tracking started',
      }
    }),

  /**
   * Stop time tracking for a task
   */
  stopTimeTracking: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        timeEntryId: z.string(),
        billable: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const timeEntry = await ctx.prisma.taskTimeEntry.findFirst({
        where: {
          id: input.timeEntryId,
          userId: ctx.user.id,
          endTime: null,
        },
      })

      if (!timeEntry) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Active time entry not found',
        })
      }

      const endTime = new Date()
      const duration = Math.round((endTime.getTime() - timeEntry.startTime.getTime()) / (1000 * 60)) // Duration in minutes

      const updatedEntry = await ctx.prisma.taskTimeEntry.update({
        where: { id: input.timeEntryId },
        data: {
          endTime,
          duration,
          billable: input.billable,
        },
        include: {
          task: { select: { id: true, title: true } },
          user: { select: { id: true, name: true } },
        },
      })

      return {
        timeEntry: updatedEntry,
        message: 'Time tracking stopped',
      }
    }),

  /**
   * Get time tracking entries for a task
   */
  getTimeEntries: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ taskId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Verify task access
      const task = await ctx.prisma.task.findFirst({
        where: {
          id: input.taskId,
          OR: [
            { project: { workspace: { OR: [{ ownerId: ctx.user.id }, { members: { some: { userId: ctx.user.id } } }] } } },
            { kanbanColumn: { kanban: { workspace: { OR: [{ ownerId: ctx.user.id }, { members: { some: { userId: ctx.user.id } } }] } } } }
          ],
        },
      })

      if (!task) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        })
      }

      const timeEntries = await ctx.prisma.taskTimeEntry.findMany({
        where: { taskId: input.taskId },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { startTime: 'desc' },
      })

      return timeEntries
    }),

  /**
   * Add task dependency
   */
  addDependency: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        dependentTaskId: z.string(),
        blockingTaskId: z.string(),
        type: z.enum(['FINISH_TO_START', 'START_TO_START', 'FINISH_TO_FINISH', 'START_TO_FINISH']).default('FINISH_TO_START'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify both tasks exist and user has access
      const [dependentTask, blockingTask] = await Promise.all([
        ctx.prisma.task.findFirst({
          where: {
            id: input.dependentTaskId,
            OR: [
              { project: { workspace: { OR: [{ ownerId: ctx.user.id }, { members: { some: { userId: ctx.user.id } } }] } } },
              { kanbanColumn: { kanban: { workspace: { OR: [{ ownerId: ctx.user.id }, { members: { some: { userId: ctx.user.id } } }] } } } }
            ],
          },
        }),
        ctx.prisma.task.findFirst({
          where: {
            id: input.blockingTaskId,
            OR: [
              { project: { workspace: { OR: [{ ownerId: ctx.user.id }, { members: { some: { userId: ctx.user.id } } }] } } },
              { kanbanColumn: { kanban: { workspace: { OR: [{ ownerId: ctx.user.id }, { members: { some: { userId: ctx.user.id } } }] } } } }
            ],
          },
        }),
      ])

      if (!dependentTask || !blockingTask) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'One or both tasks not found',
        })
      }

      const dependency = await ctx.prisma.taskDependency.create({
        data: {
          dependentTaskId: input.dependentTaskId,
          blockingTaskId: input.blockingTaskId,
          type: input.type,
        },
        include: {
          dependentTask: { select: { id: true, title: true } },
          blockingTask: { select: { id: true, title: true } },
        },
      })

      return {
        dependency,
        message: 'Task dependency created',
      }
    }),

  /**
   * Remove task dependency
   */
  removeDependency: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ dependencyId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const dependency = await ctx.prisma.taskDependency.findFirst({
        where: {
          id: input.dependencyId,
          OR: [
            { dependentTask: { project: { workspace: { OR: [{ ownerId: ctx.user.id }, { members: { some: { userId: ctx.user.id } } }] } } } },
            { dependentTask: { kanbanColumn: { kanban: { workspace: { OR: [{ ownerId: ctx.user.id }, { members: { some: { userId: ctx.user.id } } }] } } } } }
          ],
        },
      })

      if (!dependency) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Dependency not found',
        })
      }

      await ctx.prisma.taskDependency.delete({
        where: { id: input.dependencyId },
      })

      return {
        message: 'Task dependency removed',
      }
    }),

  /**
   * Get task with all enhanced relationships
   */
  getEnhanced: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const task = await ctx.prisma.task.findFirst({
        where: {
          id: input.id,
          OR: [
            { project: { workspace: { OR: [{ ownerId: ctx.user.id }, { members: { some: { userId: ctx.user.id } } }] } } },
            { kanbanColumn: { kanban: { workspace: { OR: [{ ownerId: ctx.user.id }, { members: { some: { userId: ctx.user.id } } }] } } } }
          ],
        },
        include: {
          assignee: { select: { id: true, name: true, email: true, avatar: true } },
          createdBy: { select: { id: true, name: true, email: true, avatar: true } },
          project: { select: { id: true, name: true } },
          kanbanColumn: { select: { id: true, title: true, kanbanId: true } },
          tags: { select: { id: true, name: true } },
          parentTask: { select: { id: true, title: true } },
          subtasks: { 
            select: { id: true, title: true, status: true, priority: true },
            orderBy: { createdAt: 'asc' }
          },
          timeEntries: {
            include: { user: { select: { id: true, name: true, avatar: true } } },
            orderBy: { startTime: 'desc' }
          },
          dependencies: {
            include: {
              blockingTask: { select: { id: true, title: true, status: true } }
            }
          },
          dependents: {
            include: {
              dependentTask: { select: { id: true, title: true, status: true } }
            }
          },
          checklists: {
            include: {
              items: { orderBy: { position: 'asc' } }
            }
          },
          comments: {
            include: {
              author: { select: { id: true, name: true, email: true, avatar: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          attachments: true,
        },
      })

      if (!task) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        })
      }

      return {
        ...task,
        watchers: JSON.parse(task.watchers),
        customFields: JSON.parse(task.customFields),
        attachments: task.attachments.map(attachment => ({
          ...attachment,
          downloadUrl: `http://localhost:3002/api/files/${encodeURIComponent(attachment.url)}`,
          thumbnailUrl: attachment.thumbnailUrl ? `http://localhost:3002/api/files/${encodeURIComponent(attachment.thumbnailUrl)}` : null
        }))
      }
    }),

  /**
   * Update task watchers
   */
  updateWatchers: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        taskId: z.string(),
        watchers: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify task access
      const task = await ctx.prisma.task.findFirst({
        where: {
          id: input.taskId,
          OR: [
            { project: { workspace: { OR: [{ ownerId: ctx.user.id }, { members: { some: { userId: ctx.user.id } } }] } } },
            { kanbanColumn: { kanban: { workspace: { OR: [{ ownerId: ctx.user.id }, { members: { some: { userId: ctx.user.id } } }] } } } }
          ],
        },
      })

      if (!task) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        })
      }

      const updatedTask = await ctx.prisma.task.update({
        where: { id: input.taskId },
        data: {
          watchers: JSON.stringify(input.watchers),
        },
      })

      return {
        watchers: JSON.parse(updatedTask.watchers),
        message: 'Task watchers updated',
      }
    }),

  /**
   * Generate AI task summary
   */
  generateAISummary: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ taskId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Verify task access
      const task = await ctx.prisma.task.findFirst({
        where: {
          id: input.taskId,
          OR: [
            { project: { workspace: { OR: [{ ownerId: ctx.user.id }, { members: { some: { userId: ctx.user.id } } }] } } },
            { kanbanColumn: { kanban: { workspace: { OR: [{ ownerId: ctx.user.id }, { members: { some: { userId: ctx.user.id } } }] } } } }
          ],
        },
        include: {
          comments: { select: { content: true, createdAt: true } },
          checklists: { include: { items: true } },
          timeEntries: { select: { duration: true, description: true } },
          attachments: { select: { filename: true, mimeType: true } },
        },
      })

      if (!task) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        })
      }

      // Use AI service for enhanced summary generation
      const aiSummary = await aiService.generateTaskSummary({
        title: task.title,
        description: task.description || undefined,
        comments: task.comments,
        timeEntries: task.timeEntries,
        checklistItems: task.checklists.flatMap(checklist => checklist.items),
      })

      const updatedTask = await ctx.prisma.task.update({
        where: { id: input.taskId },
        data: {
          aiSummary,
        },
      })

      return {
        aiSummary: updatedTask.aiSummary,
        message: 'AI summary generated',
      }
    }),

  /**
   * Generate AI task analysis with recommendations
   */
  generateAIAnalysis: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ taskId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Verify task access
      const task = await ctx.prisma.task.findFirst({
        where: {
          id: input.taskId,
          OR: [
            { project: { workspace: { OR: [{ ownerId: ctx.user.id }, { members: { some: { userId: ctx.user.id } } }] } } },
            { kanbanColumn: { kanban: { workspace: { OR: [{ ownerId: ctx.user.id }, { members: { some: { userId: ctx.user.id } } }] } } } }
          ],
        },
        include: {
          comments: { select: { content: true } },
          timeEntries: { select: { duration: true } },
          attachments: { select: { filename: true, mimeType: true } },
        },
      })

      if (!task) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        })
      }

      // Use AI service for task analysis
      const analysis = await aiService.analyzeTask({
        title: task.title,
        description: task.description || undefined,
        comments: task.comments,
        timeEntries: task.timeEntries,
        attachments: task.attachments,
      })

      // Update task with AI suggestions
      const updatedTask = await ctx.prisma.task.update({
        where: { id: input.taskId },
        data: {
          aiPriority: analysis.suggestedPriority,
          riskLevel: analysis.riskLevel,
          businessValue: analysis.suggestedBusinessValue,
          complexity: analysis.estimatedComplexity,
        },
      })

      return {
        analysis,
        task: updatedTask,
        message: 'AI analysis completed',
      }
    }),

  /**
   * Get AI-powered task scheduling suggestions
   */
  getAIScheduling: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        workspaceId: z.string(),
        projectId: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      // Verify workspace access
      const workspace = await ctx.prisma.workspace.findFirst({
        where: {
          id: input.workspaceId,
          OR: [
            { ownerId: ctx.user.id },
            { members: { some: { userId: ctx.user.id } } },
          ],
        },
      })

      if (!workspace) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied to this workspace',
        })
      }

      // Get tasks for scheduling analysis
      const tasks = await ctx.prisma.task.findMany({
        where: {
          OR: [
            { project: { workspaceId: input.workspaceId } },
            { kanbanColumn: { kanban: { workspaceId: input.workspaceId } } }
          ],
          ...(input.projectId && { projectId: input.projectId }),
          status: { in: ['TODO', 'IN_PROGRESS'] }, // Only active tasks
        },
        include: {
          dependencies: { select: { blockingTaskId: true } },
        },
      })

      // Get AI scheduling suggestions
      const suggestions = await aiService.suggestScheduling(
        tasks.map(task => ({
          id: task.id,
          title: task.title,
          priority: task.priority,
          estimatedHours: task.estimatedHours || undefined,
          dependencies: task.dependencies,
        }))
      )

      return suggestions
    }),
})
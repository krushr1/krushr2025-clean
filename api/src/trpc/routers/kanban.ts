/**
 * Kanban Router
 * Kanban board and column management
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, publicProcedure, protectedProcedure } from '../trpc'
import { isAuthenticated } from '../middleware'

export const kanbanRouter = router({
  /**
   * Get all kanbans in a workspace
   */
  list: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ workspaceId: z.string() }))
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

      const kanbans = await ctx.prisma.kanban.findMany({
        where: { workspaceId: input.workspaceId },
        include: {
          columns: {
            include: {
              tasks: {
                include: {
                  assignee: {
                    select: { id: true, name: true, email: true, avatar: true },
                  },
                  createdBy: {
                    select: { id: true, name: true, email: true, avatar: true },
                  },
                  _count: { select: { comments: true, attachments: true } },
                },
                orderBy: { position: 'asc' },
              },
            },
            orderBy: { position: 'asc' },
          },
          project: {
            select: { id: true, name: true },
          },
        },
        orderBy: { position: 'asc' },
      })

      return kanbans
    }),

  /**
   * Get kanban by ID
   */
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const kanban = await ctx.prisma.kanban.findFirst({
        where: {
          id: input.id,
          workspace: {
            OR: [
              { ownerId: ctx.user.id },
              { members: { some: { userId: ctx.user.id } } },
            ],
          },
        },
        include: {
          columns: {
            include: {
              tasks: {
                include: {
                  assignee: {
                    select: { id: true, name: true, email: true, avatar: true },
                  },
                  createdBy: {
                    select: { id: true, name: true, email: true, avatar: true },
                  },
                  comments: {
                    include: {
                      author: {
                        select: { id: true, name: true, email: true, avatar: true },
                      },
                    },
                    orderBy: { createdAt: 'desc' },
                  },
                  attachments: true,
                },
                orderBy: { position: 'asc' },
              },
            },
            orderBy: { position: 'asc' },
          },
          project: {
            select: { id: true, name: true },
          },
          workspace: {
            select: { id: true, name: true },
          },
        },
      })

      if (!kanban) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Kanban board not found',
        })
      }

      return kanban
    }),

  /**
   * Get kanban board with full details (alias for get)
   */
  getBoard: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ kanbanId: z.string() }))
    .query(async ({ input, ctx }) => {
      const kanban = await ctx.prisma.kanban.findFirst({
        where: {
          id: input.kanbanId,
          workspace: {
            OR: [
              { ownerId: ctx.user.id },
              { members: { some: { userId: ctx.user.id } } },
            ],
          },
        },
        include: {
          columns: {
            include: {
              tasks: {
                include: {
                  assignee: {
                    select: { id: true, name: true, email: true, avatar: true },
                  },
                  createdBy: {
                    select: { id: true, name: true, email: true, avatar: true },
                  },
                  comments: {
                    include: {
                      author: {
                        select: { id: true, name: true, email: true, avatar: true },
                      },
                    },
                    orderBy: { createdAt: 'desc' },
                  },
                  attachments: true,
                },
                orderBy: { position: 'asc' },
              },
            },
            orderBy: { position: 'asc' },
          },
          project: {
            select: { id: true, name: true },
          },
          workspace: {
            select: { id: true, name: true },
          },
        },
      })

      if (!kanban) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Kanban board not found',
        })
      }

      return kanban
    }),

  /**
   * Create new kanban board
   */
  create: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        title: z.string().min(1, 'Kanban title is required'),
        description: z.string().optional(),
        workspaceId: z.string(),
        projectId: z.string().optional(),
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

      // Get position for new kanban
      const lastKanban = await ctx.prisma.kanban.findFirst({
        where: { workspaceId: input.workspaceId },
        orderBy: { position: 'desc' },
      })

      const position = (lastKanban?.position ?? -1) + 1

      // Create kanban with default columns
      const kanban = await ctx.prisma.kanban.create({
        data: {
          title: input.title,
          description: input.description,
          workspaceId: input.workspaceId,
          projectId: input.projectId,
          position,
          columns: {
            create: [
              { title: 'To Do', position: 0, color: '#6B7280' },
              { title: 'In Progress', position: 1, color: '#3B82F6' },
              { title: 'Review', position: 2, color: '#F59E0B' },
              { title: 'Done', position: 3, color: '#10B981' },
            ],
          },
        },
        include: {
          columns: {
            orderBy: { position: 'asc' },
          },
        },
      })

      return {
        kanban,
        message: 'Kanban board created successfully',
      }
    }),

  /**
   * Update kanban board
   */
  update: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1, 'Kanban title is required').optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input

      // Verify access
      const kanban = await ctx.prisma.kanban.findFirst({
        where: {
          id,
          workspace: {
            OR: [
              { ownerId: ctx.user.id },
              { members: { some: { userId: ctx.user.id } } },
            ],
          },
        },
      })

      if (!kanban) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Kanban board not found',
        })
      }

      const updatedKanban = await ctx.prisma.kanban.update({
        where: { id },
        data,
        include: {
          columns: {
            include: {
              tasks: {
                include: {
                  assignee: {
                    select: { id: true, name: true, email: true, avatar: true },
                  },
                },
              },
            },
            orderBy: { position: 'asc' },
          },
        },
      })

      return {
        kanban: updatedKanban,
        message: 'Kanban board updated successfully',
      }
    }),

  /**
   * Delete kanban board
   */
  delete: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Verify access
      const kanban = await ctx.prisma.kanban.findFirst({
        where: {
          id: input.id,
          workspace: {
            OR: [
              { ownerId: ctx.user.id },
              { members: { some: { userId: ctx.user.id } } },
            ],
          },
        },
      })

      if (!kanban) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Kanban board not found',
        })
      }

      await ctx.prisma.kanban.delete({
        where: { id: input.id },
      })

      return {
        message: 'Kanban board deleted successfully',
      }
    }),

  /**
   * Create new column
   */
  createColumn: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        kanbanId: z.string(),
        title: z.string().min(1, 'Column title is required'),
        color: z.string().default('#6B7280'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify kanban access
      const kanban = await ctx.prisma.kanban.findFirst({
        where: {
          id: input.kanbanId,
          workspace: {
            OR: [
              { ownerId: ctx.user.id },
              { members: { some: { userId: ctx.user.id } } },
            ],
          },
        },
      })

      if (!kanban) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Kanban board not found',
        })
      }

      // Get position for new column
      const lastColumn = await ctx.prisma.kanbanColumn.findFirst({
        where: { kanbanId: input.kanbanId },
        orderBy: { position: 'desc' },
      })

      const position = (lastColumn?.position ?? -1) + 1

      const column = await ctx.prisma.kanbanColumn.create({
        data: {
          title: input.title,
          color: input.color,
          kanbanId: input.kanbanId,
          position,
        },
      })

      return {
        column,
        message: 'Column created successfully',
      }
    }),

  /**
   * Update column
   */
  updateColumn: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1, 'Column title is required').optional(),
        color: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input

      // Verify access through kanban
      const column = await ctx.prisma.kanbanColumn.findFirst({
        where: {
          id,
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
          code: 'NOT_FOUND',
          message: 'Column not found',
        })
      }

      const updatedColumn = await ctx.prisma.kanbanColumn.update({
        where: { id },
        data,
      })

      return {
        column: updatedColumn,
        message: 'Column updated successfully',
      }
    }),

  /**
   * Delete column
   */
  deleteColumn: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Verify access
      const column = await ctx.prisma.kanbanColumn.findFirst({
        where: {
          id: input.id,
          kanban: {
            workspace: {
              OR: [
                { ownerId: ctx.user.id },
                { members: { some: { userId: ctx.user.id } } },
              ],
            },
          },
        },
        include: {
          _count: { select: { tasks: true } },
        },
      })

      if (!column) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Column not found',
        })
      }

      if (column._count.tasks > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Cannot delete column with tasks. Move tasks first.',
        })
      }

      await ctx.prisma.kanbanColumn.delete({
        where: { id: input.id },
      })

      return {
        message: 'Column deleted successfully',
      }
    }),

  /**
   * Reorder columns
   */
  reorderColumns: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        kanbanId: z.string(),
        columnIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify kanban access
      const kanban = await ctx.prisma.kanban.findFirst({
        where: {
          id: input.kanbanId,
          workspace: {
            OR: [
              { ownerId: ctx.user.id },
              { members: { some: { userId: ctx.user.id } } },
            ],
          },
        },
      })

      if (!kanban) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Kanban board not found',
        })
      }

      // Update positions
      const updatePromises = input.columnIds.map((columnId, index) =>
        ctx.prisma.kanbanColumn.update({
          where: { id: columnId },
          data: { position: index },
        })
      )

      await Promise.all(updatePromises)

      return {
        message: 'Columns reordered successfully',
      }
    }),
})
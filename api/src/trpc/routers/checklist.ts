/**
 * Task Checklist Router
 * Manages task checklists and checklist items
 */

import { z } from 'zod'
import { router, publicProcedure } from '../trpc'
import { isAuthenticated } from '../middleware'
import { TRPCError } from '@trpc/server'

export const checklistRouter = router({
  /**
   * Create a new checklist for a task
   */
  create: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        title: z.string().min(1, 'Checklist title is required'),
        taskId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify task access
      const task = await ctx.prisma.task.findFirst({
        where: {
          id: input.taskId,
          project: {
            workspace: {
              OR: [
                { ownerId: ctx.user.id },
                { members: { some: { userId: ctx.user.id } } },
              ],
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

      const checklist = await ctx.prisma.taskChecklist.create({
        data: {
          title: input.title,
          taskId: input.taskId,
        },
        include: {
          items: {
            orderBy: { position: 'asc' },
          },
        },
      })

      return checklist
    }),

  /**
   * Update checklist title
   */
  update: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1, 'Checklist title is required'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify checklist access
      const checklist = await ctx.prisma.taskChecklist.findFirst({
        where: {
          id: input.id,
          task: {
            project: {
              workspace: {
                OR: [
                  { ownerId: ctx.user.id },
                  { members: { some: { userId: ctx.user.id } } },
                ],
              },
            },
          },
        },
      })

      if (!checklist) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Checklist not found',
        })
      }

      const updatedChecklist = await ctx.prisma.taskChecklist.update({
        where: { id: input.id },
        data: { title: input.title },
        include: {
          items: {
            orderBy: { position: 'asc' },
          },
        },
      })

      return updatedChecklist
    }),

  /**
   * Delete a checklist
   */
  delete: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Verify checklist access
      const checklist = await ctx.prisma.taskChecklist.findFirst({
        where: {
          id: input.id,
          task: {
            project: {
              workspace: {
                OR: [
                  { ownerId: ctx.user.id },
                  { members: { some: { userId: ctx.user.id } } },
                ],
              },
            },
          },
        },
      })

      if (!checklist) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Checklist not found',
        })
      }

      await ctx.prisma.taskChecklist.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  /**
   * Add item to checklist
   */
  addItem: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        checklistId: z.string(),
        text: z.string().min(1, 'Item text is required'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify checklist access
      const checklist = await ctx.prisma.taskChecklist.findFirst({
        where: {
          id: input.checklistId,
          task: {
            project: {
              workspace: {
                OR: [
                  { ownerId: ctx.user.id },
                  { members: { some: { userId: ctx.user.id } } },
                ],
              },
            },
          },
        },
      })

      if (!checklist) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Checklist not found',
        })
      }

      // Get next position
      const lastItem = await ctx.prisma.taskChecklistItem.findFirst({
        where: { checklistId: input.checklistId },
        orderBy: { position: 'desc' },
      })

      const position = (lastItem?.position ?? -1) + 1

      const item = await ctx.prisma.taskChecklistItem.create({
        data: {
          text: input.text,
          checklistId: input.checklistId,
          position,
        },
      })

      return item
    }),

  /**
   * Update checklist item
   */
  updateItem: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        id: z.string(),
        text: z.string().optional(),
        completed: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input

      // Verify item access
      const item = await ctx.prisma.taskChecklistItem.findFirst({
        where: {
          id,
          checklist: {
            task: {
              project: {
                workspace: {
                  OR: [
                    { ownerId: ctx.user.id },
                    { members: { some: { userId: ctx.user.id } } },
                  ],
                },
              },
            },
          },
        },
      })

      if (!item) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Checklist item not found',
        })
      }

      const updatedItem = await ctx.prisma.taskChecklistItem.update({
        where: { id },
        data,
      })

      return updatedItem
    }),

  /**
   * Delete checklist item
   */
  deleteItem: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Verify item access
      const item = await ctx.prisma.taskChecklistItem.findFirst({
        where: {
          id: input.id,
          checklist: {
            task: {
              project: {
                workspace: {
                  OR: [
                    { ownerId: ctx.user.id },
                    { members: { some: { userId: ctx.user.id } } },
                  ],
                },
              },
            },
          },
        },
      })

      if (!item) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Checklist item not found',
        })
      }

      await ctx.prisma.taskChecklistItem.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})
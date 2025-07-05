/**
 * Comment Router
 * Task comments management
 */

import { z } from 'zod'
import { router, publicProcedure } from '../trpc'
import { isAuthenticated } from '../middleware'

export const commentRouter = router({
  /**
   * List comments for a task
   */
  list: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ taskId: z.string() }))
    .query(async ({ input, ctx }) => {
      const comments = await ctx.prisma.taskComment.findMany({
        where: { taskId: input.taskId },
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
        orderBy: { createdAt: 'desc' },
      })

      return comments
    }),

  /**
   * Create a comment
   */
  create: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        taskId: z.string(),
        content: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const comment = await ctx.prisma.taskComment.create({
        data: {
          ...input,
          authorId: ctx.user.id,
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

      // TODO: Implement activity logging when Activity model is added to schema

      return comment
    }),

  /**
   * Update a comment
   */
  update: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        id: z.string(),
        content: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const existing = await ctx.prisma.taskComment.findFirst({
        where: {
          id: input.id,
          authorId: ctx.user.id,
        },
      })

      if (!existing) {
        throw new Error('Comment not found or access denied')
      }

      const comment = await ctx.prisma.taskComment.update({
        where: { id: input.id },
        data: { content: input.content },
      })

      return comment
    }),

  /**
   * Delete a comment
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
        },
      })

      if (!existing) {
        throw new Error('Comment not found or access denied')
      }

      await ctx.prisma.taskComment.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})
/**
 * Attachment Router
 * File attachments management
 */

import { z } from 'zod'
import { router, publicProcedure } from '../trpc'
import { isAuthenticated } from '../middleware'

export const attachmentRouter = router({
  /**
   * List attachments for a task
   */
  list: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ taskId: z.string() }))
    .query(async ({ input, ctx }) => {
      const attachments = await ctx.prisma.taskAttachment.findMany({
        where: { taskId: input.taskId },
        include: {
          task: {
            select: {
              id: true,
              title: true,
              description: true,
            },
          },
        },
        orderBy: { uploadedAt: 'desc' },
      })

      return attachments
    }),

  /**
   * Create attachment record
   */
  create: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        taskId: z.string(),
        name: z.string(),
        url: z.string(),
        size: z.number(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const attachment = await ctx.prisma.taskAttachment.create({
        data: {
          taskId: input.taskId,
          filename: input.name,
          size: input.size,
          mimeType: input.mimeType,
          url: input.url,
        },
      })

      // TODO: Implement activity logging when Activity model is added to schema

      return attachment
    }),

  /**
   * Delete attachment
   */
  delete: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Verify ownership or admin access
      const attachment = await ctx.prisma.taskAttachment.findFirst({
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

      if (!attachment) {
        throw new Error('Attachment not found or access denied')
      }

      await ctx.prisma.taskAttachment.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})
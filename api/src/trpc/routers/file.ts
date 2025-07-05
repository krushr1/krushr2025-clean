/**
 * File Router (Alias for Upload Router)
 * Provides file management endpoints for compatibility
 */

import { z } from 'zod'
import { publicProcedure, router } from '../trpc'
import { TRPCError } from '@trpc/server'
import { prisma } from '../../lib/database'
import { isAuthenticated } from '../middleware'

export const fileRouter = router({
  /**
   * List all files/attachments
   */
  list: publicProcedure
    .use(isAuthenticated)
    .query(async ({ ctx }) => {
      const attachments = await prisma.taskAttachment.findMany({
        where: {
          task: {
            OR: [
              { createdById: ctx.user.id },
              { assigneeId: ctx.user.id },
              { project: { team: { members: { some: { userId: ctx.user.id } } } } }
            ]
          }
        },
        include: {
          task: {
            select: {
              id: true,
              title: true,
              project: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: { uploadedAt: 'desc' }
      })

      return attachments.map(attachment => ({
        id: attachment.id,
        filename: attachment.filename,
        size: attachment.size,
        mimeType: attachment.mimeType,
        downloadUrl: `/api/files/${attachment.url}`,
        uploadedAt: attachment.uploadedAt,
        task: attachment.task
      }))
    }),

  /**
   * Upload file (proxy to upload router)
   */
  upload: publicProcedure
    .use(isAuthenticated)
    .input(z.object({
      taskId: z.string().optional(),
      file: z.object({
        filename: z.string(),
        mimetype: z.string(),
        size: z.number(),
        buffer: z.instanceof(Buffer)
      })
    }))
    .mutation(async ({ input, ctx }) => {
      if (!input.taskId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Task ID is required for file upload'
        })
      }

      // This would delegate to the upload router
      // For now, return a simple response
      return {
        id: 'temp-file-id',
        filename: input.file.filename,
        size: input.file.size,
        message: 'File upload endpoint available (requires implementation)'
      }
    }),

  /**
   * Get file by ID
   */
  get: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const attachment = await prisma.taskAttachment.findFirst({
        where: {
          id: input.id,
          task: {
            OR: [
              { createdById: ctx.user.id },
              { assigneeId: ctx.user.id },
              { project: { team: { members: { some: { userId: ctx.user.id } } } } }
            ]
          }
        },
        include: {
          task: {
            select: {
              id: true,
              title: true
            }
          }
        }
      })

      if (!attachment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'File not found or access denied'
        })
      }

      return {
        id: attachment.id,
        filename: attachment.filename,
        size: attachment.size,
        mimeType: attachment.mimeType,
        downloadUrl: `/api/files/${attachment.url}`,
        uploadedAt: attachment.uploadedAt,
        task: attachment.task
      }
    }),

  /**
   * Delete file
   */
  delete: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const attachment = await prisma.taskAttachment.findFirst({
        where: {
          id: input.id,
          task: {
            OR: [
              { createdById: ctx.user.id },
              { assigneeId: ctx.user.id },
              { project: { team: { members: { some: { userId: ctx.user.id } } } } }
            ]
          }
        }
      })

      if (!attachment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'File not found or access denied'
        })
      }

      await prisma.taskAttachment.delete({
        where: { id: input.id }
      })

      return {
        success: true,
        message: 'File deleted successfully'
      }
    })
})
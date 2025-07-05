/**
 * Notification Router
 * Real-time notifications and preferences
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, publicProcedure } from '../trpc'
import { isAuthenticated } from '../middleware'
import { NotificationType } from '../../types/enums'

export const notificationRouter = router({
  /**
   * Get all notifications for current user
   */
  list: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        isRead: z.boolean().optional(),
        type: z.nativeEnum(NotificationType).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const notifications = await ctx.prisma.notification.findMany({
        where: {
          userId: ctx.user.id,
          ...(input.isRead !== undefined && { isRead: input.isRead }),
          ...(input.type && { type: input.type }),
        },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
        skip: input.offset,
      })

      const total = await ctx.prisma.notification.count({
        where: {
          userId: ctx.user.id,
          ...(input.isRead !== undefined && { isRead: input.isRead }),
          ...(input.type && { type: input.type }),
        },
      })

      return {
        notifications,
        total,
        hasMore: total > input.offset + input.limit,
      }
    }),

  /**
   * Get unread notification count
   */
  unreadCount: publicProcedure
    .use(isAuthenticated)
    .query(async ({ ctx }) => {
      const count = await ctx.prisma.notification.count({
        where: {
          userId: ctx.user.id,
          isRead: false,
        },
      })

      return { count }
    }),

  /**
   * Mark notification as read
   */
  markAsRead: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const notification = await ctx.prisma.notification.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
      })

      if (!notification) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Notification not found',
        })
      }

      const updatedNotification = await ctx.prisma.notification.update({
        where: { id: input.id },
        data: { isRead: true },
      })

      return {
        notification: updatedNotification,
        message: 'Notification marked as read',
      }
    }),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: publicProcedure
    .use(isAuthenticated)
    .mutation(async ({ ctx }) => {
      const result = await ctx.prisma.notification.updateMany({
        where: {
          userId: ctx.user.id,
          isRead: false,
        },
        data: { isRead: true },
      })

      return {
        count: result.count,
        message: `${result.count} notifications marked as read`,
      }
    }),

  /**
   * Delete notification
   */
  delete: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const notification = await ctx.prisma.notification.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
      })

      if (!notification) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Notification not found',
        })
      }

      await ctx.prisma.notification.delete({
        where: { id: input.id },
      })

      return {
        message: 'Notification deleted successfully',
      }
    }),

  /**
   * Delete all read notifications
   */
  deleteAllRead: publicProcedure
    .use(isAuthenticated)
    .mutation(async ({ ctx }) => {
      const result = await ctx.prisma.notification.deleteMany({
        where: {
          userId: ctx.user.id,
          isRead: true,
        },
      })

      return {
        count: result.count,
        message: `${result.count} read notifications deleted`,
      }
    }),

  /**
   * Create notification (for internal use)
   */
  create: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        title: z.string().min(1, 'Title is required'),
        message: z.string().min(1, 'Message is required'),
        type: z.nativeEnum(NotificationType),
        userId: z.string(),
        data: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const notification = await ctx.prisma.notification.create({
        data: {
          ...input,
          data: input.data ? JSON.stringify(input.data) : null,
        },
      })

      return {
        notification,
        message: 'Notification created successfully',
      }
    }),
})
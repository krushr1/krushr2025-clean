/**
 * User Preferences tRPC Router
 * Handles user settings and preferences including calendar view
 */

import { router, protectedProcedure } from '../trpc'
import { prisma } from '../../lib/prisma'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'

export const preferencesRouter = router({
  /**
   * Get user preferences
   */
  get: protectedProcedure
    .query(async ({ ctx }) => {
      let preferences = await prisma.userPreferences.findUnique({
        where: { userId: ctx.user.id }
      })

      // Create default preferences if they don't exist
      if (!preferences) {
        preferences = await prisma.userPreferences.create({
          data: {
            userId: ctx.user.id
          }
        })
      }

      return preferences
    }),

  /**
   * Update user preferences
   */
  update: protectedProcedure
    .input(z.object({
      theme: z.enum(['light', 'dark', 'system']).optional(),
      colorScheme: z.enum(['blue', 'green', 'purple', 'orange']).optional(),
      compactMode: z.boolean().optional(),
      fontSize: z.enum(['small', 'medium', 'large']).optional(),
      sidebarBehavior: z.enum(['always', 'auto', 'manual']).optional(),
      desktopNotifications: z.boolean().optional(),
      emailNotifications: z.boolean().optional(),
      emailDigestFrequency: z.enum(['immediate', 'daily', 'weekly', 'off']).optional(),
      notifyTaskAssignments: z.boolean().optional(),
      notifyCommentsMentions: z.boolean().optional(),
      notifyTeamInvitations: z.boolean().optional(),
      notifyProjectDeadlines: z.boolean().optional(),
      notifyFileUploads: z.boolean().optional(),
      notificationSound: z.boolean().optional(),
      quietHoursStart: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).nullable().optional(),
      quietHoursEnd: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).nullable().optional(),
      defaultTaskPriority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      autoSaveFrequency: z.number().int().min(5).max(300).optional(),
      defaultCalendarView: z.enum(['month', 'week', 'day', 'agenda']).optional(),
      calendarWeekStartsOn: z.number().int().min(0).max(6).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const preferences = await prisma.userPreferences.upsert({
          where: { userId: ctx.user.id },
          update: input,
          create: {
            userId: ctx.user.id,
            ...input
          }
        })

        return preferences
      } catch (error) {
        console.error('Failed to update user preferences:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update preferences'
        })
      }
    }),

  /**
   * Update only calendar view preference
   */
  updateCalendarView: protectedProcedure
    .input(z.object({
      view: z.enum(['month', 'week', 'day', 'agenda'])
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const preferences = await prisma.userPreferences.upsert({
          where: { userId: ctx.user.id },
          update: {
            defaultCalendarView: input.view
          },
          create: {
            userId: ctx.user.id,
            defaultCalendarView: input.view
          }
        })

        return { success: true, view: preferences.defaultCalendarView }
      } catch (error) {
        console.error('Failed to update calendar view preference:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update calendar view preference'
        })
      }
    }),

  /**
   * Reset preferences to defaults
   */
  reset: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        await prisma.userPreferences.delete({
          where: { userId: ctx.user.id }
        })

        // Create new default preferences
        const preferences = await prisma.userPreferences.create({
          data: {
            userId: ctx.user.id
          }
        })

        return preferences
      } catch (error) {
        console.error('Failed to reset user preferences:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reset preferences'
        })
      }
    })
})
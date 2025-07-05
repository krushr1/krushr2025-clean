/**
 * Calendar tRPC Router
 * Handles calendar events, attendees, and reminders
 */

import { router, protectedProcedure } from '../trpc'
import { CalendarService } from '../../services/calendar.service'
import { prisma } from '../../lib/prisma'
import {
  CreateCalendarEventSchema,
  UpdateCalendarEventSchema,
  CalendarEventQuerySchema,
  UpdateAttendeeStatusSchema,
  DeleteCalendarEventSchema
} from '../../lib/calendar-schemas'
import { z } from 'zod'

const calendarService = new CalendarService(prisma)

export const calendarRouter = router({
  /**
   * Create a new calendar event
   */
  create: protectedProcedure
    .input(CreateCalendarEventSchema)
    .mutation(async ({ input, ctx }) => {
      return await calendarService.createEvent(input, ctx.user.id)
    }),

  /**
   * Update an existing calendar event
   */
  update: protectedProcedure
    .input(UpdateCalendarEventSchema)
    .mutation(async ({ input, ctx }) => {
      return await calendarService.updateEvent(input, ctx.user.id)
    }),

  /**
   * Get calendar events for a workspace with optional filtering
   */
  list: protectedProcedure
    .input(CalendarEventQuerySchema)
    .query(async ({ input, ctx }) => {
      return await calendarService.getEvents(input, ctx.user.id)
    }),

  /**
   * Get a single calendar event by ID
   */
  get: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ input, ctx }) => {
      return await calendarService.getEventById(input.id, ctx.user.id)
    }),

  /**
   * Delete a calendar event
   */
  delete: protectedProcedure
    .input(DeleteCalendarEventSchema)
    .mutation(async ({ input, ctx }) => {
      await calendarService.deleteEvent(input.id, ctx.user.id)
      return { success: true }
    }),

  /**
   * Update attendee status for an event
   */
  updateAttendeeStatus: protectedProcedure
    .input(UpdateAttendeeStatusSchema)
    .mutation(async ({ input }) => {
      await calendarService.updateAttendeeStatus(input)
      return { success: true }
    }),

  /**
   * Get upcoming events for a user across all workspaces
   */
  getUpcoming: protectedProcedure
    .input(z.object({
      limit: z.number().int().min(1).max(20).default(10),
      days: z.number().int().min(1).max(30).default(7)
    }))
    .query(async ({ input, ctx }) => {
      const now = new Date()
      const endDate = new Date()
      endDate.setDate(now.getDate() + input.days)

      const events = await prisma.calendarEvent.findMany({
        where: {
          workspace: {
            members: {
              some: {
                userId: ctx.user.id
              }
            }
          },
          startTime: {
            gte: now,
            lte: endDate
          },
          status: 'CONFIRMED'
        },
        include: {
          attendees: true,
          reminders: true,
          workspace: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          startTime: 'asc'
        },
        take: input.limit
      })

      return events.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        startTime: event.startTime,
        endTime: event.endTime,
        allDay: event.allDay,
        location: event.location,
        color: event.color,
        type: event.type,
        status: event.status,
        priority: event.priority,
        workspaceId: event.workspaceId,
        workspaceName: event.workspace.name,
        attendees: event.attendees,
        reminders: event.reminders
      }))
    }),

  /**
   * Get calendar events for today
   */
  getToday: protectedProcedure
    .input(z.object({
      workspaceId: z.string().cuid().optional(),
      timezone: z.string().default('UTC')
    }))
    .query(async ({ input, ctx }) => {
      const now = new Date()
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

      const events = await prisma.calendarEvent.findMany({
        where: {
          ...(input.workspaceId 
            ? { workspaceId: input.workspaceId }
            : {
                workspace: {
                  members: {
                    some: {
                      userId: ctx.user.id
                    }
                  }
                }
              }
          ),
          OR: [
            {
              allDay: true,
              startTime: {
                gte: startOfDay,
                lt: endOfDay
              }
            },
            {
              allDay: false,
              startTime: {
                gte: startOfDay,
                lt: endOfDay
              }
            },
            {
              allDay: false,
              endTime: {
                gt: startOfDay,
                lte: endOfDay
              }
            }
          ]
        },
        include: {
          attendees: true,
          reminders: true
        },
        orderBy: {
          startTime: 'asc'
        }
      })

      return events.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        startTime: event.startTime,
        endTime: event.endTime,
        allDay: event.allDay,
        location: event.location,
        color: event.color,
        type: event.type,
        status: event.status,
        priority: event.priority,
        visibility: event.visibility,
        timezone: event.timezone,
        workspaceId: event.workspaceId,
        createdById: event.createdById,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        attendees: event.attendees,
        reminders: event.reminders
      }))
    }),

  /**
   * Get calendar statistics for a workspace
   */
  getStats: protectedProcedure
    .input(z.object({
      workspaceId: z.string().cuid(),
      startDate: z.union([z.date(), z.string().datetime()]).optional().transform((val) => {
        if (typeof val === 'string') return new Date(val)
        return val
      }),
      endDate: z.union([z.date(), z.string().datetime()]).optional().transform((val) => {
        if (typeof val === 'string') return new Date(val)
        return val
      })
    }))
    .query(async ({ input, ctx }) => {
      // Verify workspace access
      const workspaceMember = await prisma.workspaceMember.findFirst({
        where: {
          workspaceId: input.workspaceId,
          userId: ctx.user.id
        }
      })

      if (!workspaceMember) {
        throw new Error('You do not have access to this workspace')
      }

      const dateFilter = input.startDate && input.endDate ? {
        startTime: {
          gte: input.startDate,
          lte: input.endDate
        }
      } : {}

      const [
        totalEvents,
        eventsByType,
        eventsByStatus,
        eventsByPriority
      ] = await Promise.all([
        prisma.calendarEvent.count({
          where: {
            workspaceId: input.workspaceId,
            ...dateFilter
          }
        }),
        prisma.calendarEvent.groupBy({
          by: ['type'],
          where: {
            workspaceId: input.workspaceId,
            ...dateFilter
          },
          _count: true
        }),
        prisma.calendarEvent.groupBy({
          by: ['status'],
          where: {
            workspaceId: input.workspaceId,
            ...dateFilter
          },
          _count: true
        }),
        prisma.calendarEvent.groupBy({
          by: ['priority'],
          where: {
            workspaceId: input.workspaceId,
            ...dateFilter
          },
          _count: true
        })
      ])

      return {
        totalEvents,
        eventsByType: eventsByType.map(item => ({
          type: item.type,
          count: item._count
        })),
        eventsByStatus: eventsByStatus.map(item => ({
          status: item.status,
          count: item._count
        })),
        eventsByPriority: eventsByPriority.map(item => ({
          priority: item.priority,
          count: item._count
        }))
      }
    })
})
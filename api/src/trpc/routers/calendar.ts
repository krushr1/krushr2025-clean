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
    }),

  /**
   * Comprehensive Calendar API Health Check
   * Validates database connectivity, service functionality, data integrity, and performance
   */
  health: protectedProcedure
    .input(z.object({
      includePerformance: z.boolean().default(true),
      includeSampleData: z.boolean().default(false),
      checkDataIntegrity: z.boolean().default(true),
      workspaceId: z.string().cuid().optional()
    }))
    .query(async ({ input, ctx }) => {
      const startTime = Date.now()
      const healthCheck = {
        status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        checks: {} as Record<string, any>,
        performance: {} as Record<string, number>,
        summary: {
          totalChecks: 0,
          passedChecks: 0,
          failedChecks: 0,
          warnings: [] as string[]
        }
      }

      // Helper function to add check result
      const addCheck = (name: string, status: 'pass' | 'fail' | 'warn', message: string, details?: any, duration?: number) => {
        healthCheck.checks[name] = {
          status,
          message,
          ...(details && { details }),
          ...(duration && { duration_ms: duration })
        }
        healthCheck.summary.totalChecks++
        if (status === 'pass') healthCheck.summary.passedChecks++
        else if (status === 'fail') healthCheck.summary.failedChecks++
        else if (status === 'warn') healthCheck.summary.warnings.push(message)
      }

      try {
        // 1. Database Connectivity Check
        const dbStartTime = Date.now()
        try {
          await prisma.$queryRaw`SELECT 1`
          const dbDuration = Date.now() - dbStartTime
          addCheck('database_connectivity', 'pass', 'Database connection successful', null, dbDuration)
          healthCheck.performance.database_response_ms = dbDuration
        } catch (error) {
          const dbDuration = Date.now() - dbStartTime
          addCheck('database_connectivity', 'fail', `Database connection failed: ${error}`, { error: String(error) }, dbDuration)
          healthCheck.status = 'unhealthy'
        }

        // 2. Calendar Models Health Check
        const modelsStartTime = Date.now()
        try {
          // Check CalendarEvent model
          const eventCheckTime = Date.now()
          const eventCount = await prisma.calendarEvent.count()
          const eventCheckDuration = Date.now() - eventCheckTime
          addCheck('calendar_event_model', 'pass', `CalendarEvent model accessible (${eventCount} records)`, { count: eventCount }, eventCheckDuration)

          // Check CalendarAttendee model
          const attendeeCheckTime = Date.now()
          const attendeeCount = await prisma.calendarAttendee.count()
          const attendeeCheckDuration = Date.now() - attendeeCheckTime
          addCheck('calendar_attendee_model', 'pass', `CalendarAttendee model accessible (${attendeeCount} records)`, { count: attendeeCount }, attendeeCheckDuration)

          // Check CalendarReminder model
          const reminderCheckTime = Date.now()
          const reminderCount = await prisma.calendarReminder.count()
          const reminderCheckDuration = Date.now() - reminderCheckTime
          addCheck('calendar_reminder_model', 'pass', `CalendarReminder model accessible (${reminderCount} records)`, { count: reminderCount }, reminderCheckDuration)

          const modelsCheckDuration = Date.now() - modelsStartTime
          healthCheck.performance.models_check_ms = modelsCheckDuration

        } catch (error) {
          const modelsCheckDuration = Date.now() - modelsStartTime
          addCheck('calendar_models', 'fail', `Calendar models check failed: ${error}`, { error: String(error) }, modelsCheckDuration)
          healthCheck.status = 'unhealthy'
        }

        // 3. Calendar Service Functionality Check
        const serviceStartTime = Date.now()
        try {
          // Test service instantiation
          const testService = new CalendarService(prisma)
          const serviceCheckDuration = Date.now() - serviceStartTime
          addCheck('calendar_service', 'pass', 'CalendarService instantiation successful', null, serviceCheckDuration)
          healthCheck.performance.service_instantiation_ms = serviceCheckDuration
        } catch (error) {
          const serviceCheckDuration = Date.now() - serviceStartTime
          addCheck('calendar_service', 'fail', `CalendarService instantiation failed: ${error}`, { error: String(error) }, serviceCheckDuration)
          healthCheck.status = 'degraded'
        }

        // 4. Schema Validation Check
        const schemaStartTime = Date.now()
        try {
          // Test schema validation with sample data
          const sampleCreateInput = {
            title: 'Health Check Event',
            startTime: new Date(),
            endTime: new Date(Date.now() + 3600000), // 1 hour later
            workspaceId: 'ckxxxxxxxxxxxxxxxxxx', // Sample CUID
            attendees: [{
              email: 'test@example.com',
              name: 'Test User',
              isOrganizer: true
            }],
            reminders: [{
              type: 'NOTIFICATION' as const,
              timing: 'FIFTEEN_MINUTES' as const
            }]
          }

          CreateCalendarEventSchema.parse(sampleCreateInput)
          const schemaCheckDuration = Date.now() - schemaStartTime
          addCheck('schema_validation', 'pass', 'Calendar schema validation successful', null, schemaCheckDuration)
          healthCheck.performance.schema_validation_ms = schemaCheckDuration
        } catch (error) {
          const schemaCheckDuration = Date.now() - schemaStartTime
          addCheck('schema_validation', 'fail', `Schema validation failed: ${error}`, { error: String(error) }, schemaCheckDuration)
          healthCheck.status = 'degraded'
        }

        // 5. Data Integrity Checks (if enabled)
        if (input.checkDataIntegrity) {
          const integrityStartTime = Date.now()
          try {
            // Check for orphaned attendees (use NOT EXISTS for better performance)
            const orphanedAttendeesResult = await prisma.$queryRaw<Array<{ count: number }>>`
              SELECT COUNT(*) as count 
              FROM calendar_attendees ca
              WHERE NOT EXISTS (SELECT 1 FROM calendar_events ce WHERE ce.id = ca.event_id)
            `
            const orphanedAttendees = Number(orphanedAttendeesResult[0]?.count || 0)

            // Check for orphaned reminders  
            const orphanedRemindersResult = await prisma.$queryRaw<Array<{ count: number }>>`
              SELECT COUNT(*) as count 
              FROM calendar_reminders cr
              WHERE NOT EXISTS (SELECT 1 FROM calendar_events ce WHERE ce.id = cr.event_id)
            `
            const orphanedReminders = Number(orphanedRemindersResult[0]?.count || 0)

            // Check for events with invalid date ranges (using raw SQL for comparison)
            const invalidDateEventsResult = await prisma.$queryRaw<Array<{ count: number }>>`
              SELECT COUNT(*) as count 
              FROM calendar_events 
              WHERE end_time <= start_time
            `
            const invalidDateEvents = Number(invalidDateEventsResult[0]?.count || 0)

            // Check for events without workspace
            const eventsWithoutWorkspaceResult = await prisma.$queryRaw<Array<{ count: number }>>`
              SELECT COUNT(*) as count 
              FROM calendar_events ce
              WHERE NOT EXISTS (SELECT 1 FROM workspaces w WHERE w.id = ce.workspace_id)
            `
            const eventsWithoutWorkspace = Number(eventsWithoutWorkspaceResult[0]?.count || 0)

            const integrityIssues = orphanedAttendees + orphanedReminders + invalidDateEvents + eventsWithoutWorkspace
            const integrityCheckDuration = Date.now() - integrityStartTime

            if (integrityIssues === 0) {
              addCheck('data_integrity', 'pass', 'No data integrity issues found', {
                orphanedAttendees,
                orphanedReminders,
                invalidDateEvents,
                eventsWithoutWorkspace
              }, integrityCheckDuration)
            } else {
              addCheck('data_integrity', 'warn', `Found ${integrityIssues} data integrity issues`, {
                orphanedAttendees,
                orphanedReminders,
                invalidDateEvents,
                eventsWithoutWorkspace
              }, integrityCheckDuration)
              healthCheck.status = 'degraded'
            }

            healthCheck.performance.integrity_check_ms = integrityCheckDuration

          } catch (error) {
            const integrityCheckDuration = Date.now() - integrityStartTime
            addCheck('data_integrity', 'fail', `Data integrity check failed: ${error}`, { error: String(error) }, integrityCheckDuration)
            healthCheck.status = 'degraded'
          }
        }

        // 6. Workspace-specific checks (if workspace provided)
        if (input.workspaceId) {
          const workspaceStartTime = Date.now()
          try {
            // Verify user has access to workspace
            const workspaceMember = await prisma.workspaceMember.findFirst({
              where: {
                workspaceId: input.workspaceId,
                userId: ctx.user.id
              }
            })

            if (!workspaceMember) {
              addCheck('workspace_access', 'fail', 'User does not have access to specified workspace', {
                workspaceId: input.workspaceId,
                userId: ctx.user.id
              })
              healthCheck.status = 'degraded'
            } else {
              // Check workspace calendar data
              const workspaceEvents = await prisma.calendarEvent.count({
                where: { workspaceId: input.workspaceId }
              })

              const workspaceCheckDuration = Date.now() - workspaceStartTime
              addCheck('workspace_calendar', 'pass', `Workspace calendar accessible (${workspaceEvents} events)`, {
                workspaceId: input.workspaceId,
                eventCount: workspaceEvents
              }, workspaceCheckDuration)
              healthCheck.performance.workspace_check_ms = workspaceCheckDuration
            }
          } catch (error) {
            const workspaceCheckDuration = Date.now() - workspaceStartTime
            addCheck('workspace_calendar', 'fail', `Workspace calendar check failed: ${error}`, { error: String(error) }, workspaceCheckDuration)
            healthCheck.status = 'degraded'
          }
        }

        // 7. Performance Metrics (if enabled)
        if (input.includePerformance) {
          const perfStartTime = Date.now()
          try {
            // Test query performance with recent events
            const recentEventsStart = Date.now()
            const recentEvents = await prisma.calendarEvent.findMany({
              where: {
                createdAt: {
                  gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                }
              },
              include: {
                attendees: true,
                reminders: true
              },
              take: 10
            })
            const recentEventsTime = Date.now() - recentEventsStart

            // Test aggregation performance
            const aggregationStart = Date.now()
            const eventTypes = await prisma.calendarEvent.groupBy({
              by: ['type'],
              _count: true
            })
            const aggregationTime = Date.now() - aggregationStart

            const perfCheckDuration = Date.now() - perfStartTime
            addCheck('performance_metrics', 'pass', 'Performance metrics collected', {
              recentEventsQuery_ms: recentEventsTime,
              aggregationQuery_ms: aggregationTime,
              recentEventsCount: recentEvents.length,
              eventTypesCount: eventTypes.length
            }, perfCheckDuration)

            healthCheck.performance.recent_events_query_ms = recentEventsTime
            healthCheck.performance.aggregation_query_ms = aggregationTime
            healthCheck.performance.performance_check_ms = perfCheckDuration

            // Performance thresholds
            if (recentEventsTime > 1000) {
              addCheck('performance_recent_events', 'warn', `Recent events query slower than expected: ${recentEventsTime}ms`, null, recentEventsTime)
            } else {
              addCheck('performance_recent_events', 'pass', `Recent events query performance good: ${recentEventsTime}ms`, null, recentEventsTime)
            }

            if (aggregationTime > 500) {
              addCheck('performance_aggregation', 'warn', `Aggregation query slower than expected: ${aggregationTime}ms`, null, aggregationTime)
            } else {
              addCheck('performance_aggregation', 'pass', `Aggregation query performance good: ${aggregationTime}ms`, null, aggregationTime)
            }

          } catch (error) {
            const perfCheckDuration = Date.now() - perfStartTime
            addCheck('performance_metrics', 'fail', `Performance metrics collection failed: ${error}`, { error: String(error) }, perfCheckDuration)
            healthCheck.status = 'degraded'
          }
        }

        // 8. Sample Data Validation (if enabled)
        if (input.includeSampleData) {
          const sampleDataStartTime = Date.now()
          try {
            // Get sample event with full relations
            const sampleEvent = await prisma.calendarEvent.findFirst({
              include: {
                attendees: true,
                reminders: true,
                workspace: {
                  select: {
                    id: true,
                    name: true
                  }
                },
                createdBy: {
                  select: {
                    id: true,
                    email: true,
                    name: true
                  }
                }
              }
            })

            const sampleDataCheckDuration = Date.now() - sampleDataStartTime

            if (sampleEvent) {
              // Validate sample data structure
              const isValid = 
                sampleEvent.id &&
                sampleEvent.title &&
                sampleEvent.startTime &&
                sampleEvent.endTime &&
                sampleEvent.workspaceId &&
                sampleEvent.createdById

              if (isValid) {
                addCheck('sample_data_validation', 'pass', 'Sample event data structure valid', {
                  eventId: sampleEvent.id,
                  attendeesCount: sampleEvent.attendees.length,
                  remindersCount: sampleEvent.reminders.length,
                  hasWorkspace: !!sampleEvent.workspace,
                  hasCreator: !!sampleEvent.createdBy
                }, sampleDataCheckDuration)
              } else {
                addCheck('sample_data_validation', 'warn', 'Sample event data structure incomplete', {
                  eventId: sampleEvent.id,
                  missingFields: [
                    !sampleEvent.id && 'id',
                    !sampleEvent.title && 'title',
                    !sampleEvent.startTime && 'startTime',
                    !sampleEvent.endTime && 'endTime',
                    !sampleEvent.workspaceId && 'workspaceId',
                    !sampleEvent.createdById && 'createdById'
                  ].filter(Boolean)
                }, sampleDataCheckDuration)
              }
            } else {
              addCheck('sample_data_validation', 'warn', 'No sample events found in database', null, sampleDataCheckDuration)
            }

            healthCheck.performance.sample_data_check_ms = sampleDataCheckDuration

          } catch (error) {
            const sampleDataCheckDuration = Date.now() - sampleDataStartTime
            addCheck('sample_data_validation', 'fail', `Sample data validation failed: ${error}`, { error: String(error) }, sampleDataCheckDuration)
            healthCheck.status = 'degraded'
          }
        }

        // Final health status determination
        const totalDuration = Date.now() - startTime
        healthCheck.performance.total_health_check_ms = totalDuration

        if (healthCheck.summary.failedChecks > 0) {
          healthCheck.status = 'unhealthy'
        } else if (healthCheck.summary.warnings.length > 0) {
          healthCheck.status = 'degraded'
        }

        // Add summary check
        addCheck('health_check_summary', 'pass', `Health check completed in ${totalDuration}ms`, {
          totalChecks: healthCheck.summary.totalChecks,
          passedChecks: healthCheck.summary.passedChecks,
          failedChecks: healthCheck.summary.failedChecks,
          warningsCount: healthCheck.summary.warnings.length,
          overallStatus: healthCheck.status
        }, totalDuration)

        return healthCheck

      } catch (error) {
        // Catastrophic failure
        const totalDuration = Date.now() - startTime
        return {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          checks: {
            catastrophic_failure: {
              status: 'fail',
              message: `Calendar health check failed catastrophically: ${error}`,
              details: { error: String(error) },
              duration_ms: totalDuration
            }
          },
          performance: {
            total_health_check_ms: totalDuration
          },
          summary: {
            totalChecks: 1,
            passedChecks: 0,
            failedChecks: 1,
            warnings: []
          }
        }
      }
    })
})
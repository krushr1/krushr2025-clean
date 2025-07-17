/**
 * Calendar Service Layer
 * Handles business logic for calendar events, attendees, and reminders
 */

import { PrismaClient } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import type {
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
  CalendarEventQueryInput,
  UpdateAttendeeStatusInput,
  CalendarEventResponse
} from '../lib/calendar-schemas'

export class CalendarService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new calendar event with attendees and reminders
   */
  async createEvent(
    input: CreateCalendarEventInput,
    userId: string
  ): Promise<CalendarEventResponse> {
    // Verify workspace access
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        id: input.workspaceId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      }
    })

    if (!workspace) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have access to this workspace'
      })
    }

    // Validate date constraints
    if (input.endTime <= input.startTime) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'End time must be after start time'
      })
    }

    // Check for scheduling conflicts (optional business rule)
    const conflicts = await this.checkSchedulingConflicts(
      input.workspaceId,
      input.startTime,
      input.endTime,
      userId
    )

    if (conflicts.length > 0) {
      console.warn(`Scheduling conflict detected for user ${userId}:`, conflicts)
      // For now, we'll allow conflicts but could add stricter validation
    }

    try {
      const event = await this.prisma.calendarEvent.create({
        data: {
          title: input.title,
          description: input.description,
          startTime: input.startTime,
          endTime: input.endTime,
          allDay: input.allDay,
          location: input.location,
          color: input.color,
          type: input.type,
          status: input.status,
          priority: input.priority,
          visibility: input.visibility,
          timezone: input.timezone,
          workspaceId: input.workspaceId,
          createdById: userId,
          attendees: {
            create: input.attendees.map(attendee => ({
              email: attendee.email,
              name: attendee.name,
              isOrganizer: attendee.isOrganizer,
              status: attendee.isOrganizer ? 'ACCEPTED' : 'PENDING'
            }))
          },
          reminders: {
            create: input.reminders.map(reminder => ({
              type: reminder.type,
              timing: reminder.timing,
              customMinutes: reminder.timing === 'CUSTOM' ? reminder.customMinutes : null
            }))
          }
        },
        include: {
          attendees: true,
          reminders: true
        }
      })

      return this.mapEventToResponse(event)
    } catch (error) {
      console.error('Failed to create calendar event:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create calendar event'
      })
    }
  }

  /**
   * Update an existing calendar event
   */
  async updateEvent(
    input: UpdateCalendarEventInput,
    userId: string
  ): Promise<CalendarEventResponse> {
    const existingEvent = await this.prisma.calendarEvent.findUnique({
      where: { id: input.id },
      include: { workspace: true }
    })

    if (!existingEvent) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Calendar event not found'
      })
    }

    // Check permissions - only creator or workspace owner/member can edit
    const isCreator = existingEvent.createdById === userId
    const workspace = existingEvent.workspace
    const isOwner = workspace.ownerId === userId
    const isMember = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId: workspace.id,
        userId
      }
    }) !== null

    if (!isCreator && !isOwner && !isMember) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to update this event'
      })
    }

    // Validate date constraints if dates are being updated
    if (input.startTime && input.endTime && input.endTime <= input.startTime) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'End time must be after start time'
      })
    }

    try {
      const event = await this.prisma.calendarEvent.update({
        where: { id: input.id },
        data: {
          ...(input.title && { title: input.title }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.startTime && { startTime: input.startTime }),
          ...(input.endTime && { endTime: input.endTime }),
          ...(input.allDay !== undefined && { allDay: input.allDay }),
          ...(input.location !== undefined && { location: input.location }),
          ...(input.color && { color: input.color }),
          ...(input.type && { type: input.type }),
          ...(input.status && { status: input.status }),
          ...(input.priority && { priority: input.priority }),
          ...(input.visibility && { visibility: input.visibility }),
          ...(input.timezone && { timezone: input.timezone })
        },
        include: {
          attendees: true,
          reminders: true
        }
      })

      return this.mapEventToResponse(event)
    } catch (error) {
      console.error('Failed to update calendar event:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update calendar event'
      })
    }
  }

  /**
   * Get calendar events for a workspace with optional filtering
   */
  async getEvents(
    input: CalendarEventQueryInput,
    userId: string
  ): Promise<CalendarEventResponse[]> {
    // Verify workspace access
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        id: input.workspaceId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      }
    })

    if (!workspace) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have access to this workspace'
      })
    }

    const events = await this.prisma.calendarEvent.findMany({
      where: {
        workspaceId: input.workspaceId,
        ...(input.startDate && input.endDate && {
          OR: [
            {
              startTime: {
                gte: input.startDate,
                lte: input.endDate
              }
            },
            {
              endTime: {
                gte: input.startDate,
                lte: input.endDate
              }
            },
            {
              AND: [
                { startTime: { lte: input.startDate } },
                { endTime: { gte: input.endDate } }
              ]
            }
          ]
        }),
        ...(input.type && { type: input.type }),
        ...(input.status && { status: input.status }),
        ...(input.priority && { priority: input.priority })
      },
      include: {
        attendees: true,
        reminders: true
      },
      orderBy: {
        startTime: 'asc'
      },
      skip: input.offset,
      take: input.limit
    })

    return events.map(event => this.mapEventToResponse(event))
  }

  /**
   * Get a single calendar event by ID
   */
  async getEventById(eventId: string, userId: string): Promise<CalendarEventResponse> {
    const event = await this.prisma.calendarEvent.findUnique({
      where: { id: eventId },
      include: {
        attendees: true,
        reminders: true,
        workspace: true
      }
    })

    if (!event) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Calendar event not found'
      })
    }

    // Check access permissions
    const workspace = event.workspace
    const isOwner = workspace.ownerId === userId
    const isMember = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId: workspace.id,
        userId
      }
    }) !== null

    if (!isOwner && !isMember) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have access to this event'
      })
    }

    return this.mapEventToResponse(event)
  }

  /**
   * Delete a calendar event
   */
  async deleteEvent(eventId: string, userId: string): Promise<void> {
    const event = await this.prisma.calendarEvent.findUnique({
      where: { id: eventId },
      include: { workspace: true }
    })

    if (!event) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Calendar event not found'
      })
    }

    // Check permissions - only creator or workspace owner/member can delete
    const isCreator = event.createdById === userId
    const workspace = event.workspace
    const isOwner = workspace.ownerId === userId
    const isMember = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId: workspace.id,
        userId
      }
    }) !== null

    if (!isCreator && !isOwner && !isMember) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to delete this event'
      })
    }

    try {
      await this.prisma.calendarEvent.delete({
        where: { id: eventId }
      })
    } catch (error) {
      console.error('Failed to delete calendar event:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete calendar event'
      })
    }
  }

  /**
   * Update attendee status for an event
   */
  async updateAttendeeStatus(input: UpdateAttendeeStatusInput): Promise<void> {
    const attendee = await this.prisma.calendarAttendee.findUnique({
      where: {
        eventId_email: {
          eventId: input.eventId,
          email: input.email
        }
      }
    })

    if (!attendee) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Attendee not found for this event'
      })
    }

    try {
      await this.prisma.calendarAttendee.update({
        where: { id: attendee.id },
        data: {
          status: input.status,
          response: input.response
        }
      })
    } catch (error) {
      console.error('Failed to update attendee status:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update attendee status'
      })
    }
  }

  /**
   * Check for scheduling conflicts
   */
  private async checkSchedulingConflicts(
    workspaceId: string,
    startTime: Date,
    endTime: Date,
    userId: string,
    excludeEventId?: string
  ) {
    return await this.prisma.calendarEvent.findMany({
      where: {
        workspaceId,
        createdById: userId,
        ...(excludeEventId && { id: { not: excludeEventId } }),
        OR: [
          {
            startTime: {
              gte: startTime,
              lt: endTime
            }
          },
          {
            endTime: {
              gt: startTime,
              lte: endTime
            }
          },
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gte: endTime } }
            ]
          }
        ]
      }
    })
  }

  /**
   * Map Prisma event to response type
   */
  private mapEventToResponse(event: any): CalendarEventResponse {
    return {
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
      attendees: event.attendees.map((attendee: any) => ({
        id: attendee.id,
        email: attendee.email,
        name: attendee.name,
        status: attendee.status,
        response: attendee.response,
        isOrganizer: attendee.isOrganizer
      })),
      reminders: event.reminders.map((reminder: any) => ({
        id: reminder.id,
        type: reminder.type,
        timing: reminder.timing,
        customMinutes: reminder.customMinutes
      }))
    }
  }
}
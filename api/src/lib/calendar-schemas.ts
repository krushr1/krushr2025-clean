/**
 * Calendar validation schemas and types for tRPC routes
 */

import { z } from 'zod'

// Calendar Event Types
export const CalendarEventTypeSchema = z.enum([
  'MEETING',
  'TASK', 
  'REMINDER',
  'EVENT',
  'DEADLINE',
  'MILESTONE'
])

export const CalendarEventStatusSchema = z.enum([
  'CONFIRMED',
  'TENTATIVE', 
  'CANCELLED'
])

export const CalendarEventPrioritySchema = z.enum([
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL'
])

export const CalendarVisibilitySchema = z.enum([
  'DEFAULT',
  'PUBLIC',
  'PRIVATE'
])

export const CalendarAttendeeStatusSchema = z.enum([
  'PENDING',
  'ACCEPTED',
  'DECLINED',
  'MAYBE'
])

export const CalendarReminderTypeSchema = z.enum([
  'NOTIFICATION',
  'EMAIL',
  'SMS'
])

export const CalendarReminderTimingSchema = z.enum([
  'FIVE_MINUTES',
  'TEN_MINUTES',
  'FIFTEEN_MINUTES',
  'THIRTY_MINUTES',
  'ONE_HOUR',
  'TWO_HOURS',
  'ONE_DAY',
  'ONE_WEEK',
  'CUSTOM'
])

// Input validation schemas
const BaseCalendarEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  startTime: z.date(),
  endTime: z.date(),
  allDay: z.boolean().default(false),
  location: z.string().max(300, 'Location too long').optional(),
  color: z.string().regex(/^(blue|green|purple|orange|red)$/, 'Invalid color').default('blue'),
  type: CalendarEventTypeSchema.default('EVENT'),
  status: CalendarEventStatusSchema.default('CONFIRMED'),
  priority: CalendarEventPrioritySchema.default('MEDIUM'),
  visibility: CalendarVisibilitySchema.default('DEFAULT'),
  timezone: z.string().default('UTC'),
  workspaceId: z.string().cuid(),
  attendees: z.array(z.object({
    email: z.string().email('Invalid email'),
    name: z.string().optional(),
    isOrganizer: z.boolean().default(false)
  })).default([]),
  reminders: z.array(z.object({
    type: CalendarReminderTypeSchema.default('NOTIFICATION'),
    timing: CalendarReminderTimingSchema.default('FIFTEEN_MINUTES'),
    customMinutes: z.number().int().min(1).max(525600).optional() // Max 1 year
  })).default([])
})

export const CreateCalendarEventSchema = BaseCalendarEventSchema.refine(
  (data) => data.endTime > data.startTime,
  {
    message: 'End time must be after start time',
    path: ['endTime']
  }
)

export const UpdateCalendarEventSchema = BaseCalendarEventSchema.partial().extend({
  id: z.string().cuid()
}).refine(
  (data) => !data.startTime || !data.endTime || data.endTime > data.startTime,
  {
    message: 'End time must be after start time',
    path: ['endTime']
  }
)

export const CalendarEventQuerySchema = z.object({
  workspaceId: z.string().cuid(),
  startDate: z.union([z.date(), z.string().datetime()]).optional().transform((val) => {
    if (typeof val === 'string') return new Date(val)
    return val
  }),
  endDate: z.union([z.date(), z.string().datetime()]).optional().transform((val) => {
    if (typeof val === 'string') return new Date(val)
    return val
  }),
  type: CalendarEventTypeSchema.optional(),
  status: CalendarEventStatusSchema.optional(),
  priority: CalendarEventPrioritySchema.optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0)
})

export const UpdateAttendeeStatusSchema = z.object({
  eventId: z.string().cuid(),
  email: z.string().email(),
  status: CalendarAttendeeStatusSchema,
  response: z.string().max(500).optional()
})

export const DeleteCalendarEventSchema = z.object({
  id: z.string().cuid()
})

// Response types
export const CalendarEventResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  startTime: z.date(),
  endTime: z.date(),
  allDay: z.boolean(),
  location: z.string().nullable(),
  color: z.string(),
  type: CalendarEventTypeSchema,
  status: CalendarEventStatusSchema,
  priority: CalendarEventPrioritySchema,
  visibility: CalendarVisibilitySchema,
  timezone: z.string(),
  workspaceId: z.string(),
  createdById: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  attendees: z.array(z.object({
    id: z.string(),
    email: z.string(),
    name: z.string().nullable(),
    status: CalendarAttendeeStatusSchema,
    response: z.string().nullable(),
    isOrganizer: z.boolean()
  })),
  reminders: z.array(z.object({
    id: z.string(),
    type: CalendarReminderTypeSchema,
    timing: CalendarReminderTimingSchema,
    customMinutes: z.number().nullable()
  }))
})

// Type exports
export type CreateCalendarEventInput = z.infer<typeof CreateCalendarEventSchema>
export type UpdateCalendarEventInput = z.infer<typeof UpdateCalendarEventSchema>
export type CalendarEventQueryInput = z.infer<typeof CalendarEventQuerySchema>
export type UpdateAttendeeStatusInput = z.infer<typeof UpdateAttendeeStatusSchema>
export type CalendarEventResponse = z.infer<typeof CalendarEventResponseSchema>

export type CalendarEventType = z.infer<typeof CalendarEventTypeSchema>
export type CalendarEventStatus = z.infer<typeof CalendarEventStatusSchema>
export type CalendarEventPriority = z.infer<typeof CalendarEventPrioritySchema>
export type CalendarVisibility = z.infer<typeof CalendarVisibilitySchema>
export type CalendarAttendeeStatus = z.infer<typeof CalendarAttendeeStatusSchema>
export type CalendarReminderType = z.infer<typeof CalendarReminderTypeSchema>
export type CalendarReminderTiming = z.infer<typeof CalendarReminderTimingSchema>
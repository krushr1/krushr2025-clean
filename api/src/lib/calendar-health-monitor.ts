/**
 * Calendar Health Monitor Utility
 * Provides continuous monitoring and alerting for calendar system health
 */

import { PrismaClient } from '@prisma/client'
import { CalendarService } from '../services/calendar.service'
import { CreateCalendarEventSchema } from './calendar-schemas'

export interface HealthCheckOptions {
  includePerformance?: boolean
  includeSampleData?: boolean
  checkDataIntegrity?: boolean
  workspaceId?: string
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  checks: Record<string, CheckResult>
  performance: Record<string, number>
  summary: {
    totalChecks: number
    passedChecks: number
    failedChecks: number
    warnings: string[]
  }
}

export interface CheckResult {
  status: 'pass' | 'fail' | 'warn'
  message: string
  details?: any
  duration_ms?: number
}

export class CalendarHealthMonitor {
  private prisma: PrismaClient
  private monitoringInterval?: NodeJS.Timeout
  private alertCallbacks: Array<(result: HealthCheckResult) => void> = []

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  /**
   * Run a comprehensive health check
   */
  async runHealthCheck(userId: string, options: HealthCheckOptions = {}): Promise<HealthCheckResult> {
    const startTime = Date.now()
    const healthCheck: HealthCheckResult = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      checks: {},
      performance: {},
      summary: {
        totalChecks: 0,
        passedChecks: 0,
        failedChecks: 0,
        warnings: []
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
      await this.checkDatabaseConnectivity(addCheck)

      // 2. Calendar Models Health Check
      await this.checkCalendarModels(addCheck)

      // 3. Calendar Service Functionality Check
      await this.checkCalendarService(addCheck)

      // 4. Schema Validation Check
      await this.checkSchemaValidation(addCheck)

      // 5. Data Integrity Checks (if enabled)
      if (options.checkDataIntegrity) {
        await this.checkDataIntegrity(addCheck)
      }

      // 6. Workspace-specific checks (if workspace provided)
      if (options.workspaceId) {
        await this.checkWorkspaceHealth(options.workspaceId, userId, addCheck)
      }

      // 7. Performance Metrics (if enabled)
      if (options.includePerformance) {
        await this.checkPerformanceMetrics(addCheck, healthCheck)
      }

      // 8. Sample Data Validation (if enabled)
      if (options.includeSampleData) {
        await this.checkSampleData(addCheck, healthCheck)
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
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring(intervalMs: number = 300000, userId: string, options: HealthCheckOptions = {}): void {
    if (this.monitoringInterval) {
      this.stopMonitoring()
    }

    this.monitoringInterval = setInterval(async () => {
      try {
        const result = await this.runHealthCheck(userId, options)
        this.alertCallbacks.forEach(callback => callback(result))
        
        // Log significant health changes
        if (result.status !== 'healthy') {
          console.warn(`[CalendarHealthMonitor] Health status: ${result.status}`, {
            failedChecks: result.summary.failedChecks,
            warnings: result.summary.warnings.length,
            timestamp: result.timestamp
          })
        }
      } catch (error) {
        console.error('[CalendarHealthMonitor] Monitoring error:', error)
      }
    }, intervalMs)

    console.log(`[CalendarHealthMonitor] Started monitoring with ${intervalMs}ms interval`)
  }

  /**
   * Stop continuous monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = undefined
      console.log('[CalendarHealthMonitor] Stopped monitoring')
    }
  }

  /**
   * Add alert callback for health status changes
   */
  onHealthChange(callback: (result: HealthCheckResult) => void): void {
    this.alertCallbacks.push(callback)
  }

  /**
   * Generate health report summary
   */
  generateHealthReport(results: HealthCheckResult[]): string {
    if (results.length === 0) {
      return 'No health check results available'
    }

    const latest = results[results.length - 1]
    if (!latest) {
      return 'No valid health check results available'
    }

    const unhealthyCount = results.filter(r => r.status === 'unhealthy').length
    const degradedCount = results.filter(r => r.status === 'degraded').length
    const healthyCount = results.filter(r => r.status === 'healthy').length

    const avgDuration = results.reduce((sum, r) => sum + (r.performance.total_health_check_ms || 0), 0) / results.length

    return `
Calendar Health Report
=====================
Period: ${results[0]?.timestamp || 'Unknown'} to ${latest.timestamp}
Total Checks: ${results.length}

Status Distribution:
- Healthy: ${healthyCount} (${((healthyCount / results.length) * 100).toFixed(1)}%)
- Degraded: ${degradedCount} (${((degradedCount / results.length) * 100).toFixed(1)}%)
- Unhealthy: ${unhealthyCount} (${((unhealthyCount / results.length) * 100).toFixed(1)}%)

Current Status: ${latest.status.toUpperCase()}
Latest Check Duration: ${latest.performance.total_health_check_ms || 0}ms
Average Check Duration: ${avgDuration.toFixed(1)}ms

Recent Issues:
${latest.summary.warnings.length > 0 ? latest.summary.warnings.join('\n') : 'No recent issues'}
`
  }

  // Private helper methods for individual health checks

  private async checkDatabaseConnectivity(addCheck: Function): Promise<void> {
    const dbStartTime = Date.now()
    try {
      await this.prisma.$queryRaw`SELECT 1`
      const dbDuration = Date.now() - dbStartTime
      addCheck('database_connectivity', 'pass', 'Database connection successful', null, dbDuration)
    } catch (error) {
      const dbDuration = Date.now() - dbStartTime
      addCheck('database_connectivity', 'fail', `Database connection failed: ${error}`, { error: String(error) }, dbDuration)
    }
  }

  private async checkCalendarModels(addCheck: Function): Promise<void> {
    const modelsStartTime = Date.now()
    try {
      const [eventCount, attendeeCount, reminderCount] = await Promise.all([
        this.prisma.calendarEvent.count(),
        this.prisma.calendarAttendee.count(),
        this.prisma.calendarReminder.count()
      ])

      const modelsCheckDuration = Date.now() - modelsStartTime
      addCheck('calendar_models', 'pass', 'All calendar models accessible', {
        eventCount,
        attendeeCount,
        reminderCount
      }, modelsCheckDuration)
    } catch (error) {
      const modelsCheckDuration = Date.now() - modelsStartTime
      addCheck('calendar_models', 'fail', `Calendar models check failed: ${error}`, { error: String(error) }, modelsCheckDuration)
    }
  }

  private async checkCalendarService(addCheck: Function): Promise<void> {
    const serviceStartTime = Date.now()
    try {
      new CalendarService(this.prisma)
      const serviceCheckDuration = Date.now() - serviceStartTime
      addCheck('calendar_service', 'pass', 'CalendarService instantiation successful', null, serviceCheckDuration)
    } catch (error) {
      const serviceCheckDuration = Date.now() - serviceStartTime
      addCheck('calendar_service', 'fail', `CalendarService instantiation failed: ${error}`, { error: String(error) }, serviceCheckDuration)
    }
  }

  private async checkSchemaValidation(addCheck: Function): Promise<void> {
    const schemaStartTime = Date.now()
    try {
      const sampleCreateInput = {
        title: 'Health Check Event',
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000),
        workspaceId: 'ckxxxxxxxxxxxxxxxxxx',
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
    } catch (error) {
      const schemaCheckDuration = Date.now() - schemaStartTime
      addCheck('schema_validation', 'fail', `Schema validation failed: ${error}`, { error: String(error) }, schemaCheckDuration)
    }
  }

  private async checkDataIntegrity(addCheck: Function): Promise<void> {
    const integrityStartTime = Date.now()
    try {
      // Check for orphaned attendees using raw SQL
      const orphanedAttendeesResult = await this.prisma.$queryRaw<Array<{ count: number }>>`
        SELECT COUNT(*) as count 
        FROM calendar_attendees ca
        WHERE NOT EXISTS (SELECT 1 FROM calendar_events ce WHERE ce.id = ca.event_id)
      `
      const orphanedAttendees = Number(orphanedAttendeesResult[0]?.count || 0)

      // Check for orphaned reminders using raw SQL
      const orphanedRemindersResult = await this.prisma.$queryRaw<Array<{ count: number }>>`
        SELECT COUNT(*) as count 
        FROM calendar_reminders cr
        WHERE NOT EXISTS (SELECT 1 FROM calendar_events ce WHERE ce.id = cr.event_id)
      `
      const orphanedReminders = Number(orphanedRemindersResult[0]?.count || 0)

      // Check for events without workspace using raw SQL
      const eventsWithoutWorkspaceResult = await this.prisma.$queryRaw<Array<{ count: number }>>`
        SELECT COUNT(*) as count 
        FROM calendar_events ce
        WHERE NOT EXISTS (SELECT 1 FROM workspaces w WHERE w.id = ce.workspace_id)
      `
      const eventsWithoutWorkspace = Number(eventsWithoutWorkspaceResult[0]?.count || 0)

      // Check for events with invalid date ranges using raw SQL
      const invalidDateEventsResult = await this.prisma.$queryRaw<Array<{ count: number }>>`
        SELECT COUNT(*) as count 
        FROM calendar_events 
        WHERE end_time <= start_time
      `
      const invalidDateEvents = Number(invalidDateEventsResult[0]?.count || 0)

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
      }
    } catch (error) {
      const integrityCheckDuration = Date.now() - integrityStartTime
      addCheck('data_integrity', 'fail', `Data integrity check failed: ${error}`, { error: String(error) }, integrityCheckDuration)
    }
  }

  private async checkWorkspaceHealth(workspaceId: string, userId: string, addCheck: Function): Promise<void> {
    const workspaceStartTime = Date.now()
    try {
      const workspaceMember = await this.prisma.workspaceMember.findFirst({
        where: { workspaceId, userId }
      })

      if (!workspaceMember) {
        addCheck('workspace_access', 'fail', 'User does not have access to specified workspace', {
          workspaceId,
          userId
        })
      } else {
        const workspaceEvents = await this.prisma.calendarEvent.count({
          where: { workspaceId }
        })

        const workspaceCheckDuration = Date.now() - workspaceStartTime
        addCheck('workspace_calendar', 'pass', `Workspace calendar accessible (${workspaceEvents} events)`, {
          workspaceId,
          eventCount: workspaceEvents
        }, workspaceCheckDuration)
      }
    } catch (error) {
      const workspaceCheckDuration = Date.now() - workspaceStartTime
      addCheck('workspace_calendar', 'fail', `Workspace calendar check failed: ${error}`, { error: String(error) }, workspaceCheckDuration)
    }
  }

  private async checkPerformanceMetrics(addCheck: Function, healthCheck: HealthCheckResult): Promise<void> {
    const perfStartTime = Date.now()
    try {
      // Test query performance with recent events
      const recentEventsStart = Date.now()
      const recentEvents = await this.prisma.calendarEvent.findMany({
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
      const eventTypes = await this.prisma.calendarEvent.groupBy({
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
    }
  }

  private async checkSampleData(addCheck: Function, healthCheck: HealthCheckResult): Promise<void> {
    const sampleDataStartTime = Date.now()
    try {
      const sampleEvent = await this.prisma.calendarEvent.findFirst({
        include: {
          attendees: true,
          reminders: true,
          workspace: {
            select: { id: true, name: true }
          },
          createdBy: {
            select: { id: true, email: true, name: true }
          }
        }
      })

      const sampleDataCheckDuration = Date.now() - sampleDataStartTime

      if (sampleEvent) {
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
    }
  }
}

export default CalendarHealthMonitor
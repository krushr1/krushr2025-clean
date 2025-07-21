/**
 * Calendar Health Check Usage Examples
 * This file demonstrates how to use the calendar health check API
 */

import { PrismaClient } from '@prisma/client'
import { CalendarHealthMonitor } from '../lib/calendar-health-monitor'

// Mock user ID for examples (replace with actual user ID in real usage)
const EXAMPLE_USER_ID = 'user_ckxxxxxxxxxxxxxxxxxx'
const EXAMPLE_WORKSPACE_ID = 'workspace_ckxxxxxxxxxxxxxxxxxx'

const prisma = new PrismaClient()

/**
 * Example 1: Basic Health Check
 * Simple health check without additional options
 */
export async function basicHealthCheckExample() {
  console.log('🏥 Running Basic Health Check...')
  
  const monitor = new CalendarHealthMonitor(prisma)
  
  const result = await monitor.runHealthCheck(EXAMPLE_USER_ID, {
    includePerformance: false,
    includeSampleData: false,
    checkDataIntegrity: false
  })
  
  console.log(`Status: ${result.status}`)
  console.log(`Duration: ${result.performance.total_health_check_ms}ms`)
  console.log(`Checks Passed: ${result.summary.passedChecks}/${result.summary.totalChecks}`)
  
  return result
}

/**
 * Example 2: Comprehensive Health Check
 * Full health check with all options enabled
 */
export async function comprehensiveHealthCheckExample() {
  console.log('🔍 Running Comprehensive Health Check...')
  
  const monitor = new CalendarHealthMonitor(prisma)
  
  const result = await monitor.runHealthCheck(EXAMPLE_USER_ID, {
    includePerformance: true,
    includeSampleData: true,
    checkDataIntegrity: true
  })
  
  console.log(`Status: ${result.status}`)
  console.log(`Total Duration: ${result.performance.total_health_check_ms}ms`)
  console.log(`Database Response: ${result.performance.database_response_ms}ms`)
  console.log(`Recent Events Query: ${result.performance.recent_events_query_ms}ms`)
  
  // Check for specific issues
  if (result.summary.failedChecks > 0) {
    console.log('❌ Failed checks found:')
    Object.entries(result.checks).forEach(([name, check]) => {
      if (check.status === 'fail') {
        console.log(`  - ${name}: ${check.message}`)
      }
    })
  }
  
  if (result.summary.warnings.length > 0) {
    console.log('⚠️ Warnings:')
    result.summary.warnings.forEach(warning => {
      console.log(`  - ${warning}`)
    })
  }
  
  return result
}

/**
 * Example 3: Workspace-Specific Health Check
 * Health check for a specific workspace
 */
export async function workspaceHealthCheckExample() {
  console.log('🏢 Running Workspace-Specific Health Check...')
  
  const monitor = new CalendarHealthMonitor(prisma)
  
  const result = await monitor.runHealthCheck(EXAMPLE_USER_ID, {
    workspaceId: EXAMPLE_WORKSPACE_ID,
    includePerformance: true,
    checkDataIntegrity: true
  })
  
  console.log(`Workspace Status: ${result.status}`)
  
  const workspaceCheck = result.checks.workspace_calendar
  if (workspaceCheck) {
    console.log(`Workspace Access: ${workspaceCheck.status}`)
    if (workspaceCheck.details) {
      console.log(`Events in Workspace: ${workspaceCheck.details.eventCount}`)
    }
  }
  
  return result
}

/**
 * Example 4: Continuous Monitoring
 * Set up automated health monitoring with alerts
 */
export async function continuousMonitoringExample() {
  console.log('🔄 Setting up Continuous Monitoring...')
  
  const monitor = new CalendarHealthMonitor(prisma)
  
  // Set up alert handler
  monitor.onHealthChange((result) => {
    console.log(`[${new Date().toISOString()}] Health Status: ${result.status}`)
    
    if (result.status === 'unhealthy') {
      console.log('🚨 CRITICAL: Calendar system is unhealthy!')
      // Send alert to monitoring system
      sendAlert('Calendar system unhealthy', result)
    } else if (result.status === 'degraded') {
      console.log('⚠️ WARNING: Calendar system performance degraded')
      // Send warning to monitoring system
      sendWarning('Calendar system degraded', result)
    }
  })
  
  // Start monitoring every 5 minutes
  monitor.startMonitoring(300000, EXAMPLE_USER_ID, {
    includePerformance: true,
    checkDataIntegrity: true
  })
  
  console.log('✅ Monitoring started (5-minute intervals)')
  
  // Return the monitor instance so it can be stopped later
  return monitor
}

/**
 * Example 5: Health Report Generation
 * Collect health check results over time and generate reports
 */
export async function healthReportExample() {
  console.log('📊 Generating Health Report...')
  
  const monitor = new CalendarHealthMonitor(prisma)
  const healthResults = []
  
  // Simulate collecting health checks over time
  for (let i = 0; i < 5; i++) {
    const result = await monitor.runHealthCheck(EXAMPLE_USER_ID, {
      includePerformance: true,
      checkDataIntegrity: true
    })
    
    healthResults.push(result)
    
    // Wait 1 second between checks (in real usage, this would be longer intervals)
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  // Generate report
  const report = monitor.generateHealthReport(healthResults)
  console.log(report)
  
  return healthResults
}

/**
 * Example 6: Performance Monitoring
 * Focus on performance metrics and optimization
 */
export async function performanceMonitoringExample() {
  console.log('⚡ Performance Monitoring Example...')
  
  const monitor = new CalendarHealthMonitor(prisma)
  
  const result = await monitor.runHealthCheck(EXAMPLE_USER_ID, {
    includePerformance: true,
    includeSampleData: false,
    checkDataIntegrity: false
  })
  
  console.log('Performance Metrics:')
  console.log(`- Database Response: ${result.performance.database_response_ms}ms`)
  console.log(`- Recent Events Query: ${result.performance.recent_events_query_ms}ms`)
  console.log(`- Aggregation Query: ${result.performance.aggregation_query_ms}ms`)
  console.log(`- Total Health Check: ${result.performance.total_health_check_ms}ms`)
  
  // Check for performance issues
  const performanceChecks = Object.entries(result.checks).filter(([name]) => 
    name.startsWith('performance_')
  )
  
  performanceChecks.forEach(([name, check]) => {
    if (check.status === 'warn') {
      console.log(`⚠️ Performance Issue: ${name} - ${check.message}`)
    }
  })
  
  return result
}

/**
 * Mock alert functions (replace with real alerting system)
 */
function sendAlert(message: string, details: any) {
  console.log(`🚨 ALERT: ${message}`)
  console.log('Details:', JSON.stringify(details.summary, null, 2))
}

function sendWarning(message: string, details: any) {
  console.log(`⚠️ WARNING: ${message}`)
  console.log('Warnings:', details.summary.warnings)
}

/**
 * Example 7: Integration with Express.js Health Endpoint
 * Create a health endpoint for load balancers
 */
export function createHealthEndpoint() {
  return async (req: any, res: any) => {
    const monitor = new CalendarHealthMonitor(prisma)
    
    try {
      // Quick health check for load balancer
      const result = await monitor.runHealthCheck(EXAMPLE_USER_ID, {
        includePerformance: false,
        includeSampleData: false,
        checkDataIntegrity: false
      })
      
      if (result.status === 'healthy') {
        res.status(200).json({
          status: 'ok',
          timestamp: result.timestamp,
          duration: result.performance.total_health_check_ms
        })
      } else {
        res.status(503).json({
          status: 'error',
          message: `Calendar system is ${result.status}`,
          details: result.summary
        })
      }
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Health check failed',
        error: String(error)
      })
    }
  }
}

/**
 * Example 8: tRPC Integration Example
 * Shows how the health check integrates with tRPC
 */
export const exampleTrpcUsage = {
  // This would be called from a tRPC client
  async checkCalendarHealth() {
    // Example tRPC call (pseudo-code)
    const result = {
      // This simulates: await trpc.calendar.health.query({ ... })
      status: 'healthy',
      timestamp: new Date().toISOString(),
      summary: {
        totalChecks: 8,
        passedChecks: 8,
        failedChecks: 0,
        warnings: []
      }
    }
    
    return result
  }
}

// Export all examples for easy usage
export const CalendarHealthExamples = {
  basic: basicHealthCheckExample,
  comprehensive: comprehensiveHealthCheckExample,
  workspace: workspaceHealthCheckExample,
  monitoring: continuousMonitoringExample,
  report: healthReportExample,
  performance: performanceMonitoringExample,
  healthEndpoint: createHealthEndpoint,
  trpcUsage: exampleTrpcUsage
}

// Usage example:
// import { CalendarHealthExamples } from './calendar-health-usage'
// const result = await CalendarHealthExamples.basic()
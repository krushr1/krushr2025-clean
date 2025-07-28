/**
 * AI Context Enhancement System
 * Deep database schema understanding and intelligent context injection
 * Implements the KRUSHR AI System Instructions perfectly
 */

import { prisma } from './prisma'
import { intelligentLLMRouter, TaskContext } from './ai-llm-router'

export interface WorkspaceIntelligence {
  overview: {
    workspaceId: string
    name: string
    memberCount: number
    activeProjects: number
    totalTasks: number
    completionRate: number
  }
  recentActivity: ActivityInsight[]
  teamDynamics: TeamInsight[]
  projectStatus: ProjectInsight[]
  taskIntelligence: TaskIntelligence
  riskAssessment: RiskAssessment
  recommendations: string[]
}

export interface ActivityInsight {
  type: string
  description: string
  timestamp: Date
  userId: string
  userName: string
  entityType?: string
  entityName?: string
  priority?: string
}

export interface TeamInsight {
  teamId: string
  teamName: string
  memberCount: number
  currentWorkload: number
  availableCapacity: number
  skillAreas: string[]
  recentCollaboration: number
}

export interface ProjectInsight {
  projectId: string
  projectName: string
  status: string
  progress: number
  tasksCount: {
    total: number
    completed: number
    inProgress: number
    blocked: number
  }
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  estimatedCompletion?: Date
  criticalPath: string[]
}

export interface TaskIntelligence {
  totalTasks: number
  byStatus: Record<string, number>
  byPriority: Record<string, number>
  averageCompletionTime: number
  blockedTasks: Array<{
    id: string
    title: string
    blockedReason: string
    assigneeName: string
  }>
  upcomingDeadlines: Array<{
    id: string
    title: string
    dueDate: Date
    assigneeName: string
    daysRemaining: number
  }>
  overdueTasks: Array<{
    id: string
    title: string
    dueDate: Date
    assigneeName: string
    daysOverdue: number
  }>
}

export interface RiskAssessment {
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH'
  riskFactors: Array<{
    type: 'DEADLINE' | 'CAPACITY' | 'DEPENDENCY' | 'QUALITY'
    severity: number
    description: string
    affectedItems: string[]
    mitigation: string
  }>
  predictions: Array<{
    scenario: string
    probability: number
    impact: string
    timeframe: string
  }>
}

export class AIContextEnhancer {
  /**
   * Generate comprehensive workspace intelligence for AI context
   */
  async generateWorkspaceIntelligence(workspaceId: string): Promise<WorkspaceIntelligence> {
    console.log(`🧠 [AI Context] Generating intelligence for workspace: ${workspaceId}`)

    const [
      workspace,
      recentActivity,
      teams,
      projects,
      tasks,
      upcomingDeadlines,
      blockedTasks
    ] = await Promise.all([
      this.getWorkspaceOverview(workspaceId),
      this.getRecentActivity(workspaceId),
      this.getTeamInsights(workspaceId),
      this.getProjectInsights(workspaceId),
      this.getTaskIntelligence(workspaceId),
      this.getUpcomingDeadlines(workspaceId),
      this.getBlockedTasks(workspaceId)
    ])

    const riskAssessment = await this.generateRiskAssessment(workspaceId, {
      overview: workspace,
      projects,
      tasks,
      teams,
      upcomingDeadlines,
      blockedTasks
    })

    const recommendations = await this.generateRecommendations({
      workspace,
      recentActivity,
      teams,
      teamDynamics: teams,
      projects,
      tasks,
      riskAssessment
    })

    return {
      overview: workspace,
      recentActivity,
      teamDynamics: teams,
      projectStatus: projects,
      taskIntelligence: tasks,
      riskAssessment,
      recommendations
    }
  }

  private async getWorkspaceOverview(workspaceId: string) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: true,
        projects: { where: { status: 'ACTIVE' } },
        _count: {
          select: { projects: true }
        }
      }
    })

    if (!workspace) throw new Error('Workspace not found')

    const totalTasks = await prisma.task.count({
      where: { project: { workspaceId } }
    })

    const completedTasks = await prisma.task.count({
      where: { 
        project: { workspaceId },
        status: 'DONE'
      }
    })

    return {
      workspaceId,
      name: workspace.name,
      memberCount: workspace.members.length,
      activeProjects: workspace.projects.length,
      totalTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    }
  }

  private async getRecentActivity(workspaceId: string, limit = 20): Promise<ActivityInsight[]> {
    const activities = await prisma.activity.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: { select: { name: true } }
      }
    })

    return activities.map(activity => ({
      type: activity.type,
      description: activity.action,
      timestamp: activity.createdAt,
      userId: activity.userId,
      userName: activity.user.name,
      entityType: activity.entityType || undefined,
      entityName: activity.entityName || undefined,
      priority: activity.priority || undefined
    }))
  }

  private async getTeamInsights(workspaceId: string): Promise<TeamInsight[]> {
    const teams = await prisma.team.findMany({
      where: { workspaceId },
      include: {
        members: {
          include: {
            user: {
              include: {
                tasks: {
                  where: {
                    status: { in: ['TODO', 'IN_PROGRESS'] }
                  }
                }
              }
            }
          }
        },
        projects: {
          include: {
            tasks: {
              where: {
                status: { not: 'DONE' }
              }
            }
          }
        }
      }
    })

    return teams.map(team => {
      const totalWorkload = team.members.reduce((sum, member) => 
        sum + member.user.tasks.length, 0
      )

      // Estimate capacity (simplified - could be enhanced with more sophisticated logic)
      const estimatedCapacityPerPerson = 5 // tasks per person
      const totalCapacity = team.members.length * estimatedCapacityPerPerson
      const availableCapacity = Math.max(0, totalCapacity - totalWorkload)

      return {
        teamId: team.id,
        teamName: team.name,
        memberCount: team.members.length,
        currentWorkload: totalWorkload,
        availableCapacity,
        skillAreas: [], // Could be enhanced with skill tracking
        recentCollaboration: 0 // Could be calculated from chat/comment activity
      }
    })
  }

  private async getProjectInsights(workspaceId: string): Promise<ProjectInsight[]> {
    const projects = await prisma.project.findMany({
      where: { workspaceId },
      include: {
        tasks: {
          include: {
            dependencies: true,
            dependents: true
          }
        }
      }
    })

    return projects.map(project => {
      const tasks = project.tasks
      const totalTasks = tasks.length
      const completedTasks = tasks.filter(t => t.status === 'DONE').length
      const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length
      const blockedTasks = tasks.filter(t => t.isBlocked).length

      const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

      // Risk assessment based on blocked tasks and overdue items
      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'
      if (blockedTasks > totalTasks * 0.3) riskLevel = 'HIGH'
      else if (blockedTasks > totalTasks * 0.1) riskLevel = 'MEDIUM'

      // Critical path identification (simplified)
      const criticalPath = this.identifyCriticalPath(tasks)

      return {
        projectId: project.id,
        projectName: project.name,
        status: project.status,
        progress,
        tasksCount: {
          total: totalTasks,
          completed: completedTasks,
          inProgress: inProgressTasks,
          blocked: blockedTasks
        },
        riskLevel,
        estimatedCompletion: this.estimateProjectCompletion(tasks),
        criticalPath
      }
    })
  }

  private async getTaskIntelligence(workspaceId: string): Promise<TaskIntelligence> {
    const tasks = await prisma.task.findMany({
      where: { project: { workspaceId } },
      include: {
        assignee: { select: { name: true } }
      }
    })

    const totalTasks = tasks.length
    
    // Group by status
    const byStatus = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Group by priority
    const byPriority = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calculate average completion time
    const completedTasks = tasks.filter(t => t.completedAt && t.createdAt)
    const averageCompletionTime = completedTasks.length > 0 
      ? completedTasks.reduce((sum, task) => {
          const duration = task.completedAt!.getTime() - task.createdAt.getTime()
          return sum + duration
        }, 0) / completedTasks.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0

    // Blocked tasks
    const blockedTasks = tasks
      .filter(t => t.isBlocked)
      .map(task => ({
        id: task.id,
        title: task.title,
        blockedReason: task.blockedReason || 'Unknown',
        assigneeName: task.assignee?.name || 'Unassigned'
      }))

    // Upcoming deadlines
    const now = new Date()
    const upcomingDeadlines = tasks
      .filter(t => t.dueDate && t.dueDate > now && t.status !== 'DONE')
      .sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime())
      .slice(0, 10)
      .map(task => ({
        id: task.id,
        title: task.title,
        dueDate: task.dueDate!,
        assigneeName: task.assignee?.name || 'Unassigned',
        daysRemaining: Math.ceil((task.dueDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      }))

    // Overdue tasks
    const overdueTasks = tasks
      .filter(t => t.dueDate && t.dueDate < now && t.status !== 'DONE')
      .map(task => ({
        id: task.id,
        title: task.title,
        dueDate: task.dueDate!,
        assigneeName: task.assignee?.name || 'Unassigned',
        daysOverdue: Math.ceil((now.getTime() - task.dueDate!.getTime()) / (1000 * 60 * 60 * 24))
      }))

    return {
      totalTasks,
      byStatus,
      byPriority,
      averageCompletionTime,
      blockedTasks,
      upcomingDeadlines,
      overdueTasks
    }
  }

  private async getUpcomingDeadlines(workspaceId: string) {
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    return await prisma.task.findMany({
      where: {
        project: { workspaceId },
        dueDate: {
          gte: now,
          lte: nextWeek
        },
        status: { not: 'DONE' }
      },
      include: {
        assignee: { select: { name: true } }
      },
      orderBy: { dueDate: 'asc' }
    })
  }

  private async getBlockedTasks(workspaceId: string) {
    return await prisma.task.findMany({
      where: {
        project: { workspaceId },
        isBlocked: true
      },
      include: {
        assignee: { select: { name: true } }
      }
    })
  }

  private async generateRiskAssessment(
    workspaceId: string, 
    data: any
  ): Promise<RiskAssessment> {
    const riskFactors = []
    let overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'

    // Deadline risk assessment
    const upcomingCount = data.upcomingDeadlines?.length || 0
    const overdueCount = data.tasks?.overdueTasks?.length || 0
    
    if (overdueCount > 5 || upcomingCount > 10) {
      riskFactors.push({
        type: 'DEADLINE' as const,
        severity: Math.min((overdueCount + upcomingCount) / 10, 1),
        description: `${overdueCount} overdue tasks, ${upcomingCount} upcoming deadlines`,
        affectedItems: [...(data.tasks?.overdueTasks?.map((t: any) => t.title) || [])],
        mitigation: 'Prioritize overdue tasks and redistribute workload'
      })
      overallRisk = 'HIGH'
    }

    // Capacity risk assessment
    const totalWorkload = data.teams?.reduce((sum: number, team: any) => sum + team.currentWorkload, 0) || 0
    const totalCapacity = data.teams?.reduce((sum: number, team: any) => sum + team.availableCapacity + team.currentWorkload, 0) || 0
    
    if (totalCapacity > 0 && totalWorkload / totalCapacity > 0.8) {
      riskFactors.push({
        type: 'CAPACITY' as const,
        severity: totalWorkload / totalCapacity,
        description: `Team capacity at ${Math.round(totalWorkload / totalCapacity * 100)}%`,
        affectedItems: data.teams.filter((t: any) => t.availableCapacity < 2).map((t: any) => t.teamName),
        mitigation: 'Consider hiring additional team members or reducing scope'
      })
      if (overallRisk === 'LOW') overallRisk = 'MEDIUM'
    }

    // Dependency risk assessment
    const blockedCount = data.tasks.blockedTasks.length
    if (blockedCount > 3) {
      riskFactors.push({
        type: 'DEPENDENCY' as const,
        severity: Math.min(blockedCount / 10, 1),
        description: `${blockedCount} blocked tasks affecting project flow`,
        affectedItems: data.tasks.blockedTasks.map((t: any) => t.title),
        mitigation: 'Resolve blocking dependencies and establish parallel workflows'
      })
      if (overallRisk === 'LOW') overallRisk = 'MEDIUM'
    }

    return {
      overallRisk,
      riskFactors,
      predictions: [
        {
          scenario: 'Current trajectory',
          probability: 0.7,
          impact: `${Math.round(data.overview?.completionRate || 0)}% completion rate maintained`,
          timeframe: 'Next 2 weeks'
        },
        {
          scenario: 'Optimistic case',
          probability: 0.3,
          impact: 'All deadlines met with quality delivery',
          timeframe: 'Next month'
        }
      ]
    }
  }

  private async generateRecommendations(data: any): Promise<string[]> {
    const recommendations = []

    // Based on task status distribution
    if (data.tasks.byStatus['TODO'] > data.tasks.byStatus['IN_PROGRESS'] * 2) {
      recommendations.push('Consider breaking down large tasks and starting more work in parallel')
    }

    // Based on blocked tasks
    if (data.tasks?.blockedTasks?.length > 0) {
      recommendations.push(`Address ${data.tasks.blockedTasks.length} blocked tasks to improve flow`)
    }

    // Based on team capacity
    const overloadedTeams = data.teamDynamics?.filter((t: any) => t.availableCapacity < 1) || []
    if (overloadedTeams.length > 0) {
      recommendations.push(`Redistribute workload from overloaded teams: ${overloadedTeams.map((t: any) => t.teamName).join(', ')}`)
    }

    // Based on overdue tasks
    if (data.tasks?.overdueTasks?.length > 0) {
      recommendations.push(`Urgent: Address ${data.tasks.overdueTasks.length} overdue tasks`)
    }

    // Based on completion rate
    if (data.overview?.completionRate < 50) {
      recommendations.push('Focus on completing existing tasks before adding new ones')
    }

    return recommendations
  }

  private identifyCriticalPath(tasks: any[]): string[] {
    // Simplified critical path identification
    // In a full implementation, this would use proper CPM algorithm
    const dependentTasks = tasks.filter(t => t.dependencies.length > 0)
    return dependentTasks.slice(0, 5).map(t => t.title)
  }

  private estimateProjectCompletion(tasks: any[]): Date | undefined {
    const incompleteTasks = tasks.filter(t => t.status !== 'DONE')
    if (incompleteTasks.length === 0) return new Date()

    // Simple estimation based on average completion time
    const avgDaysPerTask = 3 // This should be calculated from historical data
    const estimatedDays = incompleteTasks.length * avgDaysPerTask

    const completion = new Date()
    completion.setDate(completion.getDate() + estimatedDays)
    return completion
  }

  /**
   * Inject intelligent context into user prompts for AI processing
   */
  async enhancePromptWithContext(
    workspaceId: string,
    userPrompt: string,
    conversationHistory?: Array<{role: string, content: string}>
  ): Promise<string> {
    const intelligence = await this.generateWorkspaceIntelligence(workspaceId)
    
    // Analyze prompt to determine what context is most relevant
    const contextRelevance = this.analyzePromptForContextNeeds(userPrompt)
    
    let enhancedPrompt = userPrompt + '\n\n--- WORKSPACE CONTEXT ---\n'
    
    // Always include basic workspace overview
    enhancedPrompt += `Workspace: ${intelligence.overview.name}\n`
    enhancedPrompt += `Team: ${intelligence.overview.memberCount} members, ${intelligence.overview.activeProjects} active projects\n`
    enhancedPrompt += `Tasks: ${intelligence.overview.totalTasks} total (${intelligence.overview.completionRate.toFixed(1)}% completion rate)\n\n`
    
    // Include relevant context based on prompt analysis
    if (contextRelevance.needsTaskInfo) {
      enhancedPrompt += '**Current Task Status:**\n'
      Object.entries(intelligence.taskIntelligence.byStatus).forEach(([status, count]) => {
        enhancedPrompt += `- ${status}: ${count} tasks\n`
      })
      
      if (intelligence.taskIntelligence.blockedTasks.length > 0) {
        enhancedPrompt += `\n**Blocked Tasks:** ${intelligence.taskIntelligence.blockedTasks.map(t => t.title).join(', ')}\n`
      }
      
      if (intelligence.taskIntelligence.upcomingDeadlines.length > 0) {
        enhancedPrompt += `\n**Upcoming Deadlines:**\n`
        intelligence.taskIntelligence.upcomingDeadlines.slice(0, 5).forEach(task => {
          enhancedPrompt += `- ${task.title} (${task.daysRemaining} days, assigned to ${task.assigneeName})\n`
        })
      }
    }
    
    if (contextRelevance.needsTeamInfo) {
      enhancedPrompt += '\n**Team Capacity:**\n'
      intelligence.teamDynamics.forEach(team => {
        enhancedPrompt += `- ${team.teamName}: ${team.currentWorkload} active tasks, ${team.availableCapacity} capacity remaining\n`
      })
    }
    
    if (contextRelevance.needsProjectInfo) {
      enhancedPrompt += '\n**Project Status:**\n'
      intelligence.projectStatus.forEach(project => {
        enhancedPrompt += `- ${project.projectName}: ${project.progress.toFixed(1)}% complete, ${project.tasksCount.total} tasks (${project.riskLevel} risk)\n`
      })
    }
    
    if (contextRelevance.needsRecentActivity) {
      enhancedPrompt += '\n**Recent Activity:**\n'
      intelligence.recentActivity.slice(0, 5).forEach(activity => {
        enhancedPrompt += `- ${activity.description} (${activity.userName})\n`
      })
    }
    
    // Include risk assessment if relevant
    if (intelligence.riskAssessment.overallRisk !== 'LOW' || contextRelevance.needsRiskInfo) {
      enhancedPrompt += `\n**Risk Assessment:** ${intelligence.riskAssessment.overallRisk} risk\n`
      intelligence.riskAssessment.riskFactors.forEach(risk => {
        enhancedPrompt += `- ${risk.type}: ${risk.description}\n`
      })
    }
    
    // Include recommendations
    if (intelligence.recommendations.length > 0) {
      enhancedPrompt += '\n**AI Recommendations:**\n'
      intelligence.recommendations.forEach(rec => {
        enhancedPrompt += `- ${rec}\n`
      })
    }
    
    enhancedPrompt += '\n--- END CONTEXT ---\n\n'
    enhancedPrompt += 'Please provide a response that takes into account this workspace context and current situation.'
    
    return enhancedPrompt
  }

  private analyzePromptForContextNeeds(prompt: string): {
    needsTaskInfo: boolean
    needsTeamInfo: boolean
    needsProjectInfo: boolean
    needsRecentActivity: boolean
    needsRiskInfo: boolean
  } {
    const lower = prompt.toLowerCase()
    
    return {
      needsTaskInfo: /\b(task|todo|deadline|blocked|complete|status|priority)\b/.test(lower),
      needsTeamInfo: /\b(team|assign|capacity|workload|member|collaborate)\b/.test(lower),
      needsProjectInfo: /\b(project|milestone|progress|timeline|deliverable)\b/.test(lower),
      needsRecentActivity: /\b(recent|activity|what.*happened|update|progress|latest)\b/.test(lower),
      needsRiskInfo: /\b(risk|problem|issue|concern|bottleneck|delay)\b/.test(lower)
    }
  }
}

// Singleton instance
export const aiContextEnhancer = new AIContextEnhancer()

export type { WorkspaceIntelligence }
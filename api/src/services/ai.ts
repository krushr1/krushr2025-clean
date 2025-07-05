/**
 * AI Service Integration for Enhanced Task Features
 * Placeholder implementation for AI-powered task analysis
 */

export interface AITaskAnalysis {
  summary: string
  suggestedPriority: 'LOW' | 'MEDIUM' | 'HIGH'
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  estimatedComplexity: number // 1-10
  suggestedBusinessValue: number // 1-10
  recommendations: string[]
}

export interface AIServiceConfig {
  provider: 'openai' | 'anthropic' | 'cohere' | 'local'
  apiKey?: string
  model?: string
  maxTokens?: number
}

export class AIService {
  private config: AIServiceConfig

  constructor(config: AIServiceConfig) {
    this.config = config
  }

  /**
   * Analyze task content and generate AI insights
   */
  async analyzeTask(taskData: {
    title: string
    description?: string
    comments?: Array<{ content: string }>
    timeEntries?: Array<{ duration: number }>
    attachments?: Array<{ filename: string; mimeType: string }>
  }): Promise<AITaskAnalysis> {
    // Placeholder implementation - in production, this would call actual AI services
    const wordCount = (taskData.title + (taskData.description || '')).split(' ').length
    const commentCount = taskData.comments?.length || 0
    const totalTimeSpent = taskData.timeEntries?.reduce((sum, entry) => sum + entry.duration, 0) || 0
    const attachmentCount = taskData.attachments?.length || 0

    // Simple heuristic-based analysis (placeholder for real AI)
    let suggestedPriority: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'
    let complexity = 5
    let businessValue = 5

    // Heuristics based on task characteristics
    if (wordCount > 100 || commentCount > 5 || attachmentCount > 3) {
      complexity = Math.min(10, complexity + 2)
      suggestedPriority = 'HIGH'
    }

    if (totalTimeSpent > 120) { // More than 2 hours
      riskLevel = 'MEDIUM'
      businessValue = Math.min(10, businessValue + 1)
    }

    if (taskData.title.toLowerCase().includes('critical') || 
        taskData.title.toLowerCase().includes('urgent') ||
        taskData.title.toLowerCase().includes('bug')) {
      suggestedPriority = 'HIGH'
      riskLevel = 'HIGH'
    }

    const recommendations = this.generateRecommendations(taskData, {
      suggestedPriority,
      riskLevel,
      complexity,
      businessValue
    })

    return {
      summary: `This task appears to be ${suggestedPriority.toLowerCase()} priority with ${riskLevel.toLowerCase()} risk. Complexity estimated at ${complexity}/10.`,
      suggestedPriority,
      riskLevel,
      estimatedComplexity: complexity,
      suggestedBusinessValue: businessValue,
      recommendations
    }
  }

  /**
   * Generate task summary from activity data
   */
  async generateTaskSummary(taskData: {
    title: string
    description?: string
    comments: Array<{ content: string; createdAt: Date }>
    timeEntries: Array<{ duration: number; description?: string }>
    checklistItems: Array<{ text: string; completed: boolean }>
  }): Promise<string> {
    const totalTime = taskData.timeEntries.reduce((sum, entry) => sum + entry.duration, 0)
    const completedChecklist = taskData.checklistItems.filter(item => item.completed).length
    const totalChecklist = taskData.checklistItems.length

    return `Task Progress Summary:
• Total time tracked: ${Math.round(totalTime / 60 * 100) / 100} hours
• Checklist completion: ${totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0}%
• Discussion activity: ${taskData.comments.length} comments
• Recent activity: ${taskData.comments.length > 0 ? 'Active' : 'Quiet'}
• Completion trend: ${this.getCompletionTrend(taskData.timeEntries)}`
  }

  /**
   * Suggest optimal task scheduling
   */
  async suggestScheduling(tasks: Array<{
    id: string
    title: string
    priority: string
    estimatedHours?: number
    dependencies: Array<{ blockingTaskId: string }>
  }>): Promise<Array<{ taskId: string; suggestedOrder: number; reasoning: string }>> {
    // Simple topological sort with priority weighting
    const suggestions = tasks.map((task, index) => ({
      taskId: task.id,
      suggestedOrder: this.calculateTaskOrder(task, tasks),
      reasoning: this.generateSchedulingReasoning(task, tasks)
    }))

    return suggestions.sort((a, b) => a.suggestedOrder - b.suggestedOrder)
  }

  private generateRecommendations(
    taskData: any, 
    analysis: { suggestedPriority: string; riskLevel: string; complexity: number; businessValue: number }
  ): string[] {
    const recommendations = []

    if (analysis.complexity > 7) {
      recommendations.push('Consider breaking this task into smaller subtasks')
    }

    if (analysis.riskLevel === 'HIGH') {
      recommendations.push('Assign additional reviewers and set up regular check-ins')
    }

    if (analysis.suggestedPriority === 'HIGH' && analysis.businessValue < 6) {
      recommendations.push('Reassess business value - high priority tasks should have high impact')
    }

    if (taskData.timeEntries?.length > 5 && analysis.riskLevel === 'LOW') {
      recommendations.push('Task may be more complex than initially estimated')
    }

    if (!taskData.description || taskData.description.length < 50) {
      recommendations.push('Add more detailed description to improve clarity')
    }

    return recommendations
  }

  private getCompletionTrend(timeEntries: Array<{ duration: number }>): string {
    if (timeEntries.length < 2) return 'Insufficient data'
    
    const recent = timeEntries.slice(-3).reduce((sum, entry) => sum + entry.duration, 0)
    const earlier = timeEntries.slice(0, -3).reduce((sum, entry) => sum + entry.duration, 0)
    
    if (recent > earlier) return 'Accelerating'
    if (recent < earlier) return 'Slowing down'
    return 'Steady pace'
  }

  private calculateTaskOrder(
    task: any, 
    allTasks: Array<any>
  ): number {
    let order = 0
    
    // Priority weight
    const priorityWeight = task.priority === 'HIGH' ? 3 : task.priority === 'MEDIUM' ? 2 : 1
    order += priorityWeight * 10
    
    // Dependency penalty (tasks with dependencies should come later)
    order += task.dependencies.length * 5
    
    // Estimated hours weight (shorter tasks first)
    if (task.estimatedHours) {
      order += Math.min(task.estimatedHours, 10)
    }
    
    return order
  }

  private generateSchedulingReasoning(task: any, allTasks: Array<any>): string {
    const reasons = []
    
    if (task.priority === 'HIGH') {
      reasons.push('High priority')
    }
    
    if (task.dependencies.length === 0) {
      reasons.push('No blocking dependencies')
    } else {
      reasons.push(`Depends on ${task.dependencies.length} other task(s)`)
    }
    
    if (task.estimatedHours && task.estimatedHours < 2) {
      reasons.push('Quick win - short duration')
    }
    
    return reasons.join(', ')
  }
}

// Export a default instance
export const aiService = new AIService({
  provider: 'local', // Using local heuristics for demo
  maxTokens: 1000
})

// Export types for frontend use
export type { AITaskAnalysis, AIServiceConfig }
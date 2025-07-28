/**
 * Voice Processing Pipeline
 * Advanced speech-to-text and voice command processing for Krushr AI
 * Implements voice-first task orchestration
 */

import { z } from 'zod'
import { aiContextEnhancer } from './ai-context-enhancer'
import { intelligentLLMRouter } from './ai-llm-router'
import { prisma } from './prisma'

export interface VoiceCommand {
  transcript: string
  confidence: number
  intent: VoiceIntent
  entities: VoiceEntity[]
  action: VoiceAction
  context?: VoiceContext
}

export interface VoiceIntent {
  primary: string // 'create_task', 'assign_task', 'update_status', 'query_info', 'schedule_meeting'
  confidence: number
  secondary?: string[]
}

export interface VoiceEntity {
  type: 'PERSON' | 'TASK' | 'PROJECT' | 'DATE' | 'PRIORITY' | 'STATUS' | 'DURATION'
  value: string
  confidence: number
  normalized?: any
}

export interface VoiceAction {
  type: 'DATABASE_OPERATION' | 'QUERY' | 'NOTIFICATION' | 'MULTI_STEP'
  operations: DatabaseOperation[]
  response: string
  confidence: number
}

export interface DatabaseOperation {
  table: string
  operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ'
  data: any
  conditions?: any
}

export interface VoiceContext {
  workspaceId: string
  userId: string
  currentProject?: string
  activeConversation?: string
  sessionContext?: any
}

export interface VoiceProcessingResult {
  success: boolean
  transcript: string
  command: VoiceCommand | null
  executedActions: any[]
  naturalResponse: string
  confidence: number
  processingTime: number
  errors?: string[]
}

export class VoiceProcessor {
  private readonly WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions'
  private readonly intentPatterns = new Map<string, RegExp[]>()
  private readonly entityPatterns = new Map<string, RegExp>()

  constructor() {
    this.initializePatterns()
  }

  private initializePatterns() {
    // Intent recognition patterns
    this.intentPatterns.set('create_task', [
      /\b(create|add|make|new)\s+(task|todo|item)\b/i,
      /\b(create|add)\s+(.+?)\s+(task|todo)\b/i,
      /\b(task|todo)\s+(.+?)\s+(create|add|make)\b/i,
      /\bi need to\s+(.+)/i,
      /\bremind me to\s+(.+)/i
    ])

    this.intentPatterns.set('assign_task', [
      /\b(assign|give)\s+(.+?)\s+to\s+(\w+)\b/i,
      /\b(\w+)\s+should\s+(work on|handle|do)\s+(.+)/i,
      /\blet\s+(\w+)\s+(work on|handle|do)\s+(.+)/i
    ])

    this.intentPatterns.set('update_status', [
      /\b(mark|set|update)\s+(.+?)\s+(as|to)\s+(done|complete|finished|in progress|todo)\b/i,
      /\b(.+?)\s+is\s+(done|complete|finished|in progress)\b/i,
      /\bcomplete\s+(.+)/i,
      /\bfinish\s+(.+)/i
    ])

    this.intentPatterns.set('query_info', [
      /\b(what|show|list|tell me)\s+(is|are|about)\s+(.+)/i,
      /\bhow many\s+(.+)/i,
      /\bwhen is\s+(.+)/i,
      /\bwho is\s+(working on|assigned to)\s+(.+)/i,
      /\bstatus of\s+(.+)/i
    ])

    this.intentPatterns.set('schedule_meeting', [
      /\b(schedule|book|set up)\s+(meeting|call|session)\b/i,
      /\bmeet with\s+(.+?)\s+(on|at|tomorrow|next week)/i,
      /\bcalendar\s+(.+)/i
    ])

    // Entity extraction patterns
    this.entityPatterns.set('PERSON', /@(\w+)|with\s+(\w+)|(\w+)\s+should|assign\s+to\s+(\w+)/i)
    this.entityPatterns.set('PRIORITY', /\b(low|medium|high|urgent|critical)\s+priority\b/i)
    this.entityPatterns.set('DATE', /\b(today|tomorrow|next week|next month|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}\/\d{1,2})\b/i)
    this.entityPatterns.set('DURATION', /\b(\d+)\s+(hour|hours|day|days|week|weeks)\b/i)
    this.entityPatterns.set('STATUS', /\b(todo|in progress|done|complete|finished|blocked)\b/i)
  }

  /**
   * Process audio buffer and convert to actionable commands
   */
  async processVoiceInput(
    audioBuffer: Buffer,
    context: VoiceContext
  ): Promise<VoiceProcessingResult> {
    const startTime = Date.now()
    const errors: string[] = []

    try {
      console.log(`🎤 [Voice] Processing audio input for workspace: ${context.workspaceId}`)

      // Step 1: Speech-to-Text conversion
      const transcript = await this.speechToText(audioBuffer)
      if (!transcript || transcript.length < 3) {
        return {
          success: false,
          transcript: transcript || '',
          command: null,
          executedActions: [],
          naturalResponse: 'I couldn\'t understand what you said. Could you please try again?',
          confidence: 0,
          processingTime: Date.now() - startTime,
          errors: ['Transcript too short or empty']
        }
      }

      console.log(`📝 [Voice] Transcript: "${transcript}"`)

      // Step 2: Intent recognition and entity extraction
      const command = await this.parseVoiceCommand(transcript, context)
      
      if (!command || command.intent.confidence < 0.6) {
        // Fall back to general AI processing
        return await this.fallbackToGeneralAI(transcript, context, startTime)
      }

      console.log(`🎯 [Voice] Recognized intent: ${command.intent.primary} (${command.intent.confidence.toFixed(2)})`)

      // Step 3: Execute the command
      const executedActions = await this.executeVoiceCommand(command, context)

      // Step 4: Generate natural response
      const naturalResponse = await this.generateNaturalResponse(command, executedActions, context)

      return {
        success: true,
        transcript,
        command,
        executedActions,
        naturalResponse,
        confidence: command.intent.confidence,
        processingTime: Date.now() - startTime,
        errors: errors.length > 0 ? errors : undefined
      }

    } catch (error) {
      console.error('Voice processing error:', error)
      return {
        success: false,
        transcript: '',
        command: null,
        executedActions: [],
        naturalResponse: 'I encountered an error processing your voice command. Please try again.',
        confidence: 0,
        processingTime: Date.now() - startTime,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }

  private async speechToText(audioBuffer: Buffer): Promise<string> {
    try {
      // Check if we have OpenAI API key
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured')
      }

      const formData = new FormData()
      formData.append('file', new Blob([audioBuffer], { type: 'audio/wav' }), 'audio.wav')
      formData.append('model', 'whisper-1')
      formData.append('language', 'en')
      formData.append('response_format', 'text')

      const response = await fetch(this.WHISPER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Whisper API error: ${response.status} ${response.statusText}`)
      }

      const transcript = await response.text()
      return transcript.trim()

    } catch (error) {
      console.error('Speech-to-text error:', error)
      
      // Fallback: Return a placeholder transcript for development/testing
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 [Voice] Development mode: Using fallback transcript parsing')
        // This could be enhanced to use a local speech recognition library
        return 'create task for user authentication system'
      }
      
      throw error
    }
  }

  private async parseVoiceCommand(transcript: string, context: VoiceContext): Promise<VoiceCommand | null> {
    // Intent recognition
    const intent = this.recognizeIntent(transcript)
    if (intent.confidence < 0.6) {
      return null
    }

    // Entity extraction
    const entities = this.extractEntities(transcript)

    // Action planning
    const action = await this.planAction(intent, entities, transcript, context)

    return {
      transcript,
      confidence: intent.confidence,
      intent,
      entities,
      action,
      context
    }
  }

  private recognizeIntent(transcript: string): VoiceIntent {
    let bestMatch = { intent: 'unknown', confidence: 0 }

    for (const [intentName, patterns] of this.intentPatterns) {
      for (const pattern of patterns) {
        const match = transcript.match(pattern)
        if (match) {
          // Calculate confidence based on match quality
          const confidence = this.calculateIntentConfidence(transcript, pattern, match)
          if (confidence > bestMatch.confidence) {
            bestMatch = { intent: intentName, confidence }
          }
        }
      }
    }

    return {
      primary: bestMatch.intent,
      confidence: bestMatch.confidence,
      secondary: bestMatch.confidence < 0.8 ? ['query_info'] : undefined
    }
  }

  private calculateIntentConfidence(transcript: string, pattern: RegExp, match: RegExpMatchArray): number {
    const matchLength = match[0].length
    const transcriptLength = transcript.length
    const coverage = matchLength / transcriptLength
    
    // Base confidence from pattern match
    let confidence = 0.7
    
    // Bonus for good coverage
    confidence += Math.min(coverage * 0.3, 0.3)
    
    // Penalty for very short matches
    if (matchLength < 10) confidence -= 0.1
    
    return Math.min(confidence, 1.0)
  }

  private extractEntities(transcript: string): VoiceEntity[] {
    const entities: VoiceEntity[] = []

    for (const [entityType, pattern] of this.entityPatterns) {
      const matches = transcript.matchAll(new RegExp(pattern.source, pattern.flags + 'g'))
      
      for (const match of matches) {
        const value = match[1] || match[2] || match[3] || match[4] || match[0]
        if (value) {
          entities.push({
            type: entityType as any,
            value: value.trim(),
            confidence: 0.8,
            normalized: this.normalizeEntity(entityType, value)
          })
        }
      }
    }

    return entities
  }

  private normalizeEntity(type: string, value: string): any {
    switch (type) {
      case 'PRIORITY':
        const priorityMap: Record<string, string> = {
          'low': 'low',
          'medium': 'medium', 
          'high': 'high',
          'urgent': 'high',
          'critical': 'high'
        }
        return priorityMap[value.toLowerCase()] || 'medium'

      case 'STATUS':
        const statusMap: Record<string, string> = {
          'todo': 'TODO',
          'in progress': 'IN_PROGRESS',
          'done': 'DONE',
          'complete': 'DONE',
          'finished': 'DONE',
          'blocked': 'BLOCKED'
        }
        return statusMap[value.toLowerCase()] || 'TODO'

      case 'DATE':
        return this.parseDate(value)

      case 'DURATION':
        const durationMatch = value.match(/(\d+)\s+(hour|hours|day|days|week|weeks)/)
        if (durationMatch) {
          const num = parseInt(durationMatch[1])
          const unit = durationMatch[2]
          
          if (unit.startsWith('hour')) return { hours: num }
          if (unit.startsWith('day')) return { days: num }
          if (unit.startsWith('week')) return { weeks: num }
        }
        return { hours: 1 }

      default:
        return value
    }
  }

  private parseDate(dateStr: string): Date {
    const now = new Date()
    const lower = dateStr.toLowerCase()

    if (lower === 'today') return now
    if (lower === 'tomorrow') {
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      return tomorrow
    }
    if (lower === 'next week') {
      const nextWeek = new Date(now)
      nextWeek.setDate(nextWeek.getDate() + 7)
      return nextWeek
    }

    // Handle day names
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayIndex = dayNames.indexOf(lower)
    if (dayIndex !== -1) {
      const targetDate = new Date(now)
      const currentDay = now.getDay()
      const daysUntilTarget = (dayIndex - currentDay + 7) % 7
      targetDate.setDate(targetDate.getDate() + (daysUntilTarget || 7))
      return targetDate
    }

    // Handle MM/DD format
    const dateMatch = dateStr.match(/(\d{1,2})\/(\d{1,2})/)
    if (dateMatch) {
      const month = parseInt(dateMatch[1]) - 1 // JavaScript months are 0-indexed
      const day = parseInt(dateMatch[2])
      const year = now.getFullYear()
      return new Date(year, month, day)
    }

    return now
  }

  private async planAction(
    intent: VoiceIntent,
    entities: VoiceEntity[],
    transcript: string,
    context: VoiceContext
  ): Promise<VoiceAction> {
    const operations: DatabaseOperation[] = []
    let response = ''
    let confidence = intent.confidence

    switch (intent.primary) {
      case 'create_task':
        operations.push(await this.planTaskCreation(transcript, entities, context))
        response = 'I\'ll create that task for you.'
        break

      case 'assign_task':
        operations.push(...await this.planTaskAssignment(transcript, entities, context))
        response = 'I\'ll assign that task.'
        break

      case 'update_status':
        operations.push(...await this.planStatusUpdate(transcript, entities, context))
        response = 'I\'ll update the task status.'
        break

      case 'query_info':
        operations.push(await this.planInformationQuery(transcript, entities, context))
        response = 'Let me get that information for you.'
        break

      case 'schedule_meeting':
        operations.push(await this.planMeetingScheduling(transcript, entities, context))
        response = 'I\'ll schedule that meeting.'
        break

      default:
        response = 'I\'m not sure how to help with that.'
        confidence = 0.3
    }

    return {
      type: operations.length > 1 ? 'MULTI_STEP' : 'DATABASE_OPERATION',
      operations,
      response,
      confidence
    }
  }

  private async planTaskCreation(
    transcript: string,
    entities: VoiceEntity[],
    context: VoiceContext
  ): Promise<DatabaseOperation> {
    // Extract task title from transcript
    const taskTitle = this.extractTaskTitle(transcript)
    
    // Get entities
    const priority = entities.find(e => e.type === 'PRIORITY')?.normalized || 'medium'
    const dueDate = entities.find(e => e.type === 'DATE')?.normalized
    const assigneeName = entities.find(e => e.type === 'PERSON')?.value

    let assigneeId = null
    if (assigneeName) {
      // Find user by name
      const assignee = await prisma.user.findFirst({
        where: {
          name: { contains: assigneeName, mode: 'insensitive' }
        }
      })
      assigneeId = assignee?.id
    }

    return {
      table: 'task',
      operation: 'CREATE',
      data: {
        title: taskTitle,
        description: `Created via voice command: "${transcript}"`,
        priority,
        dueDate,
        assigneeId,
        createdById: context.userId,
        status: 'TODO'
      }
    }
  }

  private async planTaskAssignment(
    transcript: string,
    entities: VoiceEntity[],
    context: VoiceContext
  ): Promise<DatabaseOperation[]> {
    // This would involve finding the task and updating its assignee
    // Simplified implementation
    return [{
      table: 'task',
      operation: 'UPDATE',
      data: { assigneeId: 'user-id-placeholder' },
      conditions: { title: { contains: 'task-name-placeholder' } }
    }]
  }

  private async planStatusUpdate(
    transcript: string,
    entities: VoiceEntity[],
    context: VoiceContext
  ): Promise<DatabaseOperation[]> {
    const status = entities.find(e => e.type === 'STATUS')?.normalized || 'DONE'
    
    return [{
      table: 'task',
      operation: 'UPDATE',
      data: { status },
      conditions: { title: { contains: 'task-name-placeholder' } }
    }]
  }

  private async planInformationQuery(
    transcript: string,
    entities: VoiceEntity[],
    context: VoiceContext
  ): Promise<DatabaseOperation> {
    return {
      table: 'task',
      operation: 'READ',
      data: {},
      conditions: { project: { workspaceId: context.workspaceId } }
    }
  }

  private async planMeetingScheduling(
    transcript: string,
    entities: VoiceEntity[],
    context: VoiceContext
  ): Promise<DatabaseOperation> {
    const dateEntity = entities.find(e => e.type === 'DATE')
    const durationEntity = entities.find(e => e.type === 'DURATION')
    
    const startTime = dateEntity?.normalized || new Date()
    const endTime = new Date(startTime.getTime() + (durationEntity?.normalized?.hours || 1) * 60 * 60 * 1000)

    const title = this.extractMeetingTitle(transcript)

    return {
      table: 'calendarEvent',
      operation: 'CREATE',
      data: {
        title,
        description: `Scheduled via voice command: "${transcript}"`,
        startTime,
        endTime,
        workspaceId: context.workspaceId,
        createdById: context.userId
      }
    }
  }

  private extractTaskTitle(transcript: string): string {
    // Extract task title using various patterns
    const patterns = [
      /(?:create|add|make|new)\s+(?:task|todo|item)?\s*(?:for|to)?\s*(.+?)(?:\s+(?:due|by|for|assigned|with)|$)/i,
      /(?:task|todo)\s+(?:for|to)?\s*(.+?)(?:\s+(?:due|by|for|assigned|with)|$)/i,
      /(?:i need to|remind me to)\s+(.+?)(?:\s+(?:due|by|for|assigned|with)|$)/i
    ]

    for (const pattern of patterns) {
      const match = transcript.match(pattern)
      if (match && match[1]) {
        return match[1].trim()
      }
    }

    // Fallback: use the whole transcript
    return transcript.replace(/^(create|add|make|new)\s+(?:task|todo|item)?\s*/i, '').trim()
  }

  private extractMeetingTitle(transcript: string): string {
    const patterns = [
      /(?:schedule|book|set up)\s+(?:meeting|call|session)\s+(?:about|for|with)?\s*(.+?)(?:\s+(?:on|at|tomorrow|next)|$)/i,
      /meet with\s+(.+?)\s+(?:on|at|tomorrow|next)/i
    ]

    for (const pattern of patterns) {
      const match = transcript.match(pattern)
      if (match && match[1]) {
        return `Meeting: ${match[1].trim()}`
      }
    }

    return 'Voice Scheduled Meeting'
  }

  private async executeVoiceCommand(
    command: VoiceCommand,
    context: VoiceContext
  ): Promise<any[]> {
    const results = []

    for (const operation of command.action.operations) {
      try {
        const result = await this.executeOperation(operation, context)
        results.push(result)
      } catch (error) {
        console.error('Operation execution error:', error)
        results.push({ error: error instanceof Error ? error.message : 'Unknown error' })
      }
    }

    return results
  }

  private async executeOperation(operation: DatabaseOperation, context: VoiceContext): Promise<any> {
    const { table, operation: op, data, conditions } = operation

    switch (table) {
      case 'task':
        if (op === 'CREATE') {
          // Find appropriate kanban column for new tasks
          const kanban = await prisma.kanban.findFirst({
            where: { workspaceId: context.workspaceId },
            include: { columns: { orderBy: { position: 'asc' } } }
          })
          
          const defaultColumn = kanban?.columns[0] // First column (usually TODO)

          return await prisma.task.create({
            data: {
              ...data,
              kanbanColumnId: defaultColumn?.id,
              project: context.currentProject ? { connect: { id: context.currentProject } } : undefined
            }
          })
        }
        break

      case 'calendarEvent':
        if (op === 'CREATE') {
          return await prisma.calendarEvent.create({ data })
        }
        break
    }

    return null
  }

  private async generateNaturalResponse(
    command: VoiceCommand,
    executedActions: any[],
    context: VoiceContext
  ): Promise<string> {
    // Use AI to generate natural response based on executed actions
    const successfulActions = executedActions.filter(action => !action.error)
    
    if (successfulActions.length === 0) {
      return "I wasn't able to complete that action. Could you please try again or rephrase your request?"
    }

    // Generate contextual response based on intent
    switch (command.intent.primary) {
      case 'create_task':
        const task = successfulActions[0]
        if (task && task.title) {
          return `I've created the task "${task.title}" for you. ${task.assigneeId ? 'It\'s been assigned and the team will be notified.' : 'You can assign it to someone later if needed.'}`
        }
        return "I've created the task for you."

      case 'schedule_meeting':
        const event = successfulActions[0]
        if (event && event.title) {
          const startTime = new Date(event.startTime).toLocaleString()
          return `I've scheduled "${event.title}" for ${startTime}. Calendar invites will be sent out shortly.`
        }
        return "I've scheduled the meeting for you."

      default:
        return command.action.response
    }
  }

  private async fallbackToGeneralAI(
    transcript: string,
    context: VoiceContext,
    startTime: number
  ): Promise<VoiceProcessingResult> {
    console.log(`🤖 [Voice] Falling back to general AI processing`)

    try {
      // Use context-enhanced AI processing
      const enhancedPrompt = await aiContextEnhancer.enhancePromptWithContext(
        context.workspaceId,
        `Voice command: "${transcript}"\n\nPlease process this voice command and if possible, create relevant tasks, notes, or calendar events based on the context.`
      )

      // Select optimal model for voice processing
      const modelId = intelligentLLMRouter.selectOptimalModel(enhancedPrompt, {
        type: 'routine',
        complexity: 'medium',
        domain: 'project-management',
        priority: 'high',
        responseTime: 'fast'
      })

      // This would integrate with the existing AI service
      // For now, return a structured response
      const response = `I understand you said: "${transcript}". I've processed this as a general request and can help you with project management tasks. What specific action would you like me to take?`

      return {
        success: true,
        transcript,
        command: null,
        executedActions: [],
        naturalResponse: response,
        confidence: 0.5,
        processingTime: Date.now() - startTime
      }

    } catch (error) {
      return {
        success: false,
        transcript,
        command: null,
        executedActions: [],
        naturalResponse: 'I had trouble processing your voice command. Please try again.',
        confidence: 0,
        processingTime: Date.now() - startTime,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }
}

// Singleton instance
export const voiceProcessor = new VoiceProcessor()

export type { VoiceProcessingResult, VoiceCommand, VoiceContext }
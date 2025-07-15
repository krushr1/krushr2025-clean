import { GoogleGenerativeAI } from '@google/generative-ai'
import { config } from '../config'

export class AiService {
  private client: GoogleGenerativeAI

  constructor() {
    this.client = new GoogleGenerativeAI(config.GEMINI_API_KEY)
  }

  async generateResponse(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    options: {
      thinkingBudget?: number
      maxTokens?: number
      temperature?: number
      workspaceId?: string
      autoThinkingBudget?: boolean
    } = {}
  ): Promise<{
    content: string
    tokenCount: number
    cost: number
    responseTime: number
    thinkingTokens?: number
    actualThinkingBudget?: number
    parsedActions?: Array<{
      type: 'task' | 'note' | 'event' | 'project'
      data: any
      confidence: number
    }>
  }> {
    const startTime = Date.now()
    
    try {
      // Get the model
      const model = this.client.getGenerativeModel({ model: 'gemini-2.5-flash' })

      // Calculate optimal thinking budget if not provided or if auto mode is enabled
      let actualThinkingBudget = options.thinkingBudget || 0
      
      if (options.autoThinkingBudget !== false) {
        actualThinkingBudget = this.calculateOptimalThinkingBudget(messages, options.workspaceId)
        
        // If user provided a specific budget, use it as a maximum cap
        if (options.thinkingBudget !== undefined) {
          actualThinkingBudget = Math.min(actualThinkingBudget, options.thinkingBudget)
        }
      }

      // Add the system prompt as the first message if this is a new conversation
      const systemPrompt = this.generateSystemPrompt(options.workspaceId)
      const enhancedMessages = messages.length === 1 ? 
        [{ role: 'user' as const, content: systemPrompt + '\n\n' + messages[0].content }] : 
        messages

      // Convert messages to Gemini format  
      const contents = enhancedMessages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }))

      const config: any = {
        maxOutputTokens: options.maxTokens || 4096,
        temperature: options.temperature || 0.7
      }

      // Add thinking budget if specified
      if (actualThinkingBudget > 0) {
        config.thinkingConfig = {
          thinkingBudget: actualThinkingBudget
        }
      }

      const response = await model.generateContent({
        contents,
        generationConfig: config
      })

      const responseTime = Date.now() - startTime
      const content = response.response.text() || ''
      
      // Estimate token count (rough approximation)
      const tokenCount = this.estimateTokenCount(content)
      
      // Calculate cost (example pricing - adjust based on actual Gemini pricing)
      const cost = this.calculateCost(tokenCount, 'gemini-1.5-flash')

      // Try to parse any actionable items from the response
      const parsedActions = this.parseActionableItems(content)

      return {
        content,
        tokenCount,
        cost,
        responseTime,
        thinkingTokens: response.response.usageMetadata?.candidatesTokenCount || 0,
        actualThinkingBudget,
        parsedActions
      }
    } catch (error) {
      console.error('AI Service Error:', error)
      throw new Error('Failed to generate AI response')
    }
  }

  private estimateTokenCount(text: string): number {
    // Rough approximation: 1 token ≈ 4 characters for English
    return Math.ceil(text.length / 4)
  }

  private calculateCost(tokenCount: number, model: string): number {
    // Example pricing for Gemini 2.5 Flash (adjust based on actual pricing)
    const pricePerToken = 0.000002 // $0.000002 per token (example)
    return tokenCount * pricePerToken
  }

  private generateSystemPrompt(workspaceId?: string): string {
    return `You are KRUSHR AI Partner, an intelligent project management assistant integrated into the KRUSHR platform. You help users efficiently manage their tasks, projects, notes, and workflows.

## CORE CAPABILITIES
- Parse user inputs into actionable database items (tasks, notes, projects, events)
- Provide intelligent suggestions for task organization and project management
- Help with time tracking, deadline management, and resource allocation
- Assist with team collaboration and communication

## DATABASE SCHEMA AWARENESS
You understand the complete KRUSHR data structure:

### TASKS
- Standard fields: title, description, status (TODO/IN_PROGRESS/REVIEW/DONE), priority (low/medium/high/critical)
- Advanced fields: storyPoints, estimatedHours, actualHours, dueDate, startDate, completedAt
- Enterprise fields: businessValue, complexity, riskLevel, aiSummary, aiPriority, blockedReason
- Relationships: assignee, project, kanbanColumn, parent/subtasks, dependencies, attachments, checklists, comments, tags, timeEntries

### NOTES
- Fields: title, content (rich text), color, isPinned, isArchived, folderId
- Relationships: workspace, author, folder, attachments, tags

### PROJECTS
- Fields: name, description, status (ACTIVE/PAUSED/COMPLETED/CANCELLED), startDate, endDate
- Relationships: workspace, team, kanbans, tasks

### CALENDAR EVENTS
- Fields: title, description, startTime, endTime, allDay, location, color, type (MEETING/TASK/REMINDER/EVENT/DEADLINE/MILESTONE)
- Advanced: priority, isRecurring, recurrenceRule, visibility (PUBLIC/PRIVATE)
- Relationships: workspace, createdBy, attendees, reminders

### TEAMS & WORKSPACES
- Multi-tenant architecture with role-based access
- Teams can have multiple projects and chat threads
- Workspaces contain all user data and have configurable settings

## INTELLIGENT PARSING RULES

### TASK DETECTION
Parse as TASK when user mentions:
- "need to", "have to", "must", "should", "todo", "task"
- Action verbs: "create", "build", "fix", "update", "review", "test", "deploy"
- Deadline indicators: "by", "due", "deadline", "before"
- Assignment: "assign to", "give to", "for [person]"

### NOTE DETECTION
Parse as NOTE when user mentions:
- "note", "remember", "jot down", "write down", "document"
- Information storage: "keep track of", "record", "log"
- Reference materials: "reference", "documentation", "specs"

### PROJECT DETECTION
Parse as PROJECT when user mentions:
- "project", "initiative", "campaign", "feature", "milestone"
- Large scope: "complete overhaul", "new system", "major update"
- Multi-phase work: "phase 1", "stage", "iteration"

### EVENT DETECTION
Parse as CALENDAR_EVENT when user mentions:
- "meeting", "call", "appointment", "schedule", "book"
- Time indicators: specific dates, times, "tomorrow", "next week"
- Event types: "standup", "review", "demo", "presentation"

## SECURITY & PRIVACY
- Never expose sensitive information from other workspaces
- Respect user permissions and access controls
- Only suggest actions within user's current workspace context
- Maintain data integrity and prevent unauthorized modifications

## RESPONSE FORMAT
Always provide clear, actionable responses. When parsing inputs into database items, explain what you're creating and why. Offer suggestions for optimization, prioritization, and best practices.

${workspaceId ? `\nCURRENT WORKSPACE: ${workspaceId}` : ''}

Be helpful, intelligent, and focused on productivity enhancement while maintaining security and data accuracy.`
  }

  private parseActionableItems(content: string): Array<{
    type: 'task' | 'note' | 'event' | 'project'
    data: any
    confidence: number
  }> {
    const actions = []
    const text = content.toLowerCase()
    
    // Task patterns
    const taskPatterns = [
      /(?:need to|have to|must|should|todo|task)\s+(.+?)(?:\.|$)/gi,
      /(?:create|build|fix|update|review|test|deploy)\s+(.+?)(?:\.|$)/gi,
      /(.+?)\s+(?:by|due|deadline|before)\s+(.+?)(?:\.|$)/gi
    ]
    
    // Note patterns
    const notePatterns = [
      /(?:note|remember|jot down|write down|document)\s+(.+?)(?:\.|$)/gi,
      /(?:keep track of|record|log)\s+(.+?)(?:\.|$)/gi
    ]
    
    // Project patterns
    const projectPatterns = [
      /(?:project|initiative|campaign|feature|milestone)\s+(.+?)(?:\.|$)/gi,
      /(?:complete overhaul|new system|major update)\s+(.+?)(?:\.|$)/gi
    ]
    
    // Event patterns
    const eventPatterns = [
      /(?:meeting|call|appointment|schedule|book)\s+(.+?)(?:\.|$)/gi,
      /(?:standup|review|demo|presentation)\s+(.+?)(?:\.|$)/gi
    ]
    
    // Parse tasks
    taskPatterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(content)) !== null) {
        actions.push({
          type: 'task',
          data: {
            title: match[1]?.trim() || 'New Task',
            description: match[0],
            priority: this.extractPriority(match[0]),
            dueDate: this.extractDate(match[0])
          },
          confidence: 0.8
        })
      }
    })
    
    // Parse notes
    notePatterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(content)) !== null) {
        actions.push({
          type: 'note',
          data: {
            title: this.generateNoteTitle(match[1] || match[0]),
            content: match[0]
          },
          confidence: 0.7
        })
      }
    })
    
    // Parse projects
    projectPatterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(content)) !== null) {
        actions.push({
          type: 'project',
          data: {
            name: match[1]?.trim() || 'New Project',
            description: match[0]
          },
          confidence: 0.75
        })
      }
    })
    
    // Parse events
    eventPatterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(content)) !== null) {
        actions.push({
          type: 'event',
          data: {
            title: match[1]?.trim() || 'New Event',
            description: match[0],
            startTime: this.extractDate(match[0]) || new Date(),
            type: this.extractEventType(match[0])
          },
          confidence: 0.8
        })
      }
    })
    
    return actions.filter(action => action.confidence > 0.6)
  }
  
  private extractPriority(text: string): string {
    const lowerText = text.toLowerCase()
    if (lowerText.includes('urgent') || lowerText.includes('critical') || lowerText.includes('asap')) {
      return 'critical'
    }
    if (lowerText.includes('important') || lowerText.includes('high')) {
      return 'high'
    }
    if (lowerText.includes('low') || lowerText.includes('minor')) {
      return 'low'
    }
    return 'medium'
  }
  
  private extractDate(text: string): Date | null {
    // Simple date extraction - can be enhanced with more sophisticated parsing
    const datePatterns = [
      /tomorrow/i,
      /next week/i,
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
      /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i
    ]
    
    for (const pattern of datePatterns) {
      if (pattern.test(text)) {
        // Basic date parsing logic - would need more sophisticated implementation
        if (/tomorrow/i.test(text)) {
          const tomorrow = new Date()
          tomorrow.setDate(tomorrow.getDate() + 1)
          return tomorrow
        }
        if (/next week/i.test(text)) {
          const nextWeek = new Date()
          nextWeek.setDate(nextWeek.getDate() + 7)
          return nextWeek
        }
      }
    }
    
    return null
  }
  
  private extractEventType(text: string): string {
    const lowerText = text.toLowerCase()
    if (lowerText.includes('meeting') || lowerText.includes('call')) return 'MEETING'
    if (lowerText.includes('deadline') || lowerText.includes('due')) return 'DEADLINE'
    if (lowerText.includes('milestone')) return 'MILESTONE'
    if (lowerText.includes('reminder')) return 'REMINDER'
    return 'EVENT'
  }
  
  private generateNoteTitle(content: string): string {
    // Generate a concise title from note content
    const words = content.trim().split(' ').slice(0, 6)
    return words.join(' ') + (content.trim().split(' ').length > 6 ? '...' : '')
  }

  private calculateOptimalThinkingBudget(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    workspaceId?: string
  ): number {
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()
    if (!lastUserMessage) return 0

    const query = lastUserMessage.content.toLowerCase()
    const queryLength = query.length
    let baseScore = 0

    // Content complexity indicators
    const complexityIndicators = {
      // High complexity (16000-24576 tokens)
      highComplexity: [
        /(?:analyze|compare|evaluate|critique|assess|review|audit|investigate)/,
        /(?:strategy|plan|roadmap|architecture|design|framework|system)/,
        /(?:problem.{0,20}solv|debug|troubleshoot|diagnose|fix.{0,20}issue)/,
        /(?:explain.{0,20}(?:how|why|what|when|where)|understand|clarify)/,
        /(?:multiple|several|various|different|complex|complicated|detailed)/,
        /(?:recommendation|suggestion|advice|guidance|best.{0,10}practice)/,
        /(?:integration|migration|transformation|optimization|refactor)/,
        /(?:security|performance|scalability|maintainability|accessibility)/,
      ],
      
      // Medium complexity (8000-16000 tokens)
      mediumComplexity: [
        /(?:create|build|develop|implement|generate|produce|make)/,
        /(?:list|show|display|provide|give.{0,10}me|tell.{0,10}me)/,
        /(?:update|modify|change|edit|adjust|improve|enhance)/,
        /(?:code|script|function|method|class|component|feature)/,
        /(?:workflow|process|procedure|steps|instructions|guide)/,
        /(?:database|api|endpoint|service|application|software)/,
        /(?:test|testing|validation|verification|quality|qa)/,
      ],
      
      // Low complexity (2000-8000 tokens)
      lowComplexity: [
        /(?:what.{0,10}is|define|definition|meaning|purpose)/,
        /(?:how.{0,10}to|tutorial|example|sample|demo)/,
        /(?:status|check|verify|confirm|validate)/,
        /(?:find|search|locate|get|fetch|retrieve)/,
        /(?:simple|basic|quick|fast|easy|straightforward)/,
        /(?:yes|no|true|false|correct|wrong|right)/,
      ],
      
      // Minimal complexity (0-2000 tokens)
      minimalComplexity: [
        /^(?:hi|hello|hey|thanks|thank you|ok|okay|yes|no|sure)$/,
        /(?:ping|test|check|hello|hi there)/,
        /^.{1,20}$/,  // Very short queries
        /(?:good|great|perfect|awesome|cool|nice)/,
      ]
    }

    // Score based on complexity patterns
    if (complexityIndicators.highComplexity.some(pattern => pattern.test(query))) {
      baseScore += 24
    } else if (complexityIndicators.mediumComplexity.some(pattern => pattern.test(query))) {
      baseScore += 12
    } else if (complexityIndicators.lowComplexity.some(pattern => pattern.test(query))) {
      baseScore += 6
    } else if (complexityIndicators.minimalComplexity.some(pattern => pattern.test(query))) {
      baseScore += 0
    } else {
      baseScore += 8 // Default for unmatched queries
    }

    // Adjust based on query length
    if (queryLength > 500) baseScore += 8
    else if (queryLength > 200) baseScore += 4
    else if (queryLength > 100) baseScore += 2
    else if (queryLength < 30) baseScore -= 2

    // Adjust based on technical terms
    const technicalTerms = [
      'algorithm', 'database', 'api', 'authentication', 'authorization',
      'encryption', 'performance', 'scalability', 'architecture', 'framework',
      'integration', 'deployment', 'monitoring', 'logging', 'caching',
      'microservices', 'containers', 'kubernetes', 'docker', 'aws',
      'typescript', 'javascript', 'python', 'react', 'nodejs'
    ]
    
    const technicalMatches = technicalTerms.filter(term => 
      query.includes(term.toLowerCase())
    ).length
    
    if (technicalMatches > 5) baseScore += 6
    else if (technicalMatches > 3) baseScore += 4
    else if (technicalMatches > 1) baseScore += 2

    // Adjust based on question complexity
    const questionWords = query.match(/\b(?:what|how|why|when|where|which|who)\b/g)?.length || 0
    if (questionWords > 3) baseScore += 4
    else if (questionWords > 1) baseScore += 2

    // Adjust based on context (conversation history)
    const conversationLength = messages.length
    if (conversationLength > 10) baseScore += 2
    else if (conversationLength > 5) baseScore += 1

    // Check for actionable parsing needs
    const actionablePatterns = [
      /(?:need to|have to|must|should|todo|task)/,
      /(?:create|build|fix|update|review|test|deploy)/,
      /(?:note|remember|jot down|write down|document)/,
      /(?:project|initiative|campaign|feature|milestone)/,
      /(?:meeting|call|appointment|schedule|book)/
    ]
    
    if (actionablePatterns.some(pattern => pattern.test(query))) {
      baseScore += 4 // Actionable items need more reasoning
    }

    // Convert score to token budget (0-24576)
    const tokenBudget = Math.min(24576, Math.max(0, baseScore * 1000))
    
    // Log the decision for debugging (can be removed in production)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AI Thinking Budget] Query: "${lastUserMessage.content.substring(0, 100)}..."`)
      console.log(`[AI Thinking Budget] Base score: ${baseScore}, Token budget: ${tokenBudget}`)
    }
    
    return tokenBudget
  }

  getThinkingBudgetExplanation(budget: number): string {
    if (budget === 0) return 'Fast response (no thinking)'
    if (budget <= 2000) return 'Minimal thinking (simple queries)'
    if (budget <= 8000) return 'Low thinking (basic tasks)'
    if (budget <= 16000) return 'Medium thinking (complex tasks)'
    if (budget <= 24000) return 'High thinking (analysis & reasoning)'
    return 'Maximum thinking (complex problem solving)'
  }

  // Test function to demonstrate budget allocation extremes
  testBudgetExtremes(): { minimal: any, maximum: any } {
    // Test minimal complexity query
    const minimalQuery = [{ role: 'user' as const, content: 'hi' }]
    const minimalBudget = this.calculateOptimalThinkingBudget(minimalQuery)
    
    // Test maximum complexity query
    const maximalQuery = [{ 
      role: 'user' as const, 
      content: 'Analyze and compare the complex security vulnerabilities in our multi-tenant database architecture, evaluate the performance implications of implementing OAuth 2.0 with JWT tokens, critique the current authentication system design, provide detailed recommendations for optimizing scalability and maintainability, investigate potential integration issues with microservices, and develop a comprehensive migration strategy for transitioning from our legacy system to a modern containerized deployment with Kubernetes while ensuring backward compatibility and minimizing downtime during the transformation process'
    }]
    const maximalBudget = this.calculateOptimalThinkingBudget(maximalQuery)
    
    return {
      minimal: {
        query: minimalQuery[0].content,
        budget: minimalBudget,
        explanation: this.getThinkingBudgetExplanation(minimalBudget),
        costImplication: minimalBudget === 0 ? 'Cheapest ($0.60/M tokens)' : 'Higher cost ($3.50/M tokens)'
      },
      maximum: {
        query: maximalQuery[0].content.substring(0, 100) + '...',
        budget: maximalBudget,
        explanation: this.getThinkingBudgetExplanation(maximalBudget),
        costImplication: 'Highest cost ($3.50/M tokens) but maximum reasoning'
      }
    }
  }

  async generateTitle(content: string): Promise<string> {
    try {
      const response = await this.generateResponse([
        {
          role: 'user',
          content: `Generate a short, descriptive title (max 6 words) for this conversation:\n\n${content.substring(0, 500)}...`
        }
      ], {
        thinkingBudget: 0,
        maxTokens: 50,
        temperature: 0.5
      })

      return response.content.replace(/['"]/g, '').trim()
    } catch (error) {
      console.error('Title generation error:', error)
      return 'AI Conversation'
    }
  }

  async summarizeConversation(messages: Array<{ role: string; content: string }>): Promise<string> {
    try {
      const conversationText = messages
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n')

      const response = await this.generateResponse([
        {
          role: 'user',
          content: `Summarize this conversation in 2-3 sentences:\n\n${conversationText}`
        }
      ], {
        thinkingBudget: 0,
        maxTokens: 200,
        temperature: 0.3
      })

      return response.content
    } catch (error) {
      console.error('Conversation summary error:', error)
      return 'AI conversation summary unavailable'
    }
  }
}

export const aiService = new AiService()
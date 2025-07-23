import { GoogleGenerativeAI } from '@google/generative-ai'
import { config } from '../config'
import { webSearchService, WebSearchService, SearchResult, WeatherData, NewsResult } from './web-search'

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
      enableRealTimeData?: boolean
    } = {}
  ): Promise<{
    content: string
    tokenCount: number
    cost: number
    responseTime: number
    thinkingTokens?: number
    actualThinkingBudget?: number
    realTimeData?: {
      searchResults?: SearchResult[]
      weatherData?: WeatherData
      newsResults?: NewsResult[]
      currentDateTime?: any
    }
    parsedActions?: Array<{
      type: 'task' | 'note' | 'event' | 'project'
      data: any
      confidence: number
    }>
  }> {
    const startTime = Date.now()
    let realTimeData: any = {}
    
    // CRITICAL DEBUGGING: Log when AI service is called
    const lastUserMessage = messages[messages.length - 1]?.content || ''
    console.log(`🤖 AI SERVICE CALLED with message: "${lastUserMessage}"`)
    console.log(`🤖 AI SERVICE enableRealTimeData: ${options.enableRealTimeData}`)
    
    try {
      // Check if the query needs real-time data
      const realTimeAnalysis = WebSearchService.requiresRealTimeData(lastUserMessage)
      
      // Gather real-time data if needed and enabled
      // FORCE real-time data for government queries to fix president issue
      if ((options.enableRealTimeData && realTimeAnalysis.needsRealTime) || 
          lastUserMessage.toLowerCase().includes('president') ||
          lastUserMessage.toLowerCase().includes('vice president')) {
        console.log('🔥 FORCING real-time data for government query')
        realTimeData = await this.gatherRealTimeData(lastUserMessage, realTimeAnalysis.categories.length > 0 ? realTimeAnalysis.categories : ['government'])
      }
      
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

      // Always add the system prompt as the first message for consistent behavior
      const systemPrompt = this.generateSystemPrompt(options.workspaceId, realTimeData)
      const enhancedMessages = [
        { role: 'user' as const, content: systemPrompt },
        ...messages
      ]

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

      // Try to parse any actionable items from the USER'S MESSAGE, not the AI response
      console.log('[AI DEBUG] Parsing user message for actions:', lastUserMessage)
      const parsedActions = this.parseActionableItems(lastUserMessage)
      console.log('[AI DEBUG] Found actions:', JSON.stringify(parsedActions, null, 2))
      console.log('[AI DEBUG] Number of actions found:', parsedActions.length)

      return {
        content,
        tokenCount,
        cost,
        responseTime,
        thinkingTokens: response.response.usageMetadata?.candidatesTokenCount || 0,
        actualThinkingBudget,
        realTimeData: Object.keys(realTimeData).length > 0 ? realTimeData : undefined,
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

  private generateSystemPrompt(workspaceId?: string, realTimeData?: any): string {
    return `You are Krushr AI - a sharp, capable productivity assistant.

**Core abilities:**
- Create notes instantly when asked ("make a note", "save this", "remember")
- Organize information into tasks, projects, and events
- Provide quick, actionable answers
- Access real-time data when enabled

**Communication style:**
- Use bullet points and numbered lists for clarity
- Structure responses with clear sections
- Direct and concise - no fluff or emojis
- Start with the answer, add context only if needed
- One clear recommendation over multiple options

**Response formatting:**
- Use headers for different sections
- Bullet points for lists and key points
- Numbered steps for processes
- Clear separation between topics

**When creating notes:**
- The system automatically creates notes when you ask
- Do NOT say "I'll create a note" - it happens automatically
- Do NOT say "Creating a note titled..." - just provide the information
- When user says "make that a note", the system saves your previous response
- Focus on providing good content, the system handles note creation

${workspaceId ? `Workspace: ${workspaceId}` : ''}
${realTimeData && Object.keys(realTimeData).length > 0 ? this.formatRealTimeDataContext(realTimeData) : ''}

Be helpful. Be fast. Get things done.`
  }

  private parseActionableItems(content: string): Array<{
    type: 'task' | 'note' | 'event' | 'project'
    data: any
    confidence: number
  }> {
    const actions: Array<{
      type: 'task' | 'note' | 'event' | 'project'
      data: any
      confidence: number
    }> = []
    const text = content.toLowerCase()
    
    // Check for explicit note requests FIRST to prevent task pattern overlap
    const isNoteRequest = /(?:create|make|add|write|save)\s+(?:a?\s*)?note|^(add|save|make)\s+(that|this|it)\s+(as\s+)?a?\s*note$/i.test(content)
    
    // Note patterns - capture everything after "note"
    const notePatterns = [
      /(?:create|make|add|write)\s+(?:a?\s*)?note\s+(?:in\s+\w+\s+)?(?:about|for|on|regarding|with|titled)?\s*(.+)$/gi,
      /^(?:note|remember|jot down|write down|document)\s+(.+)$/gi,
      /(?:keep track of|record|log)\s+(.+)$/gi,
      /^(add|save|make)\s+(that|this|it)\s+(as\s+)?a?\s*note$/gi  // For contextual references
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
    
    // Parse notes FIRST if it's a note request
    if (isNoteRequest) {
      // For "make note" at the end, capture everything before it
      const makeNoteEndMatch = content.match(/^(.+?)\.\s*make\s+note(?:\s+in\s+\w+)?$/i)
      if (makeNoteEndMatch) {
        const noteData = this.extractNoteData(makeNoteEndMatch[1], content)
        actions.push({
          type: 'note',
          data: {
            title: noteData.title,
            content: noteData.content,
            tags: noteData.tags
          },
          confidence: 0.95
        })
        return actions
      }
      
      // Otherwise try standard patterns
      notePatterns.forEach(pattern => {
        let match
        while ((match = pattern.exec(content)) !== null) {
          const noteContent = match[1] || match[0]
          const noteData = this.extractNoteData(noteContent, content)
          
          actions.push({
            type: 'note',
            data: {
              title: noteData.title,
              content: noteData.content,
              tags: noteData.tags
            },
            confidence: 0.95 // Very high confidence for explicit note requests
          })
          return // Only create ONE note per request
        }
      })
      return actions // Skip other patterns if it's a note request
    }
    
    // Task patterns - only check if NOT a note request
    const taskPatterns = [
      /(?:need to|have to|must|should|todo|task)\s+(.+?)(?:\.|$)/gi,
      /(?:build|fix|update|review|test|deploy)\s+(.+?)(?:\.|$)/gi, // Removed 'create' to avoid overlap
      /(.+?)\s+(?:by|due|deadline|before)\s+(.+?)(?:\.|$)/gi
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
    const words = content.trim().split(/\s+/)
    if (words.length <= 5) {
      return content.trim()
    }
    return words.slice(0, 5).join(' ') + '...'
  }
  
  private extractNoteData(noteText: string, fullContent: string): { title: string; content: string; tags: string[] } {
    console.log('[AI DEBUG] Extracting note data from:', noteText)
    console.log('[AI DEBUG] Full content context:', fullContent)
    
    // Extract title if specified
    let title = ''
    let content = noteText
    
    // For numbered lists or structured content, extract title from first line
    const lines = noteText.trim().split('\n')
    if (lines.length > 1 && (lines[0].match(/^(top \d+|best \d+|\d+\.|##?\s)/i) || lines[1].match(/^[1-9]\./))) {
      // First line is likely the title
      title = lines[0].replace(/^##?\s*/, '').replace(/:$/, '').trim()
      content = noteText.trim() // Keep full content including title
      console.log('[AI DEBUG] Extracted title from first line:', title)
    } else {
      // Check for explicit title patterns with quotes
      const quotedTitleMatch = noteText.match(/(?:titled?|called?)\s+"([^"]+)"/i)
      if (quotedTitleMatch && quotedTitleMatch[1]) {
        title = quotedTitleMatch[1].trim()
        // Remove the title part and keep the rest as content
        content = noteText.replace(quotedTitleMatch[0], '').trim()
        console.log('[AI DEBUG] Found quoted title:', title)
      } else {
        // Check for title without quotes
        const unquotedTitleMatch = noteText.match(/(?:titled?|called?)\s+([^,]+?)(?:\s+(?:with|about|that|containing|for)|$)/i)
        if (unquotedTitleMatch && unquotedTitleMatch[1]) {
          title = unquotedTitleMatch[1].trim()
          // Keep everything after the title as content
          const titleEndIndex = noteText.indexOf(unquotedTitleMatch[1]) + unquotedTitleMatch[1].length
          content = noteText.substring(titleEndIndex).replace(/^\s*(?:with|about|that|containing|for)\s*/i, '').trim()
          console.log('[AI DEBUG] Found unquoted title:', title)
        } else {
          // No explicit title - generate smart title from content
          const words = noteText.trim().split(/\s+/)
          
          // Look for key topic words to create a meaningful title
          if (noteText.toLowerCase().includes('restaurants')) {
            title = 'Restaurant List'
          } else if (noteText.toLowerCase().includes('meeting')) {
            const meetingMatch = noteText.match(/(\w+\s+)?meeting/i)
            title = meetingMatch ? meetingMatch[0] : 'Meeting Notes'
          } else if (words.length > 3) {
            // Use first 3-4 words as title
            title = words.slice(0, Math.min(4, words.length)).join(' ')
          } else {
            title = noteText.trim()
          }
          
          // Always use FULL text as content
          content = noteText.trim()
          console.log('[AI DEBUG] Generated title from content:', title)
        }
      }
    }
    
    // Always ensure we have the full content
    if (!content || content.length < 10) {
      content = noteText.trim()
      console.log('[AI DEBUG] Ensuring full content is captured')
    }
    
    // Extract any hashtags or mentioned topics as tags
    const tags: string[] = []
    const hashtagMatches = content.match(/#\w+/g) || []
    tags.push(...hashtagMatches.map(tag => tag.substring(1)))
    
    // Add default tag
    tags.push('ai-generated')
    
    // Clean up content - remove leading prepositions but preserve the rest
    content = content.replace(/^(?:about|for|with|that says|that)\s+/i, '')
    
    const result = {
      title: title || 'AI Note',
      content: content || noteText,
      tags: [...new Set(tags)] // Remove duplicates
    }
    
    console.log('[AI DEBUG] Final note data:', JSON.stringify(result, null, 2))
    return result
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

  /**
   * Gathers real-time data based on the query categories
   */
  private async gatherRealTimeData(
    query: string, 
    categories: Array<'weather' | 'news' | 'time' | 'government' | 'search'>
  ): Promise<any> {
    const realTimeData: any = {}

    try {
      // Always include current date/time for context
      if (categories.includes('time') || categories.length > 0) {
        realTimeData.currentDateTime = webSearchService.getCurrentDateTime()
      }

      // Gather weather data
      if (categories.includes('weather')) {
        // Extract location from query or use default
        const location = this.extractLocationFromQuery(query) || 'Washington, DC'
        realTimeData.weatherData = await webSearchService.getWeather(location)
      }

      // Gather news data
      if (categories.includes('news')) {
        const newsQuery = this.extractNewsQueryFromText(query)
        realTimeData.newsResults = await webSearchService.getNews({
          q: newsQuery,
          pageSize: 5
        })
      }

      // Gather government information
      if (categories.includes('government')) {
        console.log('🏛️ Gathering government information for:', query)
        realTimeData.governmentInfo = await webSearchService.getGovernmentInfo(query)
        console.log('🏛️ Government info results:', realTimeData.governmentInfo?.length || 0, 'items')
      }

      // Perform general web search
      if (categories.includes('search') || categories.length === 0) {
        realTimeData.searchResults = await webSearchService.searchWeb(query, {
          maxResults: 5
        })
      }

      return realTimeData
    } catch (error) {
      console.error('Error gathering real-time data:', error)
      return {}
    }
  }

  /**
   * Formats real-time data for inclusion in system prompt
   */
  private formatRealTimeDataContext(realTimeData: any): string {
    let context = '**Real-Time Context**:\n'

    if (realTimeData.currentDateTime) {
      const dt = realTimeData.currentDateTime
      context += `- **Current Time**: ${dt.date} ${dt.time} (${dt.timezone})\n`
    }

    if (realTimeData.weatherData) {
      const weather = realTimeData.weatherData
      context += `- **Weather in ${weather.location}**: ${weather.temperature}°F, ${weather.condition}\n`
    }

    if (realTimeData.newsResults && realTimeData.newsResults.length > 0) {
      context += `- **Recent News**: ${realTimeData.newsResults.length} articles found\n`
      realTimeData.newsResults.slice(0, 3).forEach((news: NewsResult, i: number) => {
        context += `  ${i + 1}. ${news.title} (${news.source})\n`
      })
    }

    if (realTimeData.searchResults && realTimeData.searchResults.length > 0) {
      context += `- **Web Search Results**: ${realTimeData.searchResults.length} results found\n`
      realTimeData.searchResults.slice(0, 3).forEach((result: SearchResult, i: number) => {
        context += `  ${i + 1}. ${result.title}: ${result.snippet}\n`
      })
    }

    if (realTimeData.governmentInfo && realTimeData.governmentInfo.length > 0) {
      context += `- **Current Government Information**:\n`
      realTimeData.governmentInfo.slice(0, 3).forEach((result: SearchResult, i: number) => {
        context += `  ${i + 1}. ${result.title}\n`
        context += `     ${result.snippet}\n`
      })
    }

    return context
  }

  /**
   * Extracts location from a weather-related query
   */
  private extractLocationFromQuery(query: string): string | null {
    const lowerQuery = query.toLowerCase()
    
    // Look for "in [location]" pattern
    const inMatch = lowerQuery.match(/\bin\s+([a-zA-Z\s,]+)/)
    if (inMatch) {
      return inMatch[1].trim()
    }

    // Look for common city patterns
    const cityMatch = lowerQuery.match(/\b(new york|los angeles|chicago|houston|philadelphia|phoenix|san antonio|san diego|dallas|san jose|austin|jacksonville|fort worth|columbus|charlotte|san francisco|indianapolis|seattle|denver|washington|boston|nashville|baltimore|oklahoma city|louisville|portland|las vegas|milwaukee|albuquerque|tucson|fresno|sacramento|kansas city|long beach|mesa|atlanta|colorado springs|virginia beach|raleigh|omaha|miami|oakland|minneapolis|tulsa|wichita|new orleans|arlington|cleveland|bakersfield|tampa|aurora|honolulu|anaheim|santa ana|corpus christi|riverside|lexington|stockton|toledo|st. paul|newark|greensboro|plano|henderson|lincoln|buffalo|jersey city|chula vista|fort wayne|orlando|st. petersburg|chandler|laredo|norfolk|durham|madison|lubbock|irvine|winston-salem|glendale|garland|hialeah|reno|chesapeake|gilbert|baton rouge|irving|scottsdale|north las vegas|fremont|boise|richmond|san bernardino|birmingham|spokane|rochester|des moines|modesto|fayetteville|tacoma|oxnard|fontana|columbus|montgomery|moreno valley|shreveport|aurora|yonkers|akron|huntington beach|little rock|augusta|amarillo|glendale|mobile|grand rapids|salt lake city|tallahassee|huntsville|grand prairie|knoxville|worcester|newport news|brownsville|overland park|santa clarita|providence|garden grove|chattanooga|oceanside|jackson|fort lauderdale|santa rosa|rancho cucamonga|port st. lucie|tempe|ontario|vancouver|cape coral|sioux falls|springfield|peoria|pembroke pines|elk grove|salem|lancaster|corona|eugene|palmdale|salinas|springfield|pasadena|fort collins|hayward|pomona|cary|rockford|alexandria|escondido|mckinney|kansas city|joliet|sunnyvale|torrance|bridgeport|lakewood|hollywood|paterson|naperville|syracuse|mesquite|dayton|savannah|clarksville|orange|pasadena|fullerton|killeen|frisco|hampton|mcallen|warren|west valley city|columbia|olathe|sterling heights|new haven|miramar|waco|thousand oaks|cedar rapids|charleston|sioux city|round rock|fargo|concord|stamford|manchester|allentown|evansville|ann arbor|beaumont|independence|rochester|visalia|carrollton|coral springs|clearwater|lowell|daly city|sandy springs|new bedford|rialto|davenport|temecula|santa maria|greeley|santa clara|compton|tyler|pompano beach|west jordan|norman|richmond|centennial|murfreesboro|lewisville|clovis|allen|macon|broken arrow|sparks|el cajon|west palm beach|carlsbad|pearland|richardson|antioch|inglewood|high point|midland|billings|manchester|surprise|thornton|west covina|vallejo|ann arbor|el monte|carlsbad|downey|costa mesa|berkeley|arvada|west jordan|provo|lee's summit|lynn|jurupa valley|westminster|davie|dearborn|ventura|alhambra|norwalk|renton|roseville|victorville|woodbridge|chico|tuscaloosa|livonia|new bedford|brandon|buena park|lakeland|albany|redding|nampa|san mateo|quincy|brockton|mission viejo|plantation|medford|reading|somerville|cedar rapids|gary|cambridge|green bay|evanston|fairfield|lowell|everett|ventura|richardson|concord|st. petersburg|vista|cambridge|westminster|san buenaventura|norman|rochester|troy|pueblo|west jordan|cicero|mission|peoria|el paso|south bend|edmond|miami gardens|las cruces|college station|davie|midland|clearwater|odessa|west jordan|west palm beach|west valley city|west covina|west jordan|west valley city|west palm beach|west covina|lakewood|west jordan|west valley city)\b/)
    if (cityMatch) {
      return cityMatch[1]
    }

    return null
  }

  /**
   * Extracts news search terms from the query
   */
  private extractNewsQueryFromText(query: string): string {
    const lowerQuery = query.toLowerCase()
    
    // Remove common query prefixes
    let newsQuery = lowerQuery
      .replace(/^(what's the|what is the|tell me about|news about|latest news on|recent news about)\s+/i, '')
      .replace(/\b(news|latest|recent|current|today|breaking)\b/gi, '')
      .trim()

    // If nothing useful remains, return a general news query
    if (newsQuery.length < 3) {
      return 'latest news'
    }

    return newsQuery
  }
}

export const aiService = new AiService()
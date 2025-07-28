/**
 * Multi-LLM Intelligence Router
 * World's most powerful AI model selection and routing system
 * Aligned with KRUSHR-AI-SYSTEM-INSTRUCTIONS.md
 */

import { z } from 'zod'

export interface LLMConfig {
  name: string
  provider: 'openai' | 'anthropic' | 'google' | 'deepseek'
  model: string
  apiKey: string
  maxTokens?: number
  temperature?: number
  costPerToken: number
  strengthCategories: string[]
  weaknessCategories: string[]
}

export interface TaskContext {
  type: 'planning' | 'technical' | 'analysis' | 'routine' | 'creative' | 'problem-solving'
  complexity: 'low' | 'medium' | 'high'
  domain: 'project-management' | 'code' | 'documentation' | 'data' | 'general'
  priority: 'low' | 'medium' | 'high'
  budgetConstraint?: 'strict' | 'moderate' | 'flexible'
  responseTime?: 'fast' | 'balanced' | 'quality'
}

export interface ModelPerformanceMetrics {
  modelId: string
  averageResponseTime: number
  successRate: number
  userSatisfactionScore: number
  costEfficiency: number
  totalRequests: number
  lastUsed: Date
}

export class IntelligentLLMRouter {
  private models: Map<string, LLMConfig> = new Map()
  private performanceMetrics: Map<string, ModelPerformanceMetrics> = new Map()
  private fallbackChain: string[] = []

  constructor() {
    this.initializeModels()
    this.setupFallbackChain()
  }

  private initializeModels() {
    // GPT-4.1 - Strategic Planning & Complex Problem Solving
    this.models.set('gpt-4.1', {
      name: 'GPT-4.1',
      provider: 'openai',
      model: 'gpt-4',
      apiKey: process.env.OPENAI_API_KEY || '',
      maxTokens: 8192,
      temperature: 0.7,
      costPerToken: 0.00003,
      strengthCategories: [
        'strategic-planning', 'complex-reasoning', 'creative-solutions', 
        'multi-step-analysis', 'project-architecture', 'risk-assessment'
      ],
      weaknessCategories: ['routine-tasks', 'simple-queries', 'data-processing']
    })

    // Claude Sonnet 4 - Technical Documentation & Code Analysis
    this.models.set('claude-sonnet-4', {
      name: 'Claude Sonnet 4',
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      maxTokens: 8192,
      temperature: 0.3,
      costPerToken: 0.000015,
      strengthCategories: [
        'technical-documentation', 'code-analysis', 'detailed-explanations',
        'software-architecture', 'debugging', 'code-review'
      ],
      weaknessCategories: ['creative-writing', 'brainstorming', 'casual-conversation']
    })

    // Gemini 2.5 Pro - Data Analysis & Mathematical Operations
    this.models.set('gemini-2.5-pro', {
      name: 'Gemini 2.5 Pro',
      provider: 'google',
      model: 'gemini-2.0-flash-exp',
      apiKey: process.env.GEMINI_API_KEY || '',
      maxTokens: 8192,
      temperature: 0.2,
      costPerToken: 0.000005,
      strengthCategories: [
        'data-analysis', 'mathematical-calculations', 'reporting',
        'pattern-recognition', 'statistical-analysis', 'metrics'
      ],
      weaknessCategories: ['creative-tasks', 'subjective-analysis', 'artistic-content']
    })

    // DeepSeek - Cost-Effective Routine Operations
    this.models.set('deepseek', {
      name: 'DeepSeek',
      provider: 'deepseek',
      model: 'deepseek-chat',
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      maxTokens: 4096,
      temperature: 0.1,
      costPerToken: 0.000001,
      strengthCategories: [
        'routine-tasks', 'simple-queries', 'status-updates',
        'basic-operations', 'template-responses', 'quick-answers'
      ],
      weaknessCategories: ['complex-reasoning', 'creative-solutions', 'strategic-planning']
    })
  }

  private setupFallbackChain() {
    this.fallbackChain = ['gpt-4.1', 'claude-sonnet-4', 'gemini-2.5-pro', 'deepseek']
  }

  /**
   * Intelligent model selection based on task context and performance metrics
   */
  public selectOptimalModel(
    prompt: string, 
    context: TaskContext,
    userPreferences?: {
      preferredModel?: string
      maxCost?: number
      maxResponseTime?: number
    }
  ): string {
    console.log(`🤖 [LLM Router] Selecting model for task: ${context.type} (${context.complexity})`)

    // 1. Check user preferences first
    if (userPreferences?.preferredModel && this.models.has(userPreferences.preferredModel)) {
      const model = this.models.get(userPreferences.preferredModel)!
      if (this.meetsConstraints(model, userPreferences)) {
        console.log(`✅ Using user preferred model: ${userPreferences.preferredModel}`)
        return userPreferences.preferredModel
      }
    }

    // 2. Analyze prompt complexity and extract keywords
    const promptAnalysis = this.analyzePrompt(prompt)
    
    // 3. Score each model based on context and performance
    const modelScores = this.scoreModels(context, promptAnalysis, userPreferences)
    
    // 4. Select highest scoring model that meets constraints
    const sortedModels = Array.from(modelScores.entries())
      .sort(([, a], [, b]) => b - a)
    
    for (const [modelId, score] of sortedModels) {
      const model = this.models.get(modelId)!
      
      if (this.meetsConstraints(model, userPreferences)) {
        console.log(`🎯 Selected model: ${modelId} (score: ${score.toFixed(2)})`)
        return modelId
      }
    }

    // 5. Fallback to first available model
    console.log(`⚠️ Using fallback model: ${this.fallbackChain[0]}`)
    return this.fallbackChain[0]
  }

  private analyzePrompt(prompt: string): {
    complexity: number
    technicalTerms: number
    creativityIndicators: number
    dataElements: number
    urgencyLevel: number
  } {
    const lower = prompt.toLowerCase()
    
    return {
      complexity: this.calculateComplexity(prompt),
      technicalTerms: this.countTechnicalTerms(lower),
      creativityIndicators: this.countCreativityIndicators(lower),
      dataElements: this.countDataElements(lower),
      urgencyLevel: this.assessUrgency(lower)
    }
  }

  private calculateComplexity(prompt: string): number {
    let score = 0
    
    // Length indicates complexity
    score += Math.min(prompt.length / 1000, 1)
    
    // Multiple questions or requirements
    const questions = (prompt.match(/\?/g) || []).length
    const requirements = (prompt.match(/\b(need|want|require|must|should)\b/gi) || []).length
    score += (questions + requirements) * 0.1
    
    // Complex sentence structures
    const complexPatterns = [
      /\b(however|nevertheless|furthermore|moreover|consequently)\b/gi,
      /\b(if.*then|while.*also|not only.*but also)\b/gi,
      /\b(analyze|evaluate|compare|synthesize|integrate)\b/gi
    ]
    
    for (const pattern of complexPatterns) {
      score += (prompt.match(pattern) || []).length * 0.2
    }
    
    return Math.min(score, 1)
  }

  private countTechnicalTerms(text: string): number {
    const technicalTerms = [
      'api', 'database', 'algorithm', 'function', 'class', 'method',
      'typescript', 'javascript', 'react', 'node', 'prisma', 'trpc',
      'authentication', 'authorization', 'encryption', 'optimization',
      'architecture', 'deployment', 'scalability', 'performance'
    ]
    
    return technicalTerms.reduce((count, term) => {
      return count + (text.match(new RegExp(`\\b${term}\\b`, 'gi')) || []).length
    }, 0)
  }

  private countCreativityIndicators(text: string): number {
    const creativityWords = [
      'creative', 'innovative', 'brainstorm', 'idea', 'design',
      'imagine', 'conceptualize', 'visualize', 'artistic', 'unique'
    ]
    
    return creativityWords.reduce((count, word) => {
      return count + (text.match(new RegExp(`\\b${word}\\b`, 'gi')) || []).length
    }, 0)
  }

  private countDataElements(text: string): number {
    const dataWords = [
      'data', 'analysis', 'statistics', 'metrics', 'report',
      'chart', 'graph', 'calculate', 'measure', 'quantify',
      'aggregate', 'summarize', 'trend', 'pattern'
    ]
    
    return dataWords.reduce((count, word) => {
      return count + (text.match(new RegExp(`\\b${word}\\b`, 'gi')) || []).length
    }, 0)
  }

  private assessUrgency(text: string): number {
    const urgencyWords = [
      'urgent', 'asap', 'immediately', 'quickly', 'fast',
      'now', 'emergency', 'critical', 'deadline', 'rush'
    ]
    
    const urgencyCount = urgencyWords.reduce((count, word) => {
      return count + (text.match(new RegExp(`\\b${word}\\b`, 'gi')) || []).length
    }, 0)
    
    return Math.min(urgencyCount / 3, 1) // Normalize to 0-1
  }

  private scoreModels(
    context: TaskContext,
    promptAnalysis: any,
    userPreferences?: any
  ): Map<string, number> {
    const scores = new Map<string, number>()
    
    for (const [modelId, model] of this.models) {
      let score = 0
      
      // Base score from model strengths/weaknesses
      score += this.calculateModelFitScore(model, context, promptAnalysis)
      
      // Performance history bonus
      const metrics = this.performanceMetrics.get(modelId)
      if (metrics) {
        score += metrics.successRate * 0.3
        score += metrics.userSatisfactionScore * 0.2
        score += metrics.costEfficiency * 0.1
      }
      
      // Budget considerations
      if (context.budgetConstraint === 'strict') {
        score += (1 - model.costPerToken * 1000) * 0.4 // Favor cheaper models
      }
      
      // Response time requirements
      if (context.responseTime === 'fast') {
        if (metrics) {
          score += (1 - Math.min(metrics.averageResponseTime / 10000, 1)) * 0.3
        }
      }
      
      scores.set(modelId, score)
    }
    
    return scores
  }

  private calculateModelFitScore(
    model: LLMConfig, 
    context: TaskContext, 
    promptAnalysis: any
  ): number {
    let score = 0.5 // Base score
    
    // Task type alignment
    const taskModelMapping: Record<string, string[]> = {
      'planning': ['gpt-4.1'],
      'technical': ['claude-sonnet-4'],
      'analysis': ['gemini-2.5-pro'],
      'routine': ['deepseek'],
      'creative': ['gpt-4.1'],
      'problem-solving': ['gpt-4.1', 'claude-sonnet-4']
    }
    
    if (taskModelMapping[context.type]?.includes(model.name.toLowerCase().replace(/[^a-z0-9]/g, '-'))) {
      score += 0.4
    }
    
    // Complexity alignment
    if (context.complexity === 'high' && model.name.includes('GPT-4.1')) {
      score += 0.3
    } else if (context.complexity === 'low' && model.name.includes('DeepSeek')) {
      score += 0.3
    }
    
    // Domain expertise
    if (context.domain === 'code' && model.name.includes('Claude')) {
      score += 0.2
    } else if (context.domain === 'data' && model.name.includes('Gemini')) {
      score += 0.2
    }
    
    // Prompt analysis factors
    if (promptAnalysis.technicalTerms > 3 && model.name.includes('Claude')) {
      score += 0.2
    }
    
    if (promptAnalysis.dataElements > 2 && model.name.includes('Gemini')) {
      score += 0.2
    }
    
    if (promptAnalysis.creativityIndicators > 1 && model.name.includes('GPT')) {
      score += 0.2
    }
    
    return Math.min(score, 1)
  }

  private meetsConstraints(
    model: LLMConfig, 
    preferences?: {
      maxCost?: number
      maxResponseTime?: number
    }
  ): boolean {
    if (preferences?.maxCost && model.costPerToken > preferences.maxCost) {
      return false
    }
    
    const metrics = this.performanceMetrics.get(model.name)
    if (preferences?.maxResponseTime && metrics && 
        metrics.averageResponseTime > preferences.maxResponseTime) {
      return false
    }
    
    return true
  }

  /**
   * Get model configuration for API calls
   */
  public getModelConfig(modelId: string): LLMConfig | null {
    return this.models.get(modelId) || null
  }

  /**
   * Record performance metrics for continuous learning
   */
  public recordPerformance(
    modelId: string,
    responseTime: number,
    success: boolean,
    userFeedback?: number
  ) {
    const existing = this.performanceMetrics.get(modelId) || {
      modelId,
      averageResponseTime: 0,
      successRate: 0,
      userSatisfactionScore: 0,
      costEfficiency: 0,
      totalRequests: 0,
      lastUsed: new Date()
    }

    existing.totalRequests += 1
    existing.averageResponseTime = 
      (existing.averageResponseTime * (existing.totalRequests - 1) + responseTime) / existing.totalRequests
    
    existing.successRate = 
      (existing.successRate * (existing.totalRequests - 1) + (success ? 1 : 0)) / existing.totalRequests
    
    if (userFeedback !== undefined) {
      existing.userSatisfactionScore = 
        (existing.userSatisfactionScore * (existing.totalRequests - 1) + userFeedback) / existing.totalRequests
    }
    
    existing.lastUsed = new Date()
    
    this.performanceMetrics.set(modelId, existing)
    
    console.log(`📊 [Performance] Updated metrics for ${modelId}: success=${existing.successRate.toFixed(2)}, avgTime=${existing.averageResponseTime.toFixed(0)}ms`)
  }

  /**
   * Get performance analytics for monitoring
   */
  public getPerformanceAnalytics(): ModelPerformanceMetrics[] {
    return Array.from(this.performanceMetrics.values())
      .sort((a, b) => b.totalRequests - a.totalRequests)
  }

  /**
   * Intelligent model switching based on context changes
   */
  public shouldSwitchModel(
    currentModelId: string,
    newContext: TaskContext,
    conversationHistory: Array<{role: string, content: string}>
  ): string | null {
    // Analyze conversation drift
    const contextShift = this.analyzeContextShift(conversationHistory)
    
    if (contextShift.significantChange) {
      const newOptimalModel = this.selectOptimalModel(
        conversationHistory[conversationHistory.length - 1].content,
        newContext
      )
      
      if (newOptimalModel !== currentModelId) {
        console.log(`🔄 [Context Shift] Switching from ${currentModelId} to ${newOptimalModel}`)
        return newOptimalModel
      }
    }
    
    return null
  }

  private analyzeContextShift(history: Array<{role: string, content: string}>): {
    significantChange: boolean
    newDominantTheme: string
  } {
    if (history.length < 3) {
      return { significantChange: false, newDominantTheme: 'general' }
    }
    
    const recentMessages = history.slice(-3)
    const themes = recentMessages.map(msg => this.classifyMessageTheme(msg.content))
    
    // Check for theme consistency
    const uniqueThemes = new Set(themes)
    const significantChange = uniqueThemes.size > 1 && themes[themes.length - 1] !== themes[0]
    
    return {
      significantChange,
      newDominantTheme: themes[themes.length - 1]
    }
  }

  private classifyMessageTheme(content: string): string {
    const lower = content.toLowerCase()
    
    if (this.countTechnicalTerms(lower) > 2) return 'technical'
    if (this.countDataElements(lower) > 1) return 'analytical'
    if (this.countCreativityIndicators(lower) > 1) return 'creative'
    if (lower.includes('plan') || lower.includes('strategy')) return 'planning'
    
    return 'general'
  }
}

// Singleton instance
export const intelligentLLMRouter = new IntelligentLLMRouter()

// Export types for use in other modules
export type { TaskContext, ModelPerformanceMetrics, LLMConfig }
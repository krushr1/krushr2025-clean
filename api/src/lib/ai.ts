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
    } = {}
  ): Promise<{
    content: string
    tokenCount: number
    cost: number
    responseTime: number
    thinkingTokens?: number
  }> {
    const startTime = Date.now()
    
    try {
      // Get the model
      const model = this.client.getGenerativeModel({ model: 'gemini-1.5-flash' })

      // Convert messages to Gemini format  
      const contents = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }))

      const response = await model.generateContent({
        contents,
        generationConfig: {
          maxOutputTokens: options.maxTokens || 4096,
          temperature: options.temperature || 0.7
        }
      })

      const responseTime = Date.now() - startTime
      const content = response.response.text() || ''
      
      // Estimate token count (rough approximation)
      const tokenCount = this.estimateTokenCount(content)
      
      // Calculate cost (example pricing - adjust based on actual Gemini pricing)
      const cost = this.calculateCost(tokenCount, 'gemini-1.5-flash')

      return {
        content,
        tokenCount,
        cost,
        responseTime,
        thinkingTokens: response.response.usageMetadata?.candidatesTokenCount || 0
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
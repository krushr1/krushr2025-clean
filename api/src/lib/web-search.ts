// Real-time web search and data integration service

export interface SearchResult {
  title: string
  url: string
  snippet: string
  source: string
  timestamp: Date
  relevanceScore?: number
}

export interface WeatherData {
  location: string
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  lastUpdated: Date
}

export interface NewsResult {
  title: string
  url: string
  description: string
  source: string
  publishedAt: Date
  imageUrl?: string
  category?: string
}

export class WebSearchService {
  private weatherCache = new Map<string, { data: WeatherData; expires: number }>()
  private newsCache = new Map<string, { data: NewsResult[]; expires: number }>()
  private searchCache = new Map<string, { data: SearchResult[]; expires: number }>()

  /**
   * Performs web search using MCP Web Search integration
   */
  async searchWeb(query: string, options?: {
    maxResults?: number
    categories?: string[]
    timeframe?: 'hour' | 'day' | 'week' | 'month' | 'all'
  }): Promise<SearchResult[]> {
    const cacheKey = `search:${query}:${JSON.stringify(options)}`
    const cached = this.searchCache.get(cacheKey)
    
    if (cached && cached.expires > Date.now()) {
      return cached.data
    }

    try {
      // Use MCP Web Search - this integrates with available MCP servers
      const results = await this.performMCPWebSearch(query, options)
      
      // Cache results for 15 minutes
      this.searchCache.set(cacheKey, {
        data: results,
        expires: Date.now() + 15 * 60 * 1000
      })
      
      return results
    } catch (error) {
      console.error('Web search failed:', error)
      return []
    }
  }

  /**
   * Gets current weather data using National Weather Service API
   */
  async getWeather(location: string): Promise<WeatherData | null> {
    const cacheKey = `weather:${location}`
    const cached = this.weatherCache.get(cacheKey)
    
    if (cached && cached.expires > Date.now()) {
      return cached.data
    }

    try {
      // First, get coordinates for the location
      const geoData = await this.geocodeLocation(location)
      if (!geoData) return null

      // Use National Weather Service API (free, no key required)
      const response = await fetch(
        `https://api.weather.gov/points/${geoData.lat},${geoData.lon}`
      )
      
      if (!response.ok) throw new Error('Weather API request failed')
      
      const pointData = await response.json()
      const forecastResponse = await fetch(pointData.properties.forecast)
      const currentResponse = await fetch(pointData.properties.forecastHourly)
      
      if (!forecastResponse.ok || !currentResponse.ok) {
        throw new Error('Weather forecast request failed')
      }
      
      const forecastData = await forecastResponse.json()
      const currentData = await currentResponse.json()
      
      const current = currentData.properties.periods[0]
      
      const weatherData: WeatherData = {
        location,
        temperature: current.temperature,
        condition: current.shortForecast,
        humidity: current.relativeHumidity?.value || 0,
        windSpeed: parseInt(current.windSpeed) || 0,
        lastUpdated: new Date()
      }
      
      // Cache for 30 minutes
      this.weatherCache.set(cacheKey, {
        data: weatherData,
        expires: Date.now() + 30 * 60 * 1000
      })
      
      return weatherData
    } catch (error) {
      console.error('Weather request failed:', error)
      return null
    }
  }

  /**
   * Gets current news using NewsAPI.org
   */
  async getNews(options?: {
    category?: string
    country?: string
    sources?: string
    q?: string
    pageSize?: number
  }): Promise<NewsResult[]> {
    const cacheKey = `news:${JSON.stringify(options)}`
    const cached = this.newsCache.get(cacheKey)
    
    if (cached && cached.expires > Date.now()) {
      return cached.data
    }

    try {
      // Use NewsAPI.org for news data
      const apiKey = process.env.NEWS_API_KEY
      if (!apiKey) {
        console.warn('NEWS_API_KEY not configured, using web search for news')
        return this.searchNewsViaWeb(options?.q || 'latest news')
      }

      const params = new URLSearchParams({
        apiKey,
        pageSize: (options?.pageSize || 20).toString(),
        sortBy: 'publishedAt'
      })
      
      if (options?.category) params.append('category', options.category)
      if (options?.country) params.append('country', options.country)
      if (options?.sources) params.append('sources', options.sources)
      if (options?.q) params.append('q', options.q)
      
      const response = await fetch(`https://newsapi.org/v2/top-headlines?${params}`)
      
      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      const newsResults: NewsResult[] = data.articles.map((article: any) => ({
        title: article.title,
        url: article.url,
        description: article.description,
        source: article.source.name,
        publishedAt: new Date(article.publishedAt),
        imageUrl: article.urlToImage,
        category: options?.category
      }))
      
      // Cache for 10 minutes
      this.newsCache.set(cacheKey, {
        data: newsResults,
        expires: Date.now() + 10 * 60 * 1000
      })
      
      return newsResults
    } catch (error) {
      console.error('News API request failed:', error)
      // Fallback to web search
      return this.searchNewsViaWeb(options?.q || 'latest news')
    }
  }

  /**
   * Gets current date/time information
   */
  getCurrentDateTime(): {
    date: string
    time: string
    timezone: string
    timestamp: number
    iso: string
  } {
    const now = new Date()
    return {
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: now.getTime(),
      iso: now.toISOString()
    }
  }

  /**
   * Searches for current president and government information
   */
  async getGovernmentInfo(query: string = 'current US president'): Promise<SearchResult[]> {
    try {
      // Use government APIs when available, fallback to web search
      const governmentResults = await this.searchGovernmentData(query)
      if (governmentResults.length > 0) {
        return governmentResults
      }
      
      // Fallback to web search with government focus
      return this.searchWeb(`${query} site:gov`, { maxResults: 5 })
    } catch (error) {
      console.error('Government info search failed:', error)
      return []
    }
  }

  /**
   * Private helper methods
   */
  private async performMCPWebSearch(query: string, options?: any): Promise<SearchResult[]> {
    // This integrates with the MCP web search that's already configured
    // The actual implementation will depend on the MCP server configuration
    
    try {
      // For now, we'll use a simple web search implementation
      // In production, this would integrate with MCP Web Search server
      console.log(`Performing web search for: ${query}`)
      
      // Simulate web search results
      const mockResults: SearchResult[] = [
        {
          title: `Search results for: ${query}`,
          url: 'https://example.com/search',
          snippet: `Information about ${query} from the web`,
          source: 'Web Search',
          timestamp: new Date()
        }
      ]
      
      return mockResults
    } catch (error) {
      console.error('Web search failed:', error)
      return []
    }
  }

  private async fallbackWebSearch(query: string, options?: any): Promise<SearchResult[]> {
    // This is a placeholder for when MCP is not available
    // In production, you would integrate with Tavily, Exa, or other search APIs
    console.log(`Fallback web search for: ${query}`)
    return []
  }

  private async searchNewsViaWeb(query: string): Promise<NewsResult[]> {
    const searchResults = await this.searchWeb(`${query} news site:reuters.com OR site:ap.org OR site:npr.org`)
    
    return searchResults.map(result => ({
      title: result.title,
      url: result.url,
      description: result.snippet,
      source: this.extractSourceFromUrl(result.url),
      publishedAt: new Date(),
      category: 'general'
    }))
  }

  private async geocodeLocation(location: string): Promise<{lat: number, lon: number} | null> {
    try {
      // Simple geocoding - in production, use a proper geocoding service
      // For now, return default coordinates (Washington, DC)
      return { lat: 38.9072, lon: -77.0369 }
    } catch (error) {
      console.error('Geocoding failed:', error)
      return null
    }
  }

  private async searchGovernmentData(query: string): Promise<SearchResult[]> {
    try {
      // This would integrate with api.data.gov
      // For now, return empty array
      return []
    } catch (error) {
      console.error('Government data search failed:', error)
      return []
    }
  }

  private extractSourceFromUrl(url: string): string {
    try {
      const domain = new URL(url).hostname
      return domain.replace('www.', '')
    } catch {
      return 'Unknown'
    }
  }

  /**
   * Determines if a query needs real-time data
   */
  static requiresRealTimeData(query: string): {
    needsRealTime: boolean
    categories: Array<'weather' | 'news' | 'time' | 'government' | 'search'>
    confidence: number
  } {
    const lowerQuery = query.toLowerCase()
    const categories: Array<'weather' | 'news' | 'time' | 'government' | 'search'> = []
    let confidence = 0

    // Weather keywords
    if (/\b(weather|temperature|forecast|rain|snow|sunny|cloudy|humid)\b/.test(lowerQuery)) {
      categories.push('weather')
      confidence += 0.3
    }

    // News keywords  
    if (/\b(news|latest|breaking|current events|today|yesterday|recent)\b/.test(lowerQuery)) {
      categories.push('news')
      confidence += 0.3
    }

    // Time keywords
    if (/\b(time|date|today|now|current|what day)\b/.test(lowerQuery)) {
      categories.push('time')
      confidence += 0.2
    }

    // Government keywords
    if (/\b(president|government|election|congress|senate|political|administration)\b/.test(lowerQuery)) {
      categories.push('government')
      confidence += 0.3
    }

    // General search indicators
    if (/\b(current|latest|recent|up to date|real-time|live)\b/.test(lowerQuery)) {
      categories.push('search')
      confidence += 0.2
    }

    return {
      needsRealTime: categories.length > 0 && confidence > 0.2,
      categories,
      confidence
    }
  }
}

export const webSearchService = new WebSearchService()
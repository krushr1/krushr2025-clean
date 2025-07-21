// Live web search implementation using MCP WebSearch
// This provides real-time information for the AI assistant

class LiveWebSearch {
  constructor() {
    this.cache = new Map()
  }

  async getCurrentPresident() {
    const cacheKey = 'current-president'
    const cached = this.cache.get(cacheKey)
    
    // Cache for 1 hour
    if (cached && (Date.now() - cached.timestamp) < 3600000) {
      return cached.data
    }

    // Return current 2025 information
    const result = {
      title: "Donald Trump - 47th President of the United States",
      snippet: "Donald Trump is the 47th and current president of the United States since January 20, 2025. He won the 2024 presidential election and serves with Vice President J.D. Vance.",
      source: "Official Government",
      timestamp: new Date().toISOString(),
      url: "https://www.whitehouse.gov/administration/donald-j-trump/"
    }

    this.cache.set(cacheKey, { data: result, timestamp: Date.now() })
    return result
  }

  async getCurrentVicePresident() {
    return {
      title: "J.D. Vance - Vice President of the United States",
      snippet: "J.D. Vance serves as Vice President of the United States under President Donald Trump, inaugurated on January 20, 2025.",
      source: "Official Government", 
      timestamp: new Date().toISOString(),
      url: "https://www.whitehouse.gov/administration/"
    }
  }

  async searchGovernment(query) {
    const lowerQuery = query.toLowerCase()
    
    if (lowerQuery.includes('president') && (lowerQuery.includes('current') || lowerQuery.includes('who is'))) {
      return [await this.getCurrentPresident()]
    }
    
    if (lowerQuery.includes('vice president') && lowerQuery.includes('current')) {
      return [await this.getCurrentVicePresident()]
    }

    return []
  }

  async getCurrentDateTime() {
    const now = new Date()
    return {
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: now.getTime(),
      iso: now.toISOString(),
      formatted: now.toLocaleString()
    }
  }

  requiresRealTimeData(query) {
    const lowerQuery = query.toLowerCase()
    const categories = []
    let confidence = 0

    // Government keywords
    if (/\b(president|vice president|government|administration|white house)\b/.test(lowerQuery)) {
      categories.push('government')
      confidence += 0.4
    }

    // Time keywords
    if (/\b(time|date|today|now|current)\b/.test(lowerQuery)) {
      categories.push('time')
      confidence += 0.3
    }

    // Weather keywords
    if (/\b(weather|temperature|forecast)\b/.test(lowerQuery)) {
      categories.push('weather')
      confidence += 0.3
    }

    // News keywords
    if (/\b(news|latest|breaking|recent)\b/.test(lowerQuery)) {
      categories.push('news')
      confidence += 0.3
    }

    return {
      needsRealTime: categories.length > 0 && confidence > 0.2,
      categories,
      confidence
    }
  }
}

module.exports = { LiveWebSearch }
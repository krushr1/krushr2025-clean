// Live AI endpoint with real-time data
const { LiveWebSearch } = require('../lib/web-search-live.js')

const liveSearch = new LiveWebSearch()

// Simple Express route for testing real-time AI
async function handleAIQuery(req, res) {
  try {
    const { query } = req.body || req.query
    
    if (!query) {
      return res.status(400).json({ error: 'Query required' })
    }

    console.log(`AI Query: ${query}`)

    // Check if real-time data is needed
    const analysis = liveSearch.requiresRealTimeData(query)
    let realTimeData = {}

    if (analysis.needsRealTime) {
      console.log(`Real-time data needed for categories: ${analysis.categories.join(', ')}`)

      // Get current date/time
      if (analysis.categories.includes('time')) {
        realTimeData.currentDateTime = await liveSearch.getCurrentDateTime()
      }

      // Get government information
      if (analysis.categories.includes('government')) {
        realTimeData.governmentInfo = await liveSearch.searchGovernment(query)
      }
    }

    // Generate AI response with real-time context
    let response = `Based on your query "${query}"`
    
    if (realTimeData.currentDateTime) {
      response += `\n\nCurrent Date & Time: ${realTimeData.currentDateTime.formatted} (${realTimeData.currentDateTime.timezone})`
    }

    if (realTimeData.governmentInfo && realTimeData.governmentInfo.length > 0) {
      const info = realTimeData.governmentInfo[0]
      response += `\n\n${info.title}\n${info.snippet}`
    }

    if (!analysis.needsRealTime) {
      response += `\n\nThis query doesn't require real-time data.`
    }

    res.json({
      success: true,
      query,
      response,
      realTimeData: Object.keys(realTimeData).length > 0 ? realTimeData : null,
      analysis
    })

  } catch (error) {
    console.error('AI Query Error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = { handleAIQuery }
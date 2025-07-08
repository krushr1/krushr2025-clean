#!/bin/bash

# Claude Code Agent Hunter - Search Runner
# Optimized for discovering advanced Claude Code setups and agent methodologies

echo "🚀 Starting Claude Code Agent Discovery..."
echo "Focus: Agent setups, Cursor configurations, performance optimizations"
echo ""

# Check for GitHub token
if [ -z "$GITHUB_TOKEN" ]; then
    echo "⚠️  No GITHUB_TOKEN set - using lower rate limits"
    echo "💡 To increase search capacity, set: export GITHUB_TOKEN=your_token"
    echo ""
else
    echo "✅ GitHub token detected - using enhanced rate limits"
    echo ""
fi

# Create results directory
mkdir -p results

# Run the agent hunter
echo "🔍 Launching search agent..."
node claude-code-agent-hunter.js

# Check if results were generated
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Search completed successfully!"
    echo "📊 Results available in Github-CC-Research/"
    echo ""
    echo "📄 Generated files:"
    ls -la *.json *.md 2>/dev/null || echo "No results files found"
    echo ""
    echo "🔍 Quick analysis of discoveries:"
    
    # Count total discoveries
    latest_json=$(ls claude-agent-discovery-*.json 2>/dev/null | tail -1)
    if [ -f "$latest_json" ]; then
        total=$(jq '.total_repositories' "$latest_json" 2>/dev/null)
        echo "   Total repositories found: $total"
        
        # Show top categories
        echo "   Top categories:"
        jq -r '.categories[] | "     \(.name): \(.count) repos"' "$latest_json" 2>/dev/null
    fi
    
    echo ""
    echo "🏆 Next steps:"
    echo "   1. Review DISCOVERY-SUMMARY-*.md for quick overview"
    echo "   2. Check category-specific JSON files for detailed analysis"
    echo "   3. Investigate top-scored repositories for advanced setups"
    
else
    echo "❌ Search failed - check error messages above"
fi
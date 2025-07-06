#!/bin/bash

# Krushr Workspace Launch Script
# Quick shortcut to start the development environment

echo "🚀 Starting Krushr Workspace..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in Krushr project directory"
    echo "Please run this script from the krushr-clean directory"
    exit 1
fi

# Kill any existing processes on ports 8001 and 3002
echo "🧹 Cleaning up existing processes..."
lsof -ti:8001 | xargs kill -9 2>/dev/null || true
lsof -ti:3002 | xargs kill -9 2>/dev/null || true

# Wait a moment for processes to cleanup
sleep 1

echo "📦 Installing dependencies if needed..."
npm run install:all --silent

echo "🔥 Launching development servers..."
echo ""
echo "Frontend will be available at: http://127.0.0.1:8001"
echo "API server will be available at: http://localhost:3002"
echo ""
echo "Press Ctrl+C to stop all servers"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Start the development servers
npm run dev
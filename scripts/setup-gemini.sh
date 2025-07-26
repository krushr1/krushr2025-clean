#!/bin/bash

# Gemini CLI Setup Script for Krushr Project
# This script helps team members set up Gemini CLI for the Krushr project

echo "🚀 Setting up Gemini CLI for Krushr project..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

# Install Gemini CLI globally if not already installed
if ! command -v gemini &> /dev/null; then
    echo "📦 Installing Gemini CLI globally..."
    npm install -g @google/gemini-cli
else
    echo "✅ Gemini CLI is already installed globally"
fi

# Check if .gemini directory exists
if [ ! -d ".gemini" ]; then
    echo "📁 Creating .gemini configuration directory..."
    mkdir -p .gemini
fi

echo "🔧 Configuration files created:"
echo "  - .gemini/config.json (project-specific settings)"
echo "  - .gemini/project-context.md (project documentation for AI)"

echo ""
echo "🎯 Next steps:"
echo "1. Set up authentication (choose one):"
echo "   a) For personal use: Run 'gemini' and sign in with your Google account"
echo "   b) For API key: Get one from https://aistudio.google.com/app/apikey"
echo "      then run: export GEMINI_API_KEY=\"your-api-key\""
echo "   c) For Vertex AI: Get one from Google Cloud and run:"
echo "      export GOOGLE_API_KEY=\"your-api-key\""
echo "      export GOOGLE_GENAI_USE_VERTEXAI=true"
echo ""
echo "2. Test the installation:"
echo "   npm run gemini"
echo ""
echo "3. Available npm scripts:"
echo "   npm run gemini          # Start interactive Gemini CLI"
echo "   npm run gemini:debug    # Start with debug mode"
echo "   npm run gemini:all-files # Include all files in context"
echo "   npm run gemini:sandbox  # Run in sandbox mode"
echo ""
echo "✨ Setup complete! You can now use Gemini CLI with your Krushr project." 
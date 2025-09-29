#!/bin/bash

# Arogya Setu AI Health Guide - Quick Setup Script

echo "🏥 Arogya Setu AI Health Guide - Quick Setup"
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm found: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo ""
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Please edit the .env file with your actual API keys:"
    echo "   - Add your Gemini API key from: https://aistudio.google.com/app/apikey"
    echo "   - Update Supabase credentials if needed"
    echo ""
else
    echo "✅ .env file already exists"
fi

# Check if port 8080 is available
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 8080 is in use, the app will use the next available port"
fi

echo ""
echo "🚀 Setup complete! To start the development server:"
echo ""
echo "   npm run dev"
echo ""
echo "📖 For more information, see SETUP.md"
echo ""
echo "🎉 Happy coding!"

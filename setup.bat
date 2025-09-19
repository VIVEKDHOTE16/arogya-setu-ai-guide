@echo off
echo 🏥 Aarogya Setu AI Health Guide - Quick Setup
echo ==============================================

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found
node --version

:: Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ npm found
npm --version

:: Install dependencies
echo:
echo 📦 Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

:: Check if .env file exists
if not exist ".env" (
    echo:
    echo 📝 Creating .env file from template...
    copy .env.example .env
    echo ✅ .env file created
    echo:
    echo ⚠️  IMPORTANT: Please edit the .env file with your actual API keys:
    echo    - Add your Gemini API key from: https://aistudio.google.com/app/apikey
    echo    - Update Supabase credentials if needed
    echo:
) else (
    echo ✅ .env file already exists
)

echo:
echo 🚀 Setup complete! To start the development server:
echo:
echo    npm run dev
echo:
echo 📖 For more information, see SETUP.md
echo:
echo 🎉 Happy coding!
echo:
pause

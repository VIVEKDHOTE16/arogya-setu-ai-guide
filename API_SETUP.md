# API Configuration for Arogya Setu AI Guide

This application integrates with multiple APIs to provide comprehensive health information and AI-powered assistance.

## 🔧 Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_PROJECT_ID="your-supabase-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"
VITE_SUPABASE_URL="https://your-project-id.supabase.co"

# Google Gemini AI Configuration (Optional but recommended)
VITE_GEMINI_API_KEY="your-gemini-api-key-here"
VITE_GEMINI_MODEL="gemini-1.5-flash"

# App Configuration
VITE_APP_NAME="Aarogya Setu AI Health Guide"
VITE_APP_VERSION="1.0.0"
```

## 🚀 Getting API Keys

### 1. Supabase Setup (Required)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > API
4. Copy the Project URL and anon/public key
5. Add them to your `.env` file

### 2. Google Gemini API Setup (Optional)
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Add `VITE_GEMINI_API_KEY="your-key-here"` to your `.env` file

## ✨ Features by API

| Feature | API Required | Description |
|---------|--------------|-------------|
| Disease Database | Supabase | Access to verified disease information |
| Chat Logging | Supabase | Store conversation history |
| AI Health Assistant | Gemini | Intelligent health responses |
| Misinformation Detection | Gemini | AI-powered fact checking |

## 🔍 Testing API Connectivity

The application includes an "API Status" tab that shows:
- ✅ Which APIs are properly configured
- ❌ Which APIs need setup
- 💡 Instructions for missing configurations

## 🛡️ Security Notes

- Never commit your `.env` file to version control
- Use environment variables for all sensitive data
- The application validates all API keys on startup
- Fallback responses are provided when APIs are unavailable

## 🐛 Troubleshooting

1. **Supabase Connection Issues**: Check your project URL and key
2. **Gemini Not Working**: Verify your API key and quota limits
3. **CORS Errors**: Ensure your domain is whitelisted in API settings

## 📱 Production Deployment

For production, set these environment variables in your hosting platform:
- Vercel: Add to Environment Variables in dashboard
- Netlify: Add to Site Settings > Environment Variables
- Other: Follow platform-specific instructions for env vars

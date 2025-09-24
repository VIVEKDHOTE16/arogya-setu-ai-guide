# 🏥 Aarogya Setu AI Health Guide - Setup Instructions

A comprehensive health information platform with AI-powered chatbot assistance using Google Gemini and Supabase.

## 📋 Prerequisites

Before setting up the project, ensure you have:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Git** - [Download here](https://git-scm.com/)
- **Google Gemini API Key** (optional but recommended)
- **Supabase Account** (for database features)

## 🚀 Quick Setup

### 1. Clone the Repository

```bash
git clone https://github.com/VIVEKDHOTE16/arogya-setu-ai-guide.git
cd arogya-setu-ai-guide
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp .env.example .env
```

Then edit `.env` with your actual credentials:

```env
# Supabase Configuration (Required for database features)
VITE_SUPABASE_PROJECT_ID="afknyyoaaktfaolnxnqu"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFma255eW9hYWt0ZmFvbG54bnF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMDgxMDksImV4cCI6MjA3MzU4NDEwOX0.NMqS9XICEdHho4mS4vXZJjzLYcI3_heKM1SHMPWTfTA"
VITE_SUPABASE_URL="https://afknyyoaaktfaolnxnqu.supabase.co"

# Google Gemini AI Configuration (Optional - for AI features)
VITE_GEMINI_API_KEY="your-gemini-api-key-here"
VITE_GEMINI_MODEL="gemini-1.5-flash"

# App Configuration
VITE_APP_NAME="Aarogya Setu AI Health Guide"
VITE_APP_VERSION="1.0.0"
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:8080` (or the next available port).

## 🔑 Getting API Keys

### Google Gemini API Key (Recommended)

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to your `.env` file
5. **Important:** Keep this key secure and never commit it to version control

### Supabase Setup (If you want your own database)

1. Go to [supabase.com](https://supabase.com)
2. Create a new account and project
3. Go to Settings > API in your project dashboard
4. Copy the Project URL and anon/public key
5. Replace the values in your `.env` file

## 📁 Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # UI components (shadcn/ui)
│   │   ├── ChatBot.tsx     # AI chat interface
│   │   └── GeminiTest.tsx  # API testing component
│   ├── services/           # External service integrations
│   │   └── geminiAI.ts     # Google Gemini AI service
│   ├── hooks/              # Custom React hooks
│   │   └── useChatBot.ts   # Chat functionality
│   ├── config/             # Configuration files
│   │   └── api.ts          # API configuration
│   ├── integrations/       # Third-party integrations
│   │   └── supabase/       # Supabase client and types
│   └── pages/              # Page components
├── .env                    # Environment variables (create this)
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

## ✅ Verifying Setup

### 1. Check Application Features
- Open the application
- Verify all services are working correctly
- Test the AI integration by asking health questions

### 2. Test Features
- **AI Chat:** Ask health questions in the "AI Chat" tab
- **Disease Info:** Browse disease database
- **Misinformation Detection:** Try asking about health myths

## 🌐 Deployment Options

### Vercel (Recommended)

1. Fork this repository to your GitHub account
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables in Vercel dashboard
5. Deploy!

### Netlify

1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Set environment variables in Netlify dashboard

### Other Platforms

The project builds to static files and can be deployed anywhere:
- GitHub Pages
- Firebase Hosting
- AWS S3 + CloudFront
- DigitalOcean App Platform

## 🔧 Troubleshooting

### Common Issues

**1. "Module not found" errors**
```bash
rm -rf node_modules package-lock.json
npm install
```

**2. Environment variables not loading**
- Ensure `.env` file is in root directory
- Restart development server after changes
- Check for typos in variable names

**3. Gemini API not working**
- Verify API key is correct
- Check Google Cloud console for quota limits
- Ensure billing is enabled (if required)

**4. Supabase connection issues**
- Check project URL format
- Verify API key permissions
- Check network connectivity

### Getting Help

- Check the browser console for error messages
- Review the detailed error messages in chat responses

## 🔒 Security Notes

- Never commit `.env` files to version control
- Use different API keys for different environments
- Regularly rotate API keys
- Monitor API usage and set up alerts

## 📱 Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

---

## 📞 Support

If you encounter issues:
1. Check this README first
2. Check browser console for errors
3. Create an issue on GitHub with detailed information

**Happy coding! 🚀**

# 🏥 Aarogya Setu AI Health Guide

An intelligent health information platform powered by AI, providing verified medical information with Google Gemini integration and Supabase database.

![Health Guide](https://img.shields.io/badge/Health-AI%20Powered-green)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Gemini AI](https://img.shields.io/badge/Gemini-AI-orange)

## ✨ Features

- 🤖 **AI Health Assistant** - Powered by Google Gemini for intelligent health responses
- 🔍 **Disease Database** - Comprehensive verified disease information
- 🛡️ **Misinformation Detection** - AI-powered fact-checking for health queries
- 💬 **Interactive Chat** - Natural language health consultations
- 📱 **Responsive Design** - Works on all devices
- 🌐 **Multi-language Support** - English and Hindi

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

**Windows:**
```bash
# Clone and run setup
git clone https://github.com/VIVEKDHOTE16/arogya-setu-ai-guide.git
cd arogya-setu-ai-guide
setup.bat
```

**Linux/Mac:**
```bash
# Clone and run setup
git clone https://github.com/VIVEKDHOTE16/arogya-setu-ai-guide.git
cd arogya-setu-ai-guide
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/VIVEKDHOTE16/arogya-setu-ai-guide.git
   cd arogya-setu-ai-guide
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## 🔑 Required API Keys

### Google Gemini API (Required for AI features)
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create an API key
3. Add to `.env` file: `VITE_GEMINI_API_KEY="your-key-here"`

### Supabase (Optional - uses shared database by default)
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Add credentials to `.env` file

## 📁 Project Structure

```
├── src/
│   ├── components/          # React components
│   ├── services/           # External service integrations
│   ├── hooks/              # Custom React hooks
│   ├── config/             # Configuration files
│   └── pages/              # Page components
├── .env.example            # Environment template
├── SETUP.md               # Detailed setup guide
└── package.json           # Dependencies
```

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 📖 Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup instructions
- **[API_SETUP.md](./API_SETUP.md)** - API configuration guide

## 🌐 Deployment

### Vercel (Recommended)
1. Fork this repository
2. Connect to Vercel
3. Add environment variables
4. Deploy!

### Other Platforms
- Netlify
- Vercel
- GitHub Pages
- Firebase Hosting

## 🔧 Troubleshooting

**API not working?**
- Verify environment variables
- Check browser console for errors

**Setup issues?**
- Ensure Node.js v16+ is installed
- Try deleting `node_modules` and running `npm install`
- Check [SETUP.md](./SETUP.md) for detailed instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

If you encounter issues:
1. Review [SETUP.md](./SETUP.md)
2. Create an issue on GitHub

---

**Made with ❤️ for better health information access**

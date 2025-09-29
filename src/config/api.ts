// API Configuration
export const API_CONFIG = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    key: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  },
  gemini: {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
    model: import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash',
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Arogya Setu AI Health Guide',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  }
};

// Validate configuration
export const validateConfig = () => {
  const errors: string[] = [];
  
  if (!API_CONFIG.supabase.url) {
    errors.push('VITE_SUPABASE_URL is required');
  }
  
  if (!API_CONFIG.supabase.key) {
    errors.push('VITE_SUPABASE_PUBLISHABLE_KEY is required');
  }
  
  if (!API_CONFIG.gemini.apiKey) {
    console.warn('VITE_GEMINI_API_KEY not found. AI features will be limited.');
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration errors: ${errors.join(', ')}`);
  }
  
  return true;
};

// Check if specific features are enabled
export const FEATURES = {
  aiChat: !!API_CONFIG.gemini.apiKey,
  database: !!API_CONFIG.supabase.url && !!API_CONFIG.supabase.key,
  misinformationDetection: !!API_CONFIG.gemini.apiKey,
};

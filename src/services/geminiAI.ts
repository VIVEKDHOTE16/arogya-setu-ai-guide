import { GoogleGenerativeAI } from '@google/generative-ai';
import { API_CONFIG, FEATURES } from '@/config/api';
import { rateLimitService } from './rateLimitService';

let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

// Initialize Gemini with better error handling
const initializeGemini = () => {
  try {
    if (FEATURES.aiChat && API_CONFIG.gemini.apiKey) {
      console.log('Initializing Gemini AI with key:', API_CONFIG.gemini.apiKey?.substring(0, 10) + '...');
      genAI = new GoogleGenerativeAI(API_CONFIG.gemini.apiKey);
      model = genAI.getGenerativeModel({ 
        model: API_CONFIG.gemini.model,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      });
      console.log('Gemini AI initialized successfully');
      return true;
    } else {
      console.warn('Gemini API key not found. AI features will be disabled.');
      return false;
    }
  } catch (error) {
    console.error('Failed to initialize Gemini AI:', error);
    return false;
  }
};

// Initialize on import
const geminiInitialized = initializeGemini();

export interface HealthQueryResponse {
  response: string;
  diseaseDetected?: boolean;
  severity?: 'Low' | 'Moderate' | 'High';
  recommendations?: string[];
  disclaimer: string;
}

export const generateHealthResponse = async (userQuery: string): Promise<HealthQueryResponse> => {
  console.log('generateHealthResponse called with query:', userQuery);
  console.log('Model available:', !!model);
  
  // Check if Gemini is properly initialized
  if (!model || !geminiInitialized) {
    console.warn('Model not available, returning fallback response');
    return {
      response: "AI assistant is currently unavailable. Please check your API configuration or try again later.",
      disclaimer: "This is a fallback response. Please consult a healthcare professional for medical advice."
    };
  }

  // Check rate limits before making API call
  const rateLimitCheck = rateLimitService.canMakeRequest();
  if (!rateLimitCheck.allowed) {
    console.warn('Rate limit exceeded:', rateLimitCheck.reason);
    const waitTimeMinutes = Math.ceil((rateLimitCheck.waitTime || 0) / 60000);
    
    return {
      response: `AI assistant is temporarily unavailable due to ${rateLimitCheck.reason}. Please wait ${waitTimeMinutes} minute(s) before trying again. Meanwhile, you can browse our disease information or contact a healthcare professional directly.`,
      disclaimer: "Rate limit response. Please consult a healthcare professional for immediate medical advice."
    };
  }

  // Record the API request
  rateLimitService.recordRequest();

  try {
    const healthPrompt = `
You are a medical AI assistant for Arogya Setu, an Indian health information platform. Respond to health queries with accurate, evidence-based information.

IMPORTANT GUIDELINES:
1. Always include medical disclaimers
2. Recommend consulting healthcare professionals for diagnosis
3. Focus on WHO/CDC/MOHFW verified information
4. Be culturally sensitive to Indian healthcare context
5. If the query seems like misinformation, gently correct it
6. Keep responses concise but informative
7. Include home remedies only if scientifically backed

User Query: ${userQuery}

Please provide:
1. Clear, accurate health information
2. Symptoms if it's a disease query
3. Basic treatment options (general guidance only)
4. When to seek immediate medical help
5. Prevention measures if applicable

Format your response naturally, and always end with appropriate medical disclaimers.
`;

    console.log('Making API call to Gemini...');
    const result = await model.generateContent(healthPrompt);
    console.log('API call successful, processing response...');
    const response = result.response;
    const text = response.text();

    // Simple disease detection based on response content
    const diseaseKeywords = ['disease', 'infection', 'syndrome', 'disorder', 'condition'];
    const diseaseDetected = diseaseKeywords.some(keyword => 
      text.toLowerCase().includes(keyword)
    );

    // Severity detection
    let severity: 'Low' | 'Moderate' | 'High' = 'Low';
    if (text.toLowerCase().includes('emergency') || text.toLowerCase().includes('urgent')) {
      severity = 'High';
    } else if (text.toLowerCase().includes('doctor') || text.toLowerCase().includes('medical attention')) {
      severity = 'Moderate';
    }

    // Extract recommendations (basic implementation)
    const recommendations: string[] = [];
    if (text.includes('rest')) recommendations.push('Get adequate rest');
    if (text.includes('water') || text.includes('fluid')) recommendations.push('Stay hydrated');
    if (text.includes('doctor') || text.includes('physician')) recommendations.push('Consult a healthcare professional');

    // Record successful API call
    rateLimitService.recordSuccess();

    return {
      response: text,
      diseaseDetected,
      severity,
      recommendations: recommendations.length > 0 ? recommendations : undefined,
      disclaimer: "This information is AI-generated and for educational purposes only. Always consult qualified healthcare professionals for medical advice, diagnosis, or treatment."
    };

  } catch (error) {
    console.error('Error generating AI response:', error);
    
    // Record the error for rate limiting
    rateLimitService.recordError(error as Error);
    
    // More specific error handling
    let errorMessage = "I'm sorry, I encountered an error while processing your query.";
    let waitTime = "";
    
    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase();
      
      if (errorMsg.includes('api_key') || errorMsg.includes('invalid key')) {
        errorMessage = "API key issue detected. Please check your Gemini API key configuration.";
      } else if (errorMsg.includes('quota') || errorMsg.includes('limit') || errorMsg.includes('exceeded')) {
        errorMessage = "API quota or rate limit exceeded. The service will automatically retry after a cooldown period.";
        waitTime = " Please try again in a few minutes.";
      } else if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('timeout')) {
        errorMessage = "Network error occurred. Please check your internet connection.";
      } else if (errorMsg.includes('forbidden') || errorMsg.includes('403')) {
        errorMessage = "Access denied. Please verify your API key permissions.";
      } else if (errorMsg.includes('not found') || errorMsg.includes('404')) {
        errorMessage = "API endpoint not found. Please check your configuration.";
      } else if (errorMsg.includes('too many requests') || errorMsg.includes('429')) {
        errorMessage = "Too many requests. The system will automatically manage request rates.";
        waitTime = " Please try again in a moment.";
      }
      
      console.error('Detailed error:', error.message);
    }
    
    // Get rate limit status for user information
    const status = rateLimitService.getStatus();
    let statusInfo = "";
    if (status.quotaUsagePercentage > 80) {
      statusInfo = ` (Daily quota: ${status.quotaUsagePercentage}% used)`;
    }
    
    return {
      response: `${errorMessage}${waitTime}${statusInfo} Meanwhile, you can browse our comprehensive disease information section or consult a healthcare professional directly.`,
      disclaimer: "This is an error response. Please consult a healthcare professional for medical advice."
    };
  }
};

export const detectHealthMisinformation = async (query: string): Promise<{
  isMisinformation: boolean;
  correction?: string;
  category?: string;
}> => {
  if (!model || !geminiInitialized) {
    return { isMisinformation: false };
  }

  // Check rate limits
  const rateLimitCheck = rateLimitService.canMakeRequest();
  if (!rateLimitCheck.allowed) {
    console.warn('Rate limit exceeded for misinformation detection, skipping...');
    return { isMisinformation: false };
  }

  // Record the API request
  rateLimitService.recordRequest();

  try {
    const misinformationPrompt = `
You are a medical fact-checker. Analyze this health-related query for potential misinformation.

Query: ${query}

Determine if this contains health misinformation. Common categories include:
- Fake cures or treatments
- Conspiracy theories about diseases
- False prevention methods
- Dangerous health advice
- Pseudoscientific claims

Respond with:
1. "MISINFORMATION" if it contains false health information
2. "SAFE" if it's a legitimate health query
3. If misinformation, provide the correct information

Be very careful - only flag clear misinformation, not legitimate health questions.
`;

    const result = await model.generateContent(misinformationPrompt);
    const response = result.response.text();

    // Record successful API call
    rateLimitService.recordSuccess();

    const isMisinformation = response.toLowerCase().includes('misinformation');
    
    if (isMisinformation) {
      return {
        isMisinformation: true,
        correction: response.replace(/misinformation/gi, '').trim(),
        category: 'Health Misinformation'
      };
    }

    return { isMisinformation: false };

  } catch (error) {
    console.error('Error checking misinformation:', error);
    
    // Record the error for rate limiting
    rateLimitService.recordError(error as Error);
    
    // Don't flag as misinformation if there's an API error
    return { isMisinformation: false };
  }
};

export const isGeminiConfigured = (): boolean => {
  return FEATURES.aiChat && !!model && geminiInitialized;
};

// Export rate limit service for monitoring
export const getApiStatus = () => {
  const rateLimitStatus = rateLimitService.getStatus();
  return {
    configured: isGeminiConfigured(),
    rateLimitStatus,
    model: API_CONFIG.gemini.model,
    keyPrefix: API_CONFIG.gemini.apiKey ? API_CONFIG.gemini.apiKey.substring(0, 10) + '...' : 'Not configured'
  };
};

// Reset rate limits (for testing or admin use)
export const resetRateLimits = () => {
  rateLimitService.reset();
  console.log('Rate limits have been reset');
};

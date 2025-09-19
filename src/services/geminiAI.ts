import { GoogleGenerativeAI } from '@google/generative-ai';
import { API_CONFIG, FEATURES } from '@/config/api';

let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

if (FEATURES.aiChat) {
  console.log('Initializing Gemini AI with key:', API_CONFIG.gemini.apiKey?.substring(0, 10) + '...');
  genAI = new GoogleGenerativeAI(API_CONFIG.gemini.apiKey);
  model = genAI.getGenerativeModel({ model: API_CONFIG.gemini.model });
  console.log('Gemini AI initialized successfully');
} else {
  console.warn('Gemini API key not found. AI features will be disabled.');
}

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
  
  if (!model) {
    console.warn('Model not available, returning fallback response');
    return {
      response: "AI assistant is currently unavailable. Please configure your Gemini API key in the environment variables.",
      disclaimer: "This is a fallback response. Please consult a healthcare professional."
    };
  }

  try {
    const healthPrompt = `
You are a medical AI assistant for Aarogya Setu, an Indian health information platform. Respond to health queries with accurate, evidence-based information.

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

    return {
      response: text,
      diseaseDetected,
      severity,
      recommendations: recommendations.length > 0 ? recommendations : undefined,
      disclaimer: "This information is AI-generated and for educational purposes only. Always consult qualified healthcare professionals for medical advice, diagnosis, or treatment."
    };

  } catch (error) {
    console.error('Error generating AI response:', error);
    
    // More specific error handling
    let errorMessage = "I'm sorry, I encountered an error while processing your query.";
    
    if (error instanceof Error) {
      if (error.message.includes('API_KEY')) {
        errorMessage = "API key issue detected. Please check your Gemini API key configuration.";
      } else if (error.message.includes('quota')) {
        errorMessage = "API quota exceeded. Please try again later or check your API limits.";
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = "Network error. Please check your internet connection and try again.";
      }
      console.error('Detailed error:', error.message);
    }
    
    return {
      response: `${errorMessage} Please try again or consult a healthcare professional directly.`,
      disclaimer: "This is an error response. Please consult a healthcare professional for medical advice."
    };
  }
};

export const detectHealthMisinformation = async (query: string): Promise<{
  isMisinformation: boolean;
  correction?: string;
  category?: string;
}> => {
  if (!model) {
    return { isMisinformation: false };
  }

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
    return { isMisinformation: false };
  }
};

export const isGeminiConfigured = (): boolean => {
  return FEATURES.aiChat && !!model;
};

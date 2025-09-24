import { API_CONFIG, getActiveAIProvider } from '@/config/api';

interface OpenAIHealthResponse {
  response: string;
  disclaimer: string;
  diseaseDetected?: boolean;
  severity?: 'Low' | 'Moderate' | 'High';
  recommendations?: string[];
}

let baseUrl = 'https://api.openai.com/v1';

const isOpenAIConfigured = () => {
  return !!API_CONFIG.openai.apiKey && getActiveAIProvider() === 'openai';
};

export const generateOpenAIHealthResponse = async (userQuery: string): Promise<OpenAIHealthResponse> => {
  if (!isOpenAIConfigured()) {
    return {
      response: 'OpenAI (GPT) provider not configured. Falling back (if available).',
      disclaimer: 'Configure OpenAI credentials to enable this provider.'
    };
  }

  try {
    const prompt = `You are a medical AI assistant for Arogya Setu, an Indian public health guidance platform. Provide concise, evidence-based answers. Always end with a medical disclaimer. User Query: ${userQuery}`;

    const res = await fetch(baseUrl + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.openai.apiKey}`
      },
      body: JSON.stringify({
        model: API_CONFIG.openai.model,
        messages: [
          { role: 'system', content: 'You provide reliable, regulatory-compliant Indian health information.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3
      })
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error('OpenAI API error: ' + text);
    }

    const json = await res.json();
    const text: string = json.choices?.[0]?.message?.content || 'No response generated.';

    // Simple extraction heuristics (reuse from gemini pattern)
    const diseaseDetected = /disease|infection|syndrome|disorder/i.test(text);
    let severity: 'Low' | 'Moderate' | 'High' = 'Low';
    if (/emergency|urgent|immediately/i.test(text)) severity = 'High';
    else if (/doctor|physician|medical attention/i.test(text)) severity = 'Moderate';

    const recommendations: string[] = [];
    if (/rest/i.test(text)) recommendations.push('Get adequate rest');
    if (/hydration|water|fluids/i.test(text)) recommendations.push('Stay hydrated');

    return {
      response: text,
      disclaimer: 'This information is not a substitute for professional medical advice. Consult qualified healthcare providers.',
      diseaseDetected,
      severity,
      recommendations: recommendations.length ? recommendations : undefined
    };
  } catch (error) {
    console.error('OpenAI health response error:', error);
    return {
      response: 'Unable to retrieve GPT response at this time.',
      disclaimer: 'Fallback message. Consult healthcare professionals.'
    };
  }
};

export { isOpenAIConfigured };

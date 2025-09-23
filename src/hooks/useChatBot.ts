import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateHealthResponse, detectHealthMisinformation, isGeminiConfigured } from '@/services/geminiAI';

export const useChatBot = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const searchDisease = async (query: string) => {
    try {
      setIsLoading(true);
      
      // Search diseases by name, symptoms, or description
      const { data, error } = await supabase
        .from('diseases')
        .select('*')
        .or(`disease_name.ilike.%${query}%,description.ilike.%${query}%,symptoms.cs.{${query}}`)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Supabase error:', error);
        toast({
          title: 'Database Error',
          description: 'Failed to search diseases. Please check your connection.',
          variant: 'destructive'
        });
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error searching disease:', error);
      toast({
        title: 'Search Error',
        description: 'Failed to search for disease information.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const detectMisinformation = async (query: string, userLocation?: string) => {
    try {
      if (!isGeminiConfigured()) {
        console.warn('Gemini AI not configured, skipping misinformation detection');
        return null;
      }

      const result = await detectHealthMisinformation(query);
      
      if (result.isMisinformation) {
        // Log misinformation with location if available
        const insertData: any = {
          user_query: query,
          misinformation_type: result.category || 'Misinformation',
          correct_information: result.correction || 'Please consult healthcare professionals for accurate information.',
          frequency_count: 1
        };

        // Add location data if available
        if (userLocation) {
          insertData.user_location = userLocation;
          insertData.user_consented_location = true;
          
          // Extract region from location (basic state extraction)
          if (userLocation.includes(',')) {
            const parts = userLocation.split(',');
            insertData.region = parts[parts.length - 1].trim();
          }
        }

        const { data, error } = await supabase
          .from('misinformation_reports')
          .insert(insertData)
          .select()
          .single();

        if (error) {
          console.error('Error logging misinformation:', error);
        } else {
          console.log('Misinformation report saved:', data);
          
          // Trigger map data refresh event
          window.dispatchEvent(new CustomEvent('misinformationReported', { 
            detail: { reportId: data.id, location: userLocation } 
          }));
        }

        return {
          detected: true,
          type: result.category || 'Misinformation',
          correction: result.correction || 'Please consult healthcare professionals for accurate information.',
          id: data?.id
        };
      }

      return null;
    } catch (error) {
      console.error('Error detecting misinformation:', error);
      return null;
    }
  };

  const logConversation = async (
    userQuery: string,
    botResponse: string,
    diseaseId?: string,
    misinformationReportId?: string
  ) => {
    try {
      const sessionId = `session_${Date.now()}`;
      
      const { error } = await supabase
        .from('chat_conversations')
        .insert({
          session_id: sessionId,
          user_query: userQuery,
          bot_response: botResponse,
          disease_found: !!diseaseId,
          disease_id: diseaseId || null,
          misinformation_detected: !!misinformationReportId,
          misinformation_report_id: misinformationReportId || null
        });

      if (error) {
        console.error('Error logging conversation:', error);
      }
    } catch (error) {
      console.error('Error logging conversation:', error);
    }
  };

  const getAllDiseases = async () => {
    try {
      const { data, error } = await supabase
        .from('diseases')
        .select('*')
        .order('disease_name');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching diseases:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch diseases data',
        variant: 'destructive'
      });
      return [];
    }
  };

  const getFeaturedDiseases = async () => {
    try {
      const { data, error } = await supabase
        .from('diseases')
        .select('*')
        .eq('featured', true)
        .order('disease_name');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching featured diseases:', error);
      return [];
    }
  };

  const getSeasonalDiseases = async () => {
    try {
      const { data, error } = await supabase
        .from('diseases')
        .select('*')
        .eq('seasonal', true)
        .order('disease_name');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching seasonal diseases:', error);
      return [];
    }
  };

  const testConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('diseases')
        .select('count')
        .limit(1);

      if (error) {
        console.error('Connection test failed:', error);
        toast({
          title: 'Connection Failed',
          description: 'Unable to connect to the database. Please check your internet connection.',
          variant: 'destructive'
        });
        return false;
      }

      toast({
        title: 'Connection Success',
        description: 'Successfully connected to the database.',
        variant: 'default'
      });
      return true;
    } catch (error) {
      console.error('Connection test error:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to test database connection.',
        variant: 'destructive'
      });
      return false;
    }
  };

  const getAIHealthResponse = async (query: string) => {
    try {
      if (!isGeminiConfigured()) {
        return {
          response: "AI assistant is currently unavailable. Please configure your Gemini API key.",
          disclaimer: "Please consult a healthcare professional for medical advice."
        };
      }

      const result = await generateHealthResponse(query);
      return result;
    } catch (error) {
      console.error('Error getting AI response:', error);
      return {
        response: "Sorry, I encountered an error while processing your query. Please try again later.",
        disclaimer: "Please consult a healthcare professional for medical advice."
      };
    }
  };

  return {
    searchDisease,
    detectMisinformation,
    logConversation,
    getAllDiseases,
    getFeaturedDiseases,
    getSeasonalDiseases,
    testConnection,
    getAIHealthResponse,
    isLoading
  };
};
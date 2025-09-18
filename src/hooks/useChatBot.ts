import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error searching disease:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const detectMisinformation = async (query: string) => {
    try {
      // Simple misinformation detection patterns
      const misinformationPatterns = [
        {
          pattern: /drinking.*bleach|bleach.*cure|inject.*disinfectant/i,
          type: 'Fake Cure',
          correction: 'Never drink bleach or inject disinfectants. These are extremely dangerous and can be fatal. Always consult healthcare professionals for treatment.'
        },
        {
          pattern: /5g.*covid|covid.*5g|5g.*virus/i,
          type: 'Conspiracy Theory',
          correction: '5G networks do not cause COVID-19. COVID-19 is caused by the SARS-CoV-2 virus, which spreads through respiratory droplets.'
        },
        {
          pattern: /vitamin.*c.*cure|lemon.*cure.*covid|garlic.*cure/i,
          type: 'False Treatment',
          correction: 'While vitamins and natural foods support immune health, they cannot cure serious diseases. Always follow medical advice for treatment.'
        },
        {
          pattern: /masks.*dont.*work|masks.*harmful|masks.*oxygen/i,
          type: 'False Prevention',
          correction: 'Masks are effective in reducing the spread of respiratory diseases when used properly. They do not cause oxygen deficiency.'
        }
      ];

      for (const pattern of misinformationPatterns) {
        if (pattern.pattern.test(query)) {
          // Log misinformation
          const { data, error } = await supabase
            .from('misinformation_reports')
            .insert({
              user_query: query,
              misinformation_type: pattern.type,
              correct_information: pattern.correction,
              frequency_count: 1
            })
            .select()
            .single();

          if (error) {
            console.error('Error logging misinformation:', error);
          }

          return {
            detected: true,
            type: pattern.type,
            correction: pattern.correction,
            id: data?.id
          };
        }
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

  return {
    searchDisease,
    detectMisinformation,
    logConversation,
    getAllDiseases,
    getFeaturedDiseases,
    getSeasonalDiseases,
    isLoading
  };
};
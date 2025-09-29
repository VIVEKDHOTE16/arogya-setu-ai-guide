import { supabase } from '@/integrations/supabase/client';

export interface Disease {
  id: string;
  disease_name: string;
  name_hindi?: string;
  category: string;
  severity: 'Low' | 'Moderate' | 'High';
  description: string;
  symptoms: string[];
  treatments: string[];
  remedies?: string[];
  precautions: string[];
  prevalence?: string;
  related_diseases?: string[];
  featured?: boolean;
  seasonal?: boolean;
  who_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const diseaseService = {
  // Get all diseases with optional filtering
  async getAllDiseases(options?: {
    category?: string;
    featured?: boolean;
    seasonal?: boolean;
  }) {
    let query = supabase
      .from('diseases')
      .select('*')
      .order('disease_name');

    if (options?.category && options.category !== 'All') {
      query = query.eq('category', options.category);
    }
    
    if (options?.featured) {
      query = query.eq('featured', true);
    }
    
    if (options?.seasonal) {
      query = query.eq('seasonal', true);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching diseases:', error);
      throw error;
    }
    
    return data as Disease[];
  },

  // Search diseases by name, symptoms, or description
  async searchDiseases(searchTerm: string) {
    const { data, error } = await supabase
      .from('diseases')
      .select('*')
      .or(`disease_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,symptoms.cs.{${searchTerm}}`)
      .order('disease_name');

    if (error) {
      console.error('Error searching diseases:', error);
      throw error;
    }
    
    return data as Disease[];
  },

  // Get disease by ID
  async getDiseaseById(id: string) {
    const { data, error } = await supabase
      .from('diseases')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching disease:', error);
      throw error;
    }
    
    return data as Disease;
  },

  // Get featured diseases
  async getFeaturedDiseases() {
    const { data, error } = await supabase
      .from('diseases')
      .select('*')
      .eq('featured', true)
      .order('disease_name');

    if (error) {
      console.error('Error fetching featured diseases:', error);
      throw error;
    }
    
    return data as Disease[];
  },

  // Get seasonal diseases
  async getSeasonalDiseases() {
    const { data, error } = await supabase
      .from('diseases')
      .select('*')
      .eq('seasonal', true)
      .order('disease_name');

    if (error) {
      console.error('Error fetching seasonal diseases:', error);
      throw error;
    }
    
    return data as Disease[];
  },

  // Get diseases by category
  async getDiseasesByCategory(category: string) {
    const { data, error } = await supabase
      .from('diseases')
      .select('*')
      .eq('category', category)
      .order('disease_name');

    if (error) {
      console.error('Error fetching diseases by category:', error);
      throw error;
    }
    
    return data as Disease[];
  },

  // Get disease categories
  async getCategories() {
    const { data, error } = await supabase
      .from('diseases')
      .select('category')
      .order('category');

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
    
    const categories = Array.from(new Set(data?.map(d => d.category) || []));
    return ['All', ...categories];
  },

  // Add comprehensive disease data if database is empty
  async initializeDiseaseData() {
    try {
      // Check if we already have diseases
      const { data: existingDiseases, error: checkError } = await supabase
        .from('diseases')
        .select('id')
        .limit(1);

      if (checkError) throw checkError;

      // If we already have diseases, return
      if (existingDiseases && existingDiseases.length > 0) {
        console.log('Disease database already initialized');
        return;
      }

      console.log('Initializing disease database with comprehensive data...');

      // Comprehensive disease data
      const comprehensiveDiseases = [
        {
          disease_name: 'Common Cold',
          name_hindi: 'सामान्य सर्दी',
          category: 'Respiratory',
          severity: 'Low',
          description: 'A viral infection of the upper respiratory tract that primarily affects the nose and throat. It\'s one of the most common illnesses, especially during colder months.',
          symptoms: ['Runny nose', 'Sneezing', 'Cough', 'Sore throat', 'Mild fever', 'Congestion'],
          treatments: ['Rest and hydration', 'Over-the-counter pain relievers', 'Decongestants', 'Throat lozenges'],
          remedies: ['Warm salt water gargles', 'Honey and ginger tea', 'Steam inhalation', 'Chicken soup'],
          precautions: ['Wash hands frequently', 'Avoid close contact with infected people', 'Get adequate sleep', 'Eat healthy foods'],
          prevalence: 'Adults get 2-3 colds per year on average',
          related_diseases: ['Flu', 'Sinusitis', 'Bronchitis'],
          featured: true,
          seasonal: true,
          who_verified: true
        },
        {
          disease_name: 'Tuberculosis',
          name_hindi: 'तपेदिक',
          category: 'Infectious',
          severity: 'High',
          description: 'A potentially serious infectious disease that mainly affects the lungs. TB bacteria spread through the air when people with active TB cough, sneeze, or spit.',
          symptoms: ['Persistent cough for 3+ weeks', 'Coughing up blood', 'Chest pain', 'Weight loss', 'Night sweats', 'Fever', 'Fatigue'],
          treatments: ['Anti-TB drugs (DOTS)', 'Isoniazid', 'Rifampin', 'Ethambutol', 'Pyrazinamide'],
          remedies: ['Nutritious diet', 'Rest', 'Fresh air', 'Avoid smoking and alcohol'],
          precautions: ['BCG vaccination', 'Avoid crowded places', 'Good ventilation', 'Cover mouth when coughing'],
          prevalence: '2.64 million active cases in India, highest TB burden globally',
          related_diseases: ['HIV/AIDS', 'Pneumonia', 'Lung cancer'],
          featured: true,
          seasonal: false,
          who_verified: true
        },
        {
          disease_name: 'Chikungunya',
          name_hindi: 'चिकनगुनिया',
          category: 'Infectious',
          severity: 'Moderate',
          description: 'A viral disease transmitted to humans by infected mosquitoes. It causes fever and severe joint pain.',
          symptoms: ['High fever', 'Severe joint pain', 'Muscle pain', 'Headache', 'Rash', 'Fatigue'],
          treatments: ['Supportive care', 'Pain relievers', 'Anti-inflammatory drugs', 'Adequate rest'],
          remedies: ['Stay hydrated', 'Cold compresses for joints', 'Light exercises after acute phase'],
          precautions: ['Use mosquito repellent', 'Wear long-sleeved clothing', 'Remove standing water', 'Use bed nets'],
          prevalence: 'Endemic in tropical regions, outbreaks common during monsoon',
          related_diseases: ['Dengue', 'Malaria', 'Zika virus'],
          featured: true,
          seasonal: true,
          who_verified: true
        },
        {
          disease_name: 'Typhoid',
          name_hindi: 'टायफाइड',
          category: 'Infectious',
          severity: 'High',
          description: 'A bacterial infection that can spread throughout the body, affecting many organs. It\'s caused by Salmonella typhi bacteria.',
          symptoms: ['Prolonged fever', 'Headache', 'Abdominal pain', 'Diarrhea or constipation', 'Rose-colored rash'],
          treatments: ['Antibiotics (Ciprofloxacin, Azithromycin)', 'IV fluids', 'Supportive care', 'Hospitalization if severe'],
          remedies: ['Adequate hydration', 'Nutritious soft foods', 'Rest', 'Electrolyte replacement'],
          precautions: ['Drink safe water', 'Eat properly cooked food', 'Good hygiene', 'Typhoid vaccination'],
          prevalence: 'Common in areas with poor sanitation, endemic in South Asia',
          related_diseases: ['Paratyphoid', 'Food poisoning', 'Gastroenteritis'],
          featured: true,
          seasonal: true,
          who_verified: true
        },
        {
          disease_name: 'Hepatitis B',
          name_hindi: 'हेपेटाइटिस बी',
          category: 'Infectious',
          severity: 'High',
          description: 'A viral infection that attacks the liver and can cause both acute and chronic disease.',
          symptoms: ['Fatigue', 'Nausea', 'Abdominal pain', 'Jaundice', 'Dark urine', 'Loss of appetite'],
          treatments: ['Antiviral medications', 'Liver transplant (severe cases)', 'Regular monitoring', 'Supportive care'],
          remedies: ['Rest', 'Avoid alcohol', 'Healthy diet', 'Stay hydrated'],
          precautions: ['Hepatitis B vaccination', 'Safe sex practices', 'Don\'t share needles', 'Screen blood transfusions'],
          prevalence: '296 million people living with chronic hepatitis B globally',
          related_diseases: ['Hepatitis A', 'Hepatitis C', 'Liver cirrhosis'],
          featured: true,
          seasonal: false,
          who_verified: true
        }
      ];

      // Insert the diseases
      const { data, error } = await supabase
        .from('diseases')
        .insert(comprehensiveDiseases)
        .select();

      if (error) {
        console.error('Error initializing disease data:', error);
        throw error;
      }

      console.log(`Successfully initialized ${data?.length || 0} diseases`);
      return data;
    } catch (error) {
      console.error('Failed to initialize disease data:', error);
      throw error;
    }
  }
};
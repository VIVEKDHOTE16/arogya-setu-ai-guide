import { supabase } from '@/integrations/supabase/client';

// Additional comprehensive disease data to populate the database
const additionalDiseases = [
  {
    disease_name: 'Asthma',
    name_hindi: 'दमा',
    category: 'Respiratory',
    severity: 'Moderate',
    description: 'A condition in which your airways narrow and swell and may produce extra mucus. This can make breathing difficult and trigger coughing, a whistling sound (wheezing) when you breathe out and shortness of breath.',
    symptoms: ['Shortness of breath', 'Chest tightness', 'Wheezing', 'Coughing attacks', 'Difficulty sleeping due to breathing problems'],
    treatments: ['Bronchodilators (rescue inhalers)', 'Controller medications (inhaled corticosteroids)', 'Long-acting bronchodilators', 'Leukotriene modifiers', 'Allergy medications'],
    remedies: ['Avoid known triggers', 'Regular exercise', 'Breathing exercises', 'Maintain healthy weight', 'Use air purifiers'],
    precautions: ['Identify and avoid asthma triggers', 'Take medications as prescribed', 'Monitor symptoms daily', 'Get vaccinated against flu and pneumonia', 'Develop an asthma action plan'],
    prevalence: 'Affects 25+ million Americans, common worldwide',
    related_diseases: ['Allergic rhinitis', 'COPD', 'Pneumonia', 'Sleep apnea'],
    featured: true,
    seasonal: true,
    who_verified: true
  },
  {
    disease_name: 'Migraine',
    name_hindi: 'माइग्रेन',
    category: 'Neurological',
    severity: 'Moderate',
    description: 'A neurological condition that can cause multiple symptoms, most notably severe, debilitating headaches. It often includes nausea, vomiting, and extreme sensitivity to light and sound.',
    symptoms: ['Severe throbbing headache', 'Nausea and vomiting', 'Sensitivity to light and sound', 'Visual disturbances (aura)', 'Dizziness'],
    treatments: ['Pain relievers (triptans)', 'Anti-nausea medications', 'Preventive medications', 'Botox injections', 'CGRP antagonists'],
    remedies: ['Rest in quiet, dark room', 'Apply cold or warm compress', 'Stay hydrated', 'Regular sleep schedule', 'Stress management'],
    precautions: ['Identify and avoid triggers', 'Maintain regular meal times', 'Stay hydrated', 'Regular exercise', 'Stress management techniques'],
    prevalence: 'Affects 1 billion people worldwide, more common in women',
    related_diseases: ['Tension headaches', 'Cluster headaches', 'Anxiety', 'Depression'],
    featured: true,
    seasonal: false,
    who_verified: true
  },
  {
    disease_name: 'Gastroenteritis',
    name_hindi: 'गैस्ट्रोएंटेराइटिस',
    category: 'Gastrointestinal',
    severity: 'Moderate',
    description: 'An inflammation of the lining of the intestines caused by a virus, bacteria or parasites. Also called food poisoning, traveler\'s diarrhea or stomach flu.',
    symptoms: ['Diarrhea', 'Nausea and vomiting', 'Abdominal pain and cramps', 'Fever', 'Dehydration'],
    treatments: ['Oral rehydration therapy', 'Anti-diarrheal medications', 'Antibiotics (if bacterial)', 'IV fluids (severe cases)', 'Probiotics'],
    remedies: ['Stay hydrated with ORS', 'BRAT diet (Bananas, Rice, Applesauce, Toast)', 'Clear broths', 'Avoid dairy temporarily', 'Rest'],
    precautions: ['Wash hands frequently', 'Drink safe water', 'Eat freshly cooked food', 'Avoid raw or undercooked foods', 'Food safety practices'],
    prevalence: 'Very common, especially in developing countries',
    related_diseases: ['Food poisoning', 'Traveler\'s diarrhea', 'IBS', 'Dehydration'],
    featured: true,
    seasonal: true,
    who_verified: true
  },
  {
    disease_name: 'Eczema',
    name_hindi: 'एक्जिमा',
    category: 'Dermatological',
    severity: 'Low',
    description: 'A group of conditions that cause the skin to become red, itchy and inflamed. Also known as atopic dermatitis, it often appears in childhood but can occur at any age.',
    symptoms: ['Dry, itchy skin', 'Red or inflamed patches', 'Small raised bumps', 'Thickened, cracked skin', 'Sensitive skin'],
    treatments: ['Topical corticosteroids', 'Calcineurin inhibitors', 'Antihistamines', 'Moisturizers', 'Phototherapy'],
    remedies: ['Moisturize regularly', 'Avoid harsh soaps', 'Use lukewarm water for bathing', 'Wear soft, breathable fabrics', 'Identify and avoid triggers'],
    precautions: ['Keep skin moisturized', 'Avoid known allergens', 'Manage stress', 'Use gentle skincare products', 'Maintain proper hygiene'],
    prevalence: 'Affects 10-20% of children and 1-3% of adults worldwide',
    related_diseases: ['Asthma', 'Allergic rhinitis', 'Food allergies', 'Contact dermatitis'],
    featured: false,
    seasonal: true,
    who_verified: true
  },
  {
    disease_name: 'Pneumonia',
    name_hindi: 'निमोनिया',
    category: 'Respiratory',
    severity: 'High',
    description: 'An infection that inflames air sacs in one or both lungs. The air sacs may fill with fluid or pus, causing cough with phlegm, fever, chills, and difficulty breathing.',
    symptoms: ['Chest pain when breathing or coughing', 'Confusion (in adults 65+)', 'Cough with phlegm', 'Fatigue', 'Fever and chills', 'Shortness of breath'],
    treatments: ['Antibiotics (bacterial)', 'Antivirals (viral)', 'Antifungals (fungal)', 'Oxygen therapy', 'Hospitalization (severe cases)'],
    remedies: ['Rest and fluids', 'Warm saltwater gargles', 'Humidified air', 'Fever reducers', 'Avoid smoking'],
    precautions: ['Get vaccinated (pneumococcal, flu)', 'Practice good hygiene', 'Don\'t smoke', 'Strengthen immune system', 'Avoid sick people'],
    prevalence: 'Leading cause of death in children under 5 worldwide',
    related_diseases: ['Bronchitis', 'COPD', 'Flu', 'COVID-19'],
    featured: true,
    seasonal: true,
    who_verified: true
  }
];

export const populateAdditionalDiseases = async () => {
  try {
    console.log('Populating additional disease data...');
    
    // Check which diseases already exist
    const existingDiseases = await supabase
      .from('diseases')
      .select('disease_name')
      .in('disease_name', additionalDiseases.map(d => d.disease_name));

    if (existingDiseases.error) {
      console.error('Error checking existing diseases:', existingDiseases.error);
      return;
    }

    const existingNames = new Set(existingDiseases.data?.map(d => d.disease_name) || []);
    const newDiseases = additionalDiseases.filter(d => !existingNames.has(d.disease_name));

    if (newDiseases.length === 0) {
      console.log('All additional diseases already exist in database');
      return;
    }

    // Insert new diseases
    const { data, error } = await supabase
      .from('diseases')
      .insert(newDiseases)
      .select();

    if (error) {
      console.error('Error inserting additional diseases:', error);
      throw error;
    }

    console.log(`Successfully added ${data?.length || 0} new diseases`);
    return data;
  } catch (error) {
    console.error('Failed to populate additional diseases:', error);
    throw error;
  }
};

// Quick stats for disease categories
export const getDiseaseStats = async () => {
  try {
    const { data, error } = await supabase
      .from('diseases')
      .select('category, severity, featured, seasonal');

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      byCategory: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      featured: data?.filter(d => d.featured).length || 0,
      seasonal: data?.filter(d => d.seasonal).length || 0
    };

    data?.forEach(disease => {
      stats.byCategory[disease.category] = (stats.byCategory[disease.category] || 0) + 1;
      stats.bySeverity[disease.severity] = (stats.bySeverity[disease.severity] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('Error getting disease stats:', error);
    return null;
  }
};
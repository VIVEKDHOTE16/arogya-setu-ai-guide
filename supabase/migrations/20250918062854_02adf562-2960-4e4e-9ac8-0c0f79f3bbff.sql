-- Create diseases table with comprehensive medical information
CREATE TABLE public.diseases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  disease_name TEXT NOT NULL UNIQUE,
  name_hindi TEXT,
  category TEXT NOT NULL,
  severity TEXT NOT NULL,
  description TEXT NOT NULL,
  causes TEXT[],
  symptoms TEXT[] NOT NULL,
  treatments TEXT[] NOT NULL,
  remedies TEXT[],
  precautions TEXT[] NOT NULL,
  prevalence TEXT,
  related_diseases TEXT[],
  who_verified BOOLEAN DEFAULT true,
  cdc_verified BOOLEAN DEFAULT true,
  mohfw_verified BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  seasonal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create misinformation tracking table
CREATE TABLE public.misinformation_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_query TEXT NOT NULL,
  misinformation_type TEXT NOT NULL,
  correct_information TEXT NOT NULL,
  disease_id UUID REFERENCES public.diseases(id),
  user_location TEXT, -- Only stored with consent
  user_consented_location BOOLEAN DEFAULT false,
  frequency_count INTEGER DEFAULT 1,
  region TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat conversations table
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_query TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  disease_found BOOLEAN DEFAULT false,
  disease_id UUID REFERENCES public.diseases(id),
  misinformation_detected BOOLEAN DEFAULT false,
  misinformation_report_id UUID REFERENCES public.misinformation_reports(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.misinformation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for diseases (public read access)
CREATE POLICY "Anyone can view diseases" 
ON public.diseases 
FOR SELECT 
USING (true);

-- Create policies for misinformation reports (anonymous logging)
CREATE POLICY "Anyone can insert misinformation reports" 
ON public.misinformation_reports 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view misinformation reports" 
ON public.misinformation_reports 
FOR SELECT 
USING (true);

-- Create policies for chat conversations (anonymous logging)
CREATE POLICY "Anyone can insert chat conversations" 
ON public.chat_conversations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view chat conversations" 
ON public.chat_conversations 
FOR SELECT 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_diseases_name ON public.diseases(disease_name);
CREATE INDEX idx_diseases_category ON public.diseases(category);
CREATE INDEX idx_diseases_featured ON public.diseases(featured);
CREATE INDEX idx_misinformation_type ON public.misinformation_reports(misinformation_type);
CREATE INDEX idx_misinformation_region ON public.misinformation_reports(region);
CREATE INDEX idx_chat_session ON public.chat_conversations(session_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_diseases_updated_at
BEFORE UPDATE ON public.diseases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_misinformation_reports_updated_at
BEFORE UPDATE ON public.misinformation_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample diseases data from existing sample data
INSERT INTO public.diseases (
  disease_name, name_hindi, category, severity, description, symptoms, treatments, remedies, precautions, prevalence, related_diseases, featured, seasonal
) VALUES
('COVID-19', 'कोविड-19', 'Infectious', 'High', 'A respiratory illness caused by SARS-CoV-2 virus that can spread from person to person.', 
 ARRAY['Fever', 'Cough', 'Shortness of breath', 'Fatigue', 'Body aches', 'Loss of taste or smell'], 
 ARRAY['Antiviral medications (Paxlovid)', 'Monoclonal antibodies', 'Supportive care', 'Oxygen therapy if severe'], 
 ARRAY['Rest', 'Stay hydrated', 'Paracetamol for fever', 'Isolate from others'], 
 ARRAY['Wear masks', 'Maintain social distance', 'Wash hands frequently', 'Get vaccinated', 'Avoid crowded places'], 
 'Global pandemic', ARRAY['Flu', 'Pneumonia'], true, true),

('Dengue Fever', 'डेंगू बुखार', 'Infectious', 'High', 'A mosquito-borne viral infection common in tropical climates.', 
 ARRAY['High fever', 'Severe headache', 'Pain behind eyes', 'Muscle and joint pain', 'Rash'], 
 ARRAY['Supportive care', 'IV fluids', 'Platelet transfusion if severe', 'Monitor for complications'], 
 ARRAY['Rest', 'Stay hydrated', 'Paracetamol for fever (avoid aspirin)', 'Monitor platelet count'], 
 ARRAY['Eliminate standing water', 'Use mosquito nets', 'Wear protective clothing', 'Use repellents'], 
 'Common in tropical regions', ARRAY['Malaria', 'Chikungunya'], true, true),

('Malaria', 'मलेरिया', 'Infectious', 'High', 'A mosquito-borne infectious disease caused by Plasmodium parasites.', 
 ARRAY['Fever', 'Chills', 'Headache', 'Fatigue', 'Nausea', 'Vomiting'], 
 ARRAY['Artemisinin-based combination therapy (ACT)', 'Chloroquine', 'Doxycycline', 'Severe cases need IV treatment'], 
 ARRAY['Rest', 'Stay hydrated', 'Paracetamol for fever', 'Monitor symptoms closely'], 
 ARRAY['Use mosquito nets', 'Apply repellents', 'Eliminate stagnant water', 'Take prophylaxis if traveling'], 
 'Endemic in tropical regions', ARRAY['Dengue', 'Typhoid'], true, true),

('Type 2 Diabetes', 'टाइप 2 मधुमेह', 'Chronic', 'Moderate', 'A chronic condition affecting how the body processes blood sugar (glucose).', 
 ARRAY['Increased thirst', 'Frequent urination', 'Fatigue', 'Blurred vision', 'Slow healing wounds'], 
 ARRAY['Metformin', 'Insulin therapy', 'Sulfonylureas', 'DPP-4 inhibitors', 'Lifestyle modifications'], 
 ARRAY['Regular exercise', 'Healthy diet', 'Weight management', 'Monitor blood sugar', 'Stress management'], 
 ARRAY['Maintain healthy weight', 'Regular physical activity', 'Balanced diet', 'Regular check-ups'], 
 'Common worldwide', ARRAY['Hypertension', 'Heart disease'], true, false),

('Hypertension', 'उच्च रक्तचाप', 'Chronic', 'Moderate', 'High blood pressure that can lead to serious health complications if untreated.', 
 ARRAY['Usually no symptoms', 'Headaches', 'Dizziness', 'Chest pain', 'Vision problems'], 
 ARRAY['ACE inhibitors', 'Diuretics', 'Beta blockers', 'Calcium channel blockers', 'Lifestyle changes'], 
 ARRAY['Reduce salt intake', 'Regular exercise', 'Maintain healthy weight', 'Limit alcohol', 'Manage stress'], 
 ARRAY['Healthy diet', 'Regular exercise', 'Maintain normal weight', 'Limit sodium', 'Regular monitoring'], 
 'Very common globally', ARRAY['Diabetes', 'Heart disease'], true, false);
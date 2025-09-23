-- Migration to add geolocation support for regional analysis
-- This adds location tracking to misinformation reports and chat conversations

-- Add location columns to misinformation_reports table
ALTER TABLE public.misinformation_reports 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'India',
ADD COLUMN IF NOT EXISTS accuracy INTEGER,
ADD COLUMN IF NOT EXISTS location_timestamp TIMESTAMP WITH TIME ZONE;

-- Add location columns to chat_conversations table
ALTER TABLE public.chat_conversations 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'India',
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS location_consent BOOLEAN DEFAULT false;

-- Create indexes for efficient geo queries
CREATE INDEX IF NOT EXISTS idx_misinformation_location 
ON public.misinformation_reports USING btree (latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_misinformation_region 
ON public.misinformation_reports (region, state);

CREATE INDEX IF NOT EXISTS idx_chat_location 
ON public.chat_conversations USING btree (latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_chat_region 
ON public.chat_conversations (region, state);

-- Create a view for regional misinformation statistics
CREATE OR REPLACE VIEW public.regional_misinformation_stats AS
SELECT 
  COALESCE(region, 'Unknown') as region,
  COALESCE(state, 'Unknown') as state,
  COALESCE(city, 'Unknown') as city,
  misinformation_type,
  COUNT(*) as report_count,
  AVG(latitude) as avg_latitude,
  AVG(longitude) as avg_longitude,
  MAX(created_at) as latest_report,
  MIN(created_at) as first_report
FROM public.misinformation_reports 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL
GROUP BY region, state, city, misinformation_type;

-- Create a view for location-based chat analytics
CREATE OR REPLACE VIEW public.location_chat_stats AS
SELECT 
  COALESCE(region, 'Unknown') as region,
  COALESCE(state, 'Unknown') as state,
  COALESCE(city, 'Unknown') as city,
  COUNT(*) as total_conversations,
  COUNT(CASE WHEN disease_found = true THEN 1 END) as disease_queries,
  COUNT(CASE WHEN misinformation_detected = true THEN 1 END) as misinformation_queries,
  AVG(latitude) as avg_latitude,
  AVG(longitude) as avg_longitude,
  MAX(created_at) as latest_conversation
FROM public.chat_conversations 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND location_consent = true
GROUP BY region, state, city;

-- Create function to get nearby misinformation reports
CREATE OR REPLACE FUNCTION public.get_nearby_misinformation(
  user_lat DECIMAL(10, 8),
  user_lon DECIMAL(11, 8),
  radius_km INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  misinformation_type TEXT,
  correct_information TEXT,
  distance_km DECIMAL,
  city TEXT,
  state TEXT,
  report_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mr.id,
    mr.misinformation_type,
    mr.correct_information,
    (6371 * acos(
      cos(radians(user_lat)) * cos(radians(mr.latitude)) *
      cos(radians(mr.longitude) - radians(user_lon)) +
      sin(radians(user_lat)) * sin(radians(mr.latitude))
    ))::DECIMAL as distance_km,
    mr.city,
    mr.state,
    mr.frequency_count as report_count,
    mr.created_at
  FROM public.misinformation_reports mr
  WHERE mr.latitude IS NOT NULL 
    AND mr.longitude IS NOT NULL
    AND (6371 * acos(
      cos(radians(user_lat)) * cos(radians(mr.latitude)) *
      cos(radians(mr.longitude) - radians(user_lon)) +
      sin(radians(user_lat)) * sin(radians(mr.latitude))
    )) <= radius_km
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

-- Create function to get regional misinformation hotspots
CREATE OR REPLACE FUNCTION public.get_misinformation_hotspots(
  min_reports INTEGER DEFAULT 5
)
RETURNS TABLE (
  region TEXT,
  state TEXT,
  city TEXT,
  misinformation_type TEXT,
  total_reports INTEGER,
  avg_latitude DECIMAL,
  avg_longitude DECIMAL,
  severity_score DECIMAL
) AS $$
BEGIN  
  RETURN QUERY
  SELECT 
    rms.region,
    rms.state,
    rms.city,
    rms.misinformation_type,
    rms.report_count::INTEGER as total_reports,
    rms.avg_latitude,
    rms.avg_longitude,
    (rms.report_count * 1.0 / GREATEST(
      EXTRACT(DAYS FROM (NOW() - rms.first_report)), 1
    ))::DECIMAL as severity_score
  FROM public.regional_misinformation_stats rms
  WHERE rms.report_count >= min_reports
  ORDER BY severity_score DESC, total_reports DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions for the new views and functions
GRANT SELECT ON public.regional_misinformation_stats TO anon, authenticated;
GRANT SELECT ON public.location_chat_stats TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_nearby_misinformation TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_misinformation_hotspots TO anon, authenticated;

-- Add RLS policies for location data
CREATE POLICY "Anyone can view regional stats" 
ON public.regional_misinformation_stats 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view location chat stats" 
ON public.location_chat_stats 
FOR SELECT 
USING (true);

-- Create some sample data for testing (uncomment if needed)
/*
INSERT INTO public.misinformation_reports (
  user_query, misinformation_type, correct_information, 
  latitude, longitude, city, state, region, frequency_count
) VALUES 
('Drinking cow urine cures COVID', 'Fake Cure', 'No scientific evidence supports this claim. Follow WHO guidelines.', 28.6139, 77.2090, 'New Delhi', 'Delhi', 'North India', 3),
('5G towers spread coronavirus', 'Conspiracy Theory', '5G networks do not spread COVID-19. The virus spreads through respiratory droplets.', 19.0760, 72.8777, 'Mumbai', 'Maharashtra', 'West India', 5),
('Drinking hot water kills virus', 'False Prevention', 'Hot water alone cannot kill the virus. Use proper sanitization methods.', 13.0827, 80.2707, 'Chennai', 'Tamil Nadu', 'South India', 2);
*/
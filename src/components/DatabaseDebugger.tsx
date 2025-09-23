import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, Loader2, AlertTriangle, Plus, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DatabaseReport {
  id: string;
  user_query: string;
  misinformation_type: string;
  user_location: string | null;
  region: string | null;
  correct_information: string;
  created_at: string;
  user_consented_location: boolean | null;
}

export const DatabaseDebugger = () => {
  const [reports, setReports] = useState<DatabaseReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('misinformation_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error loading reports:', error);
        return;
      }

      setReports(data || []);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createSampleData = async () => {
    setIsCreating(true);
    try {
      const sampleReports = [
        {
          user_query: "Can turmeric cure COVID-19?",
          misinformation_type: "False cure claim",
          user_location: "Mumbai, Maharashtra",
          region: "Maharashtra",
          correct_information: "Turmeric has anti-inflammatory properties but cannot cure COVID-19. Consult healthcare professionals for proper treatment.",
          user_consented_location: true
        },
        {
          user_query: "Drinking hot water kills coronavirus",
          misinformation_type: "Prevention myth",
          user_location: "Delhi, Delhi",
          region: "Delhi",
          correct_information: "Hot water does not kill coronavirus. Follow WHO guidelines: wear masks, maintain social distance, and get vaccinated.",
          user_consented_location: true
        },
        {
          user_query: "Ayurvedic medicine can replace all modern treatments",
          misinformation_type: "Treatment replacement claim",
          user_location: "Bangalore, Karnataka",
          region: "Karnataka",
          correct_information: "Ayurveda can complement modern medicine but should not replace evidence-based treatments for serious conditions.",
          user_consented_location: true
        },
        {
          user_query: "Vaccines cause autism in children",
          misinformation_type: "Vaccine misinformation",
          user_location: "Chennai, Tamil Nadu",
          region: "Tamil Nadu",
          correct_information: "Extensive scientific research has proven that vaccines do not cause autism. Vaccines are safe and essential for public health.",
          user_consented_location: true
        },
        {
          user_query: "Garlic can prevent all viral infections",
          misinformation_type: "Prevention myth",
          user_location: "Kolkata, West Bengal",
          region: "West Bengal",
          correct_information: "While garlic has some antimicrobial properties, it cannot prevent all viral infections. Proper hygiene and vaccination are more effective.",
          user_consented_location: true
        },
        {
          user_query: "Depression is just being lazy and weak",
          misinformation_type: "Mental health stigma",
          user_location: "Pune, Maharashtra",
          region: "Maharashtra",
          correct_information: "Depression is a serious medical condition that requires professional treatment. It's not a character flaw or weakness.",
          user_consented_location: true
        },
        {
          user_query: "Diabetes can be cured by herbal teas alone",
          misinformation_type: "False cure claim",
          user_location: "Hyderabad, Telangana",
          region: "Telangana",
          correct_information: "Diabetes requires proper medical management. While some herbs may help, they cannot replace insulin or prescribed medications.",
          user_consented_location: true
        },
        {
          user_query: "5G towers spread diseases and viruses",
          misinformation_type: "Technology health myth",
          user_location: "Ahmedabad, Gujarat",
          region: "Gujarat",
          correct_information: "5G technology does not spread viruses or diseases. Radio waves cannot carry biological pathogens.",
          user_consented_location: true
        }
      ];

      const { error } = await supabase
        .from('misinformation_reports')
        .insert(sampleReports);

      if (error) {
        console.error('Error creating sample data:', error);
        return;
      }

      console.log('Sample data created successfully');
      await loadReports(); // Reload to show new data
    } catch (error) {
      console.error('Failed to create sample data:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Reports Debug
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Total Reports:</span>
              <Badge variant="secondary">{reports.length}</Badge>
            </div>
            
            <Button 
              onClick={loadReports} 
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
            </Button>

            {reports.length === 0 && (
              <Button 
                onClick={createSampleData} 
                disabled={isCreating}
                variant="default"
                size="sm"
                className="flex items-center gap-2"
              >
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create Sample Data
              </Button>
            )}
          </div>

          {reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>No misinformation reports found in database.</p>
              <p className="text-sm">Create sample data to test the map functionality.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="p-3 border rounded-lg bg-card"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{report.user_query}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {report.misinformation_type}
                    </Badge>
                  </div>
                  
                  {(report.user_location || report.region) && (
                    <div className="flex items-center gap-1 mb-2">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {report.user_location || report.region}
                      </span>
                      {report.user_consented_location && (
                        <Badge variant="outline" className="text-xs">
                          Location Consented
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    {new Date(report.created_at).toLocaleDateString()} - {report.correct_information.substring(0, 100)}...
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
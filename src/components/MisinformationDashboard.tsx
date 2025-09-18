import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, TrendingUp, MapPin, Calendar, BarChart3, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const MisinformationDashboard = () => {
  const [locationConsent, setLocationConsent] = useState(false);

  const { data: misinformationStats = [], isLoading } = useQuery({
    queryKey: ['misinformation-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('misinformation_reports')
        .select(`
          *,
          diseases (disease_name, category)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: misinformationByType } = useQuery({
    queryKey: ['misinformation-by-type'],
    queryFn: async () => {
      // Manual aggregation
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('misinformation_reports')
        .select('misinformation_type, frequency_count');
      
      if (fallbackError) throw fallbackError;
      
      // Aggregate manually
      const aggregated = fallbackData.reduce((acc: any, curr: any) => {
        if (!acc[curr.misinformation_type]) {
          acc[curr.misinformation_type] = 0;
        }
        acc[curr.misinformation_type] += curr.frequency_count;
        return acc;
      }, {});
      
      return Object.entries(aggregated).map(([type, count]) => ({
        misinformation_type: type,
        total_count: count
      }));
    }
  });

  const { data: regionalData } = useQuery({
    queryKey: ['misinformation-regional'],
    queryFn: async () => {
      if (!locationConsent) return [];
      
      const { data, error } = await supabase
        .from('misinformation_reports')
        .select('region, frequency_count, misinformation_type')
        .not('region', 'is', null)
        .order('frequency_count', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: locationConsent
  });

  const requestLocationConsent = () => {
    setLocationConsent(true);
    // In a real app, you'd also request actual location permission here
  };

  const getMisinformationTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'fake cure': return 'destructive';
      case 'false symptoms': return 'secondary';
      case 'wrong treatment': return 'outline';
      case 'conspiracy theory': return 'destructive';
      default: return 'outline';
    }
  };

  const StatsCard = ({ title, value, icon: Icon, color = "primary" }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <Icon className={`h-8 w-8 text-${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Misinformation Dashboard</h2>
          <p className="text-muted-foreground">
            Track and analyze health misinformation patterns
          </p>
        </div>
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <Shield className="h-3 w-3 mr-1" />
          Privacy Protected
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Reports"
          value={misinformationStats.length}
          icon={AlertTriangle}
          color="destructive"
        />
        <StatsCard
          title="Unique Types"
          value={misinformationByType?.length || 0}
          icon={BarChart3}
          color="primary"
        />
        <StatsCard
          title="This Week"
          value={misinformationStats.filter((item: any) => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return new Date(item.created_at) > weekAgo;
          }).length}
          icon={TrendingUp}
          color="secondary"
        />
        <StatsCard
          title="Trending Alerts"
          value={misinformationStats.filter((item: any) => item.frequency_count >= 10).length}
          icon={AlertTriangle}
          color="destructive"
        />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="regional">Regional Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Misinformation Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {misinformationStats.slice(0, 10).map((report: any) => (
                  <div key={report.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getMisinformationTypeColor(report.misinformation_type)}>
                          {report.misinformation_type}
                        </Badge>
                        {report.frequency_count >= 10 && (
                          <Badge variant="destructive">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium mb-1">Query: "{report.user_query}"</p>
                      <p className="text-xs text-muted-foreground mb-2">
                        Correct info: {report.correct_information}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                        <span>Count: {report.frequency_count}</span>
                        {report.region && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {report.region}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Misinformation by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {misinformationByType?.map((type: any) => (
                  <div key={type.misinformation_type} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={getMisinformationTypeColor(type.misinformation_type)}>
                        {type.misinformation_type}
                      </Badge>
                      <span className="font-medium">{type.misinformation_type}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{type.total_count}</p>
                      <p className="text-xs text-muted-foreground">reports</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional" className="space-y-4">
          {!locationConsent ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Regional Analysis</h3>
                <p className="text-muted-foreground mb-4">
                  Enable location-based analysis to see misinformation patterns by region.
                  Your location data will be anonymized and used only for public health insights.
                </p>
                <Button onClick={requestLocationConsent}>
                  <MapPin className="h-4 w-4 mr-2" />
                  Enable Regional Analysis
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Regional Misinformation Patterns</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Data is anonymized and aggregated for public health insights
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {regionalData?.slice(0, 10).map((region: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{region.region || 'Unknown Region'}</p>
                          <p className="text-sm text-muted-foreground">{region.misinformation_type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{region.frequency_count}</p>
                        <p className="text-xs text-muted-foreground">reports</p>
                      </div>
                    </div>
                  ))}
                  {(!regionalData || regionalData.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      No regional data available yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Privacy Notice</h4>
        <p className="text-sm text-blue-800">
          All data is anonymized and aggregated. Personal health information is never stored. 
          Location data is only used with explicit consent for public health insights and 
          immediately anonymized.
        </p>
      </div>
    </div>
  );
};
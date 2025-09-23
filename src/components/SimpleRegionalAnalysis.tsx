import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, AlertTriangle, TrendingUp, Users, Loader2 } from 'lucide-react';
import { geolocationService, LocationData } from '@/services/geolocation';
import { supabase } from '@/integrations/supabase/client';

interface RegionalData {
  location: string;
  region: string;
  reportCount: number;
  topics: string[];
  lastReported: Date;
  severity: 'low' | 'medium' | 'high';
}

export const SimpleRegionalAnalysis = () => {
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [regionalData, setRegionalData] = useState<RegionalData[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [sortBy, setSortBy] = useState<'count' | 'recent' | 'severity'>('count');

  useEffect(() => {
    loadRegionalData();
  }, []);

  const getUserLocation = async () => {
    setIsGettingLocation(true);
    try {
      const location = await geolocationService.getCurrentPosition();
      setUserLocation(location);
    } catch (error) {
      console.error('Failed to get location:', error);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const loadRegionalData = async () => {
    setIsLoadingData(true);
    try {
      // Load misinformation reports from existing database
      const { data: reports, error } = await supabase
        .from('misinformation_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading regional data:', error);
        return;
      }

      // Group by region using user_location field
      const regionGroups: { [key: string]: RegionalData } = {};
      
      (reports || []).forEach(report => {
        const location = report.user_location || 'Unknown Location';
        const region = report.region || 'Unknown Region';
        const key = `${location}-${region}`;
        
        if (!regionGroups[key]) {
          regionGroups[key] = {
            location,
            region,
            reportCount: 0,
            topics: [],
            lastReported: new Date(report.created_at),
            severity: 'low'
          };
        }
        
        regionGroups[key].reportCount++;
        
        // Add misinformation type as topic if not already present
        if (report.misinformation_type && !regionGroups[key].topics.includes(report.misinformation_type)) {
          regionGroups[key].topics.push(report.misinformation_type);
        }
        
        // Update last reported date
        const reportDate = new Date(report.created_at);
        if (reportDate > regionGroups[key].lastReported) {
          regionGroups[key].lastReported = reportDate;
        }
      });

      // Calculate severity based on report count
      const dataArray = Object.values(regionGroups).map(item => ({
        ...item,
        severity: (item.reportCount > 10 ? 'high' : item.reportCount > 5 ? 'medium' : 'low') as 'low' | 'medium' | 'high'
      }));

      setRegionalData(dataArray);
    } catch (error) {
      console.error('Failed to load regional data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const sortedData = [...regionalData].sort((a, b) => {
    switch (sortBy) {
      case 'count':
        return b.reportCount - a.reportCount;
      case 'recent':
        return b.lastReported.getTime() - a.lastReported.getTime();
      case 'severity':
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      default:
        return 0;
    }
  });

  const totalReports = regionalData.reduce((sum, item) => sum + item.reportCount, 0);
  const highSeverityCount = regionalData.filter(item => item.severity === 'high').length;
  const uniqueRegions = new Set(regionalData.map(item => item.region)).size;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Regional Misinformation Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold text-blue-600">{totalReports}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-red-600">{highSeverityCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Regions</p>
                <p className="text-2xl font-bold text-green-600">{uniqueRegions}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <MapPin className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Locations</p>
                <p className="text-2xl font-bold text-purple-600">{regionalData.length}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Button 
              onClick={getUserLocation} 
              disabled={isGettingLocation}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isGettingLocation ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              {isGettingLocation ? 'Getting Location...' : 'Get My Location'}
            </Button>

            {userLocation && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Your location: {userLocation.city}, {userLocation.state}
              </div>
            )}

            <div className="flex gap-2 ml-auto">
              <Button
                variant={sortBy === 'count' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('count')}
              >
                By Count
              </Button>
              <Button
                variant={sortBy === 'recent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('recent')}
              >
                By Recent
              </Button>
              <Button
                variant={sortBy === 'severity' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('severity')}
              >
                By Severity
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regional Data List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Regional Breakdown</CardTitle>
          <Button
            onClick={loadRegionalData}
            disabled={isLoadingData}
            variant="outline"
            size="sm"
          >
            {isLoadingData ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Refresh Data'
            )}
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingData ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading regional data...</span>
            </div>
          ) : sortedData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No regional data available yet. Data will appear as users report misinformation.
            </div>
          ) : (
            <div className="space-y-4">
              {sortedData.map((item, index) => (
                <div
                  key={`${item.location}-${item.region}-${index}`}
                  className={`p-4 rounded-lg border-2 ${
                    userLocation && item.location.includes(userLocation.city || '') 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-semibold">
                          {item.location}
                        </h3>
                        {userLocation && item.location.includes(userLocation.city || '') && (
                          <Badge variant="outline" className="text-xs">
                            Near You
                          </Badge>
                        )}
                      </div>

                      <div className="text-sm text-muted-foreground mb-2">
                        Region: {item.region}
                      </div>

                      <div className="flex items-center gap-4 mb-3">
                        <Badge variant={getSeverityColor(item.severity)}>
                          {item.severity.toUpperCase()} Priority
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {item.reportCount} reports
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Last: {item.lastReported.toLocaleDateString()}
                        </span>
                      </div>

                      {item.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.topics.slice(0, 3).map((topic, topicIndex) => (
                            <Badge key={topicIndex} variant="secondary" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                          {item.topics.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{item.topics.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {item.reportCount}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        reports
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>Note:</strong> This analysis is based on misinformation reports from our community.
            </p>
            <p>
              Location data is anonymized and used only for regional health research and pattern analysis.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
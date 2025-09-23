import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, AlertTriangle, TrendingUp, Users, Eye } from 'lucide-react';
import { geolocationService, LocationData } from '@/services/geolocation';

interface MisinformationHotspot {
  id: string;
  location: string;
  state: string;
  count: number;
  severity: 'low' | 'medium' | 'high';
  topics: string[];
  lastReported: Date;
}

// Sample hotspot data for demonstration
const sampleHotspots: MisinformationHotspot[] = [
  {
    id: '1',
    location: 'Mumbai',
    state: 'Maharashtra',
    count: 45,
    severity: 'high',
    topics: ['COVID vaccines', 'Home remedies'],
    lastReported: new Date('2024-01-15T10:30:00')
  },
  {
    id: '2',
    location: 'Delhi',
    state: 'Delhi',
    count: 32,
    severity: 'medium',
    topics: ['Ayurvedic treatments', 'Disease prevention'],
    lastReported: new Date('2024-01-14T15:45:00')
  },
  {
    id: '3',
    location: 'Bangalore',
    state: 'Karnataka',
    count: 28,
    severity: 'medium',
    topics: ['Mental health', 'Diet myths'],
    lastReported: new Date('2024-01-13T09:20:00')
  },
  {
    id: '4',
    location: 'Chennai',
    state: 'Tamil Nadu',
    count: 15,
    severity: 'low',
    topics: ['Traditional medicine'],
    lastReported: new Date('2024-01-12T14:10:00')
  }
];

export const MisinformationTracker = () => {
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [sortBy, setSortBy] = useState<'count' | 'recent' | 'severity'>('count');

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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const sortedHotspots = [...sampleHotspots].sort((a, b) => {
    switch (sortBy) {
      case 'count':
        return b.count - a.count;
      case 'recent':
        return b.lastReported.getTime() - a.lastReported.getTime();
      case 'severity':
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      default:
        return 0;
    }
  });

  const totalReports = sampleHotspots.reduce((sum, hotspot) => sum + hotspot.count, 0);
  const highSeverityCount = sampleHotspots.filter(h => h.severity === 'high').length;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Misinformation Tracking Dashboard
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
                <p className="text-sm text-muted-foreground">Cities Covered</p>
                <p className="text-2xl font-bold text-green-600">{sampleHotspots.length}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <Eye className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Monitoring</p>
                <p className="text-2xl font-bold text-purple-600">24/7</p>
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
              <MapPin className="h-4 w-4" />
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

      {/* Hotspots List */}
      <Card>
        <CardHeader>
          <CardTitle>Misinformation Hotspots</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedHotspots.map((hotspot) => (
              <div
                key={hotspot.id}
                className={`p-4 rounded-lg border-2 ${
                  userLocation?.city === hotspot.location 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold">
                        {hotspot.location}, {hotspot.state}
                      </h3>
                      {userLocation?.city === hotspot.location && (
                        <Badge variant="outline" className="text-xs">
                          Your Area
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mb-3">
                      <Badge variant={getSeverityColor(hotspot.severity)}>
                        {hotspot.severity.toUpperCase()} Priority
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {hotspot.count} reports
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Last: {hotspot.lastReported.toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {hotspot.topics.map((topic, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {hotspot.count}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      reports
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Information Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>Note:</strong> This data represents misinformation patterns detected through our AI analysis.
            </p>
            <p>
              Location data is anonymized and used only for regional health research and misinformation tracking.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
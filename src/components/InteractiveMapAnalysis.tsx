import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, AlertTriangle, TrendingUp, Users, Loader2, Navigation, RotateCcw, Database, Shield, RefreshCw, Trash2 } from 'lucide-react';
import { geolocationService, LocationData } from '@/services/geolocation';
import { enhancedGeocodingService, GeocodedLocation } from '@/services/enhancedGeocoding';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseDebugger } from '@/components/DatabaseDebugger';
import { dataSyncService } from '@/services/dataSync';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.divIcon({
  html: '<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
  className: 'custom-div-icon',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MisinformationHotspot {
  id: string;
  latitude: number;
  longitude: number;
  location: string;
  reportCount: number;
  severity: 'low' | 'medium' | 'high';
  topics: string[];
  lastReported: Date;
  reports: any[];
  city?: string;
  state?: string;
  region?: string;
  locationSource?: 'user_provided' | 'auto_detected' | 'geocoded' | 'manual';
  validatedLocation?: boolean;
}

// Sample hotspot data with real coordinates for major Indian cities
const sampleHotspots: MisinformationHotspot[] = [
  {
    id: '1',
    latitude: 19.0760,
    longitude: 72.8777,
    location: 'Mumbai, Maharashtra',
    reportCount: 45,
    severity: 'high',
    topics: ['COVID vaccines', 'Home remedies', 'Ayurvedic treatments'],
    lastReported: new Date('2024-01-15T10:30:00'),
    reports: []
  },
  {
    id: '2',
    latitude: 28.6139,
    longitude: 77.2090,
    location: 'Delhi, Delhi',
    reportCount: 32,
    severity: 'medium',
    topics: ['Ayurvedic treatments', 'Disease prevention', 'Mental health'],
    lastReported: new Date('2024-01-14T15:45:00'),
    reports: []
  },
  {
    id: '3',
    latitude: 12.9716,
    longitude: 77.5946,
    location: 'Bangalore, Karnataka',
    reportCount: 28,
    severity: 'medium',
    topics: ['Mental health', 'Diet myths', 'Traditional medicine'],
    lastReported: new Date('2024-01-13T09:20:00'),
    reports: []
  },
  {
    id: '4',
    latitude: 13.0827,
    longitude: 80.2707,
    location: 'Chennai, Tamil Nadu',
    reportCount: 15,
    severity: 'low',
    topics: ['Traditional medicine', 'Seasonal diseases'],
    lastReported: new Date('2024-01-12T14:10:00'),
    reports: []
  },
  {
    id: '5',
    latitude: 22.5726,
    longitude: 88.3639,
    location: 'Kolkata, West Bengal',
    reportCount: 20,
    severity: 'medium',
    topics: ['Monsoon diseases', 'Traditional remedies'],
    lastReported: new Date('2024-01-11T11:20:00'),
    reports: []
  },
  {
    id: '6',
    latitude: 18.5204,
    longitude: 73.8567,
    location: 'Pune, Maharashtra',
    reportCount: 18,
    severity: 'low',
    topics: ['Exercise myths', 'Nutrition'],
    lastReported: new Date('2024-01-10T16:45:00'),
    reports: []
  }
];

// Component to handle map center changes
const MapController: React.FC<{ center: [number, number], zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
};

// Custom marker for different severity levels
const createCustomIcon = (severity: string, count: number) => {
  const color = severity === 'high' ? '#ef4444' : severity === 'medium' ? '#f97316' : '#22c55e';
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color}; 
        width: ${Math.min(Math.max(count * 0.8 + 15, 20), 40)}px; 
        height: ${Math.min(Math.max(count * 0.8 + 15, 20), 40)}px; 
        border-radius: 50%; 
        border: 3px solid white; 
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 10px;
      ">
        ${count}
      </div>
    `,
    className: 'custom-hotspot-icon',
    iconSize: [Math.min(Math.max(count * 0.8 + 15, 20), 40), Math.min(Math.max(count * 0.8 + 15, 20), 40)],
    iconAnchor: [Math.min(Math.max(count * 0.8 + 15, 20), 40) / 2, Math.min(Math.max(count * 0.8 + 15, 20), 40) / 2]
  });
};

export const InteractiveMapAnalysis = () => {
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [hotspots, setHotspots] = useState<MisinformationHotspot[]>(sampleHotspots);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]); // Center of India
  const [mapZoom, setMapZoom] = useState(5);
  const [selectedHotspot, setSelectedHotspot] = useState<MisinformationHotspot | null>(null);

  // ---------------------------------------------------------------------------
  // Persistent Misinformation Pins (manual clear only)
  // ---------------------------------------------------------------------------
  interface MisinformationPin {
    id: string;
    latitude: number;
    longitude: number;
    query: string;
    correction: string;
    type: string;
    timestamp: string; // ISO string
    source: 'user' | 'restored';
    locationLabel?: string;
  }

  const [misinfoPins, setMisinfoPins] = useState<MisinformationPin[]>(() => {
    try {
      const raw = localStorage.getItem('misinfoPins');
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse misinfoPins from storage', e);
    }
    return [];
  });

  // Persist to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem('misinfoPins', JSON.stringify(misinfoPins));
    } catch (e) {
      console.warn('Failed saving misinfoPins', e);
    }
  }, [misinfoPins]);

  const addPin = (pin: MisinformationPin) => {
    setMisinfoPins(prev => prev.find(p => p.id === pin.id) ? prev : [...prev, pin]);
  };

  const clearAllPins = () => {
    if (confirm('Clear ALL persistent misinformation pins? This cannot be undone.')) {
      setMisinfoPins([]);
      try { localStorage.removeItem('misinfoPins'); } catch {}
    }
  };

  useEffect(() => {
    loadRealHotspots();
    
    // Listen for new misinformation reports and auto-sync
    const handleNewReport = (event: CustomEvent) => {
      console.log('New misinformation reported, auto-syncing...', event.detail);
      performIncrementalSync();
    };
    
    window.addEventListener('misinformationReported', handleNewReport as EventListener);

    // Listen for persistent misinformation detection events emitted by ChatBot
    const handlePersistent = (event: Event) => {
      const custom = event as CustomEvent;
      const detail: any = custom.detail;
      if (!detail) return;
      console.log('Persistent misinformation detected event received:', detail);

      // Determine coordinates
      let lat: number | undefined = detail.userLocation?.latitude;
      let lng: number | undefined = detail.userLocation?.longitude;

      if (lat == null || lng == null) {
        // fallback: approximate center with slight jitter to avoid overlap
        lat = 20.5937 + (Math.random() - 0.5) * 0.4;
        lng = 78.9629 + (Math.random() - 0.5) * 0.4;
      }

      addPin({
        id: detail.id,
        latitude: lat,
        longitude: lng,
        query: detail.query || 'Unknown query',
        correction: detail.correction || 'No correction provided',
        type: detail.type || 'general',
        timestamp: detail.timestamp || new Date().toISOString(),
        source: detail.userLocation ? 'user' : 'restored',
        locationLabel: detail.userLocation ? `${detail.userLocation.city || ''}${detail.userLocation.state ? ', ' + detail.userLocation.state : ''}` : 'Approximate'
      });
    };
    window.addEventListener('misinformationDetectedPersistent', handlePersistent as EventListener);
    
    return () => {
      window.removeEventListener('misinformationReported', handleNewReport as EventListener);
      window.removeEventListener('misinformationDetectedPersistent', handlePersistent as EventListener);
    };
  }, []);

  const getUserLocation = async () => {
    setIsGettingLocation(true);
    try {
      const location = await geolocationService.getCurrentPosition();
      setUserLocation(location);
      
      // Center map on user location
      if (location.latitude && location.longitude) {
        setMapCenter([location.latitude, location.longitude]);
        setMapZoom(10);
      }
    } catch (error) {
      console.error('Failed to get location:', error);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const loadRealHotspots = async () => {
    setIsLoadingData(true);
    try {
      console.log('Loading misinformation reports with data sync...');
      
      // Use data sync service to get enriched reports
      const enrichedReports = await dataSyncService.getAllEnrichedReports(userLocation);
      
      console.log(`Found ${enrichedReports?.length || 0} misinformation reports (with location data)`);

      if (enrichedReports && enrichedReports.length > 0) {
        // Group reports by location using enriched data
        const locationGroups: { [key: string]: MisinformationHotspot } = {};
        
        // Process enriched reports directly (they already have location data)
        enrichedReports.forEach((report) => {
          const location = report.user_location || report.region || 'Unknown Location';
          
          // Use geocoded coordinates if available, otherwise skip
          let coords: GeocodedLocation | null = null;
          
          if (report.geocoded_coordinates) {
            coords = {
              latitude: report.geocoded_coordinates.latitude,
              longitude: report.geocoded_coordinates.longitude,
              city: report.user_location?.split(',')[0]?.trim() || 'Unknown',
              state: report.region || 'Unknown'
            };
          }
          
          if (!coords) {
            // Skip reports without coordinates - they'll be handled in next sync
            console.warn(`Report ${report.id} missing coordinates, skipping for now`);
            return;
          }
          
          if (!locationGroups[location]) {
            locationGroups[location] = {
              id: location,
              latitude: coords.latitude,
              longitude: coords.longitude,
              location: location,
              city: coords.city,
              state: coords.state,
              region: report.region || coords.state,
              reportCount: 0,
              severity: 'low',
              topics: [],
              lastReported: new Date(report.created_at),
              reports: []
            };
          }
          
          locationGroups[location].reportCount++;
          locationGroups[location].reports.push(report);
          
          // Add misinformation type as topic
          if (report.misinformation_type && !locationGroups[location].topics.includes(report.misinformation_type)) {
            locationGroups[location].topics.push(report.misinformation_type);
          }
          
          // Update last reported
          const reportDate = new Date(report.created_at);
          if (reportDate > locationGroups[location].lastReported) {
            locationGroups[location].lastReported = reportDate;
          }
        });

        // Calculate severity and convert to array
        const hotspotsFromDB = Object.values(locationGroups).map(hotspot => ({
          ...hotspot,
          severity: (hotspot.reportCount > 10 ? 'high' : hotspot.reportCount > 5 ? 'medium' : 'low') as 'low' | 'medium' | 'high'
        }));

        console.log(`Created ${hotspotsFromDB.length} hotspots from enriched database reports`);
        setHotspots(hotspotsFromDB);
      } else {
        console.log('No reports found in database, using sample data');
        setHotspots(sampleHotspots);
      }
    } catch (error) {
      console.error('Failed to load real hotspots:', error);
      setHotspots(sampleHotspots);
    } finally {
      setIsLoadingData(false);
    }
  };

  const performIncrementalSync = async () => {
    setIsSyncing(true);
    setSyncStatus('Syncing new data...');
    
    try {
      console.log('Starting incremental sync with location validation...');
      
      // Get current location if available
      let currentLocation = userLocation;
      if (!currentLocation) {
        try {
          currentLocation = await geolocationService.getCurrentPosition();
          setUserLocation(currentLocation);
        } catch (error) {
          console.warn('Could not get current location for sync:', error);
        }
      }
      
      // Perform incremental sync
      const syncResult = await dataSyncService.syncData(currentLocation);
      
      if (syncResult.newReports.length > 0) {
        setSyncStatus(`Synced ${syncResult.newReports.length} new reports${syncResult.errors.length > 0 ? ` (${syncResult.errors.length} errors)` : ''}`);
        
        // Reload hotspots to include new data
        await loadRealHotspots();
        setLastSyncTime(new Date());
      } else {
        setSyncStatus('No new data to sync');
      }
      
      if (syncResult.errors.length > 0) {
        console.warn('Sync completed with errors:', syncResult.errors);
      }
      
    } catch (error) {
      console.error('Incremental sync failed:', error);
      setSyncStatus('Sync failed - check connection');
    } finally {
      setIsSyncing(false);
      // Clear status after 3 seconds
      setTimeout(() => setSyncStatus(''), 3000);
    }
  };

  const forceFullRefresh = async () => {
    setIsLoadingData(true);
    setSyncStatus('Force refreshing all data...');
    
    try {
      const refreshResult = await dataSyncService.forceRefresh(userLocation);
      
      if (refreshResult.totalProcessed > 0) {
        setSyncStatus(`Refreshed ${refreshResult.totalProcessed} reports`);
        await loadRealHotspots();
        setLastSyncTime(new Date());
      } else {
        setSyncStatus('No data found to refresh');
      }
      
    } catch (error) {
      console.error('Force refresh failed:', error);
      setSyncStatus('Refresh failed - check connection');
    } finally {
      setIsLoadingData(false);
      setTimeout(() => setSyncStatus(''), 3000);
    }
  };

  const resetMapView = () => {
    setMapCenter([20.5937, 78.9629]);
    setMapZoom(5);
    setSelectedHotspot(null);
  };

  const focusOnHotspot = (hotspot: MisinformationHotspot) => {
    setMapCenter([hotspot.latitude, hotspot.longitude]);
    setMapZoom(12);
    setSelectedHotspot(hotspot);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const totalReports = hotspots.reduce((sum, hotspot) => sum + hotspot.reportCount, 0);
  const highSeverityCount = hotspots.filter(h => h.severity === 'high').length;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            Interactive Regional Misinformation Map
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
                <p className="text-sm text-muted-foreground">Hotspots</p>
                <p className="text-2xl font-bold text-green-600">{hotspots.length}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <MapPin className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Coverage</p>
                <p className="text-2xl font-bold text-purple-600">Pan-India</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4">
            <Button 
              onClick={getUserLocation} 
              disabled={isGettingLocation}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isGettingLocation ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4" />
              )}
              {isGettingLocation ? 'Getting Location...' : 'Center on My Location'}
            </Button>

            <Button 
              onClick={performIncrementalSync} 
              disabled={isSyncing}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isSyncing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              {isSyncing ? 'Syncing...' : 'Sync New Data'}
            </Button>

            <Button 
              onClick={forceFullRefresh} 
              disabled={isLoadingData}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isLoadingData ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isLoadingData ? 'Refreshing...' : 'Force Refresh'}
            </Button>

            <Button 
              onClick={resetMapView}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Map View
            </Button>

            <Button
              onClick={loadRealHotspots}
              disabled={isLoadingData}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isLoadingData ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <TrendingUp className="h-4 w-4" />
              )}
              Refresh Data
            </Button>

            {userLocation && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                <MapPin className="h-4 w-4" />
                Your location: {userLocation.city}, {userLocation.state}
              </div>
            )}

            <Button 
              onClick={clearAllPins}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" /> Clear Pins
            </Button>

            {syncStatus && (
              <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                <Shield className="h-4 w-4" />
                {syncStatus}
              </div>
            )}

            {lastSyncTime && (
              <div className="text-xs text-muted-foreground">
                Last sync: {lastSyncTime.toLocaleTimeString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Interactive Map */}
      <Card className="h-[600px]">
        <CardContent className="p-0 h-full">
          <div className="h-full relative">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
              className="rounded-lg"
            >
              <MapController center={mapCenter} zoom={mapZoom} />
              
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* User location marker */}
              {userLocation && userLocation.latitude && userLocation.longitude && (
                <Marker 
                  position={[userLocation.latitude, userLocation.longitude]}
                  icon={L.divIcon({
                    html: '<div style="background-color: #2563eb; width: 15px; height: 15px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                    className: 'user-location-icon',
                    iconSize: [15, 15],
                    iconAnchor: [7.5, 7.5]
                  })}
                >
                  <Popup>
                    <div className="text-center">
                      <strong>Your Location</strong>
                      <br />
                      {userLocation.city}, {userLocation.state}
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Misinformation hotspot markers */}
              {hotspots.map((hotspot) => (
                <Marker
                  key={hotspot.id}
                  position={[hotspot.latitude, hotspot.longitude]}
                  icon={createCustomIcon(hotspot.severity, hotspot.reportCount)}
                  eventHandlers={{
                    click: () => {
                      setSelectedHotspot(hotspot);
                    }
                  }}
                >
                  <Popup>
                    <div className="w-64">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{hotspot.location}</h3>
                        <Badge variant={getSeverityColor(hotspot.severity)}>
                          {hotspot.severity.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <span className="text-sm">{hotspot.reportCount} reports</span>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          Last report: {hotspot.lastReported.toLocaleDateString()}
                        </div>
                        
                        {hotspot.locationSource && (
                          <div className="flex items-center gap-2">
                            <Shield className={`h-3 w-3 ${hotspot.validatedLocation ? 'text-green-500' : 'text-yellow-500'}`} />
                            <span className="text-xs text-muted-foreground">
                              {hotspot.validatedLocation ? 'Verified location' : 'Estimated location'}
                            </span>
                          </div>
                        )}
                        
                        {hotspot.topics.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-1">Common topics:</p>
                            <div className="flex flex-wrap gap-1">
                              {hotspot.topics.slice(0, 3).map((topic, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {topic}
                                </Badge>
                              ))}
                              {hotspot.topics.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{hotspot.topics.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Persistent misinformation pins */}
              {misinfoPins.map(pin => (
                <Marker
                  key={pin.id}
                  position={[pin.latitude, pin.longitude]}
                  icon={L.divIcon({
                    html: `<div style="position:relative;width:26px;height:26px;">
                            <div style=\"position:absolute;inset:0;border-radius:50%;background:rgba(220,38,38,0.55);border:2px solid #dc2626;box-shadow:0 0 8px rgba(220,38,38,0.7);animation:pulse 2s infinite;\"></div>
                            <div style=\"position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:10px;height:10px;background:#7f1d1d;border:2px solid white;border-radius:50%;\"></div>
                          </div>` ,
                    className: 'misinfo-pin-icon',
                    iconSize: [26, 26],
                    iconAnchor: [13, 13]
                  })}
                >
                  <Popup>
                    <div className="w-64">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <h3 className="font-semibold text-red-600">Misinformation</h3>
                      </div>
                      <p className="text-xs font-medium mb-1">Query</p>
                      <p className="text-sm mb-2 break-words">{pin.query}</p>
                      <p className="text-xs font-medium mb-1">Correction</p>
                      <p className="text-xs bg-green-50 text-green-700 p-2 rounded mb-2 break-words">{pin.correction}</p>
                      <p className="text-xs text-muted-foreground">Type: {pin.type}</p>
                      <p className="text-xs text-muted-foreground">Time: {new Date(pin.timestamp).toLocaleString()}</p>
                      {pin.locationLabel && <p className="text-xs text-muted-foreground">Location: {pin.locationLabel}</p>}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Hotspots List */}
      <Card>
        <CardHeader>
          <CardTitle>Misinformation Hotspots</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotspots.map((hotspot) => (
              <div
                key={hotspot.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedHotspot?.id === hotspot.id 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border bg-card hover:border-primary/50'
                }`}
                onClick={() => focusOnHotspot(hotspot)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm">{hotspot.location}</h3>
                  <Badge variant={getSeverityColor(hotspot.severity)} className="text-xs">
                    {hotspot.severity.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-3 w-3 text-orange-500" />
                  <span className="text-sm">{hotspot.reportCount} reports</span>
                </div>
                
                <div className="text-xs text-muted-foreground mb-2">
                  Last: {hotspot.lastReported.toLocaleDateString()}
                </div>
                
                {hotspot.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {hotspot.topics.slice(0, 2).map((topic, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                    {hotspot.topics.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{hotspot.topics.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Database Debug Panel */}
      <DatabaseDebugger />

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Map Legend</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-bold">
                  H
                </div>
                <span className="text-sm">High Priority Hotspots (10+ reports)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-orange-500 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-bold">
                  M
                </div>
                <span className="text-sm">Medium Priority (5-10 reports)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-bold">
                  L
                </div>
                <span className="text-sm">Low Priority (1-5 reports)</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-md"></div>
              <span className="text-sm">Your Current Location</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
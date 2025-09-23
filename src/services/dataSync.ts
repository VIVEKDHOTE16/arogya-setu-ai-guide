// Data Synchronization Service for Incremental Updates
import { supabase } from '@/integrations/supabase/client';
import { enhancedGeocodingService, GeocodedLocation } from '@/services/enhancedGeocoding';
import { geolocationService, LocationData } from '@/services/geolocation';

interface MisinformationReport {
  id: string;
  user_query: string;
  misinformation_type: string;
  user_location: string | null;
  region: string | null;
  correct_information: string;
  created_at: string;
  updated_at: string;
  user_consented_location: boolean | null;
  frequency_count: number | null;
  disease_id: string | null;
  // Enhanced fields
  validated_location?: boolean;
  geocoded_coordinates?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  location_source?: 'user_provided' | 'auto_detected' | 'geocoded' | 'manual';
}

interface DataSyncResult {
  newReports: MisinformationReport[];
  updatedReports: MisinformationReport[];
  totalProcessed: number;
  errors: string[];
}

class DataSynchronizationService {
  private lastSyncTimestamp: string | null = null;
  private processingQueue: Set<string> = new Set();

  // Get the last sync timestamp from localStorage
  private getLastSyncTimestamp(): string | null {
    try {
      return localStorage.getItem('misinformation_last_sync') || null;
    } catch {
      return null;
    }
  }

  // Save the last sync timestamp
  private saveLastSyncTimestamp(timestamp: string): void {
    try {
      localStorage.setItem('misinformation_last_sync', timestamp);
      this.lastSyncTimestamp = timestamp;
    } catch (error) {
      console.warn('Failed to save sync timestamp:', error);
    }
  }

  // Fetch only new reports since last sync
  async fetchNewReports(): Promise<MisinformationReport[]> {
    try {
      const lastSync = this.getLastSyncTimestamp();
      console.log('Fetching new reports since:', lastSync || 'beginning');

      let query = supabase
        .from('misinformation_reports')
        .select('*')
        .order('created_at', { ascending: false });

      // Only fetch reports newer than last sync
      if (lastSync) {
        query = query.gt('created_at', lastSync);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching new reports:', error);
        throw error;
      }

      console.log(`Found ${data?.length || 0} new reports`);
      return data || [];
    } catch (error) {
      console.error('Failed to fetch new reports:', error);
      throw error;
    }
  }

  // Validate and enrich location data for new reports
  async enrichReportWithLocation(
    report: MisinformationReport,
    userCurrentLocation?: LocationData
  ): Promise<MisinformationReport> {
    // Skip if already processing this report
    if (this.processingQueue.has(report.id)) {
      return report;
    }

    this.processingQueue.add(report.id);

    try {
      let enrichedReport = { ...report };
      let locationSource: 'user_provided' | 'auto_detected' | 'geocoded' | 'manual' = 'manual';
      let validatedLocation = false;
      let geocodedCoords: { latitude: number; longitude: number; accuracy?: number } | undefined;

      // Priority 1: Use current user location if available and report has consent
      if (userCurrentLocation && report.user_consented_location) {
        const locationString = `${userCurrentLocation.city}, ${userCurrentLocation.state}`;
        
        // Update report location if it's empty or generic
        if (!report.user_location || report.user_location === 'Unknown Location') {
          enrichedReport.user_location = locationString;
          enrichedReport.region = userCurrentLocation.state;
          locationSource = 'auto_detected';
          validatedLocation = true;
          
          geocodedCoords = {
            latitude: userCurrentLocation.latitude,
            longitude: userCurrentLocation.longitude,
            accuracy: userCurrentLocation.accuracy
          };

          console.log(`Auto-detected location for report ${report.id}: ${locationString}`);
        }
      }

      // Priority 2: Geocode existing user_location if present
      if (report.user_location && !geocodedCoords) {
        try {
          const geocoded = await enhancedGeocodingService.geocodeLocation(report.user_location);
          if (geocoded) {
            geocodedCoords = {
              latitude: geocoded.latitude,
              longitude: geocoded.longitude
            };
            
            // Validate and enhance location string if needed
            if (geocoded.city && geocoded.state) {
              const enhancedLocation = `${geocoded.city}, ${geocoded.state}`;
              if (enhancedLocation !== report.user_location) {
                enrichedReport.user_location = enhancedLocation;
                enrichedReport.region = geocoded.state;
              }
            }
            
            locationSource = report.user_location.includes('Unknown') ? 'geocoded' : 'user_provided';
            validatedLocation = true;
            
            console.log(`Geocoded location for report ${report.id}: [${geocoded.latitude}, ${geocoded.longitude}]`);
          }
        } catch (error) {
          console.warn(`Failed to geocode location "${report.user_location}" for report ${report.id}:`, error);
        }
      }

      // Priority 3: Generate fallback location if nothing is available
      if (!geocodedCoords && !report.user_location) {
        const fallbackLocation = enhancedGeocodingService.generateRandomLocationInIndia();
        enrichedReport.user_location = `${fallbackLocation.city}, ${fallbackLocation.state}`;
        enrichedReport.region = fallbackLocation.state;
        
        geocodedCoords = {
          latitude: fallbackLocation.latitude,
          longitude: fallbackLocation.longitude
        };
        
        locationSource = 'geocoded';
        validatedLocation = false; // Mark as not validated since it's generated
        
        console.log(`Generated fallback location for report ${report.id}: ${enrichedReport.user_location}`);
      }

      // Add enrichment metadata
      enrichedReport.validated_location = validatedLocation;
      enrichedReport.geocoded_coordinates = geocodedCoords;
      enrichedReport.location_source = locationSource;

      return enrichedReport;
    } finally {
      this.processingQueue.delete(report.id);
    }
  }

  // Update database with enriched location data (non-destructive)
  async updateReportLocation(report: MisinformationReport): Promise<boolean> {
    try {
      // Only update if we have meaningful location data to add
      const updateData: any = {};
      let hasUpdates = false;

      // Update location fields only if they're improved
      if (report.user_location && report.location_source !== 'manual') {
        updateData.user_location = report.user_location;
        hasUpdates = true;
      }

      if (report.region && report.location_source !== 'manual') {
        updateData.region = report.region;
        hasUpdates = true;
      }

      // Only update if we have meaningful changes
      if (!hasUpdates) {
        return true;
      }

      const { error } = await supabase
        .from('misinformation_reports')
        .update(updateData)
        .eq('id', report.id);

      if (error) {
        console.error(`Failed to update location for report ${report.id}:`, error);
        return false;
      }

      console.log(`Updated location data for report ${report.id}`);
      return true;
    } catch (error) {
      console.error(`Error updating report ${report.id}:`, error);
      return false;
    }
  }

  // Main synchronization method
  async syncData(userCurrentLocation?: LocationData): Promise<DataSyncResult> {
    const result: DataSyncResult = {
      newReports: [],
      updatedReports: [],
      totalProcessed: 0,
      errors: []
    };

    try {
      console.log('Starting incremental data sync...');
      
      // Fetch only new reports
      const newReports = await this.fetchNewReports();
      result.totalProcessed = newReports.length;

      if (newReports.length === 0) {
        console.log('No new reports to process');
        return result;
      }

      // Process each new report
      for (const report of newReports) {
        try {
          // Enrich with location data
          const enrichedReport = await this.enrichReportWithLocation(report, userCurrentLocation);
          
          // Update database with enriched data (non-destructive)
          const updateSuccess = await this.updateReportLocation(enrichedReport);
          
          if (updateSuccess) {
            result.newReports.push(enrichedReport);
            result.updatedReports.push(enrichedReport);
          } else {
            result.errors.push(`Failed to update report ${report.id}`);
            // Still include the enriched report for display
            result.newReports.push(enrichedReport);
          }

          // Small delay to avoid overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          const errorMsg = `Error processing report ${report.id}: ${error}`;
          console.error(errorMsg);
          result.errors.push(errorMsg);
          
          // Include the original report even if enrichment failed
          result.newReports.push(report);
        }
      }

      // Update sync timestamp to current time
      if (newReports.length > 0) {
        const latestTimestamp = newReports[0].created_at; // Already ordered by created_at desc
        this.saveLastSyncTimestamp(latestTimestamp);
      }

      console.log(`Sync completed: ${result.newReports.length} new reports, ${result.updatedReports.length} updated, ${result.errors.length} errors`);
      
    } catch (error) {
      const errorMsg = `Sync failed: ${error}`;
      console.error(errorMsg);
      result.errors.push(errorMsg);
    }

    return result;
  }

  // Get all reports (existing + new) with their enriched data
  async getAllEnrichedReports(userCurrentLocation?: LocationData): Promise<MisinformationReport[]> {
    try {
      // First, sync new data
      await this.syncData(userCurrentLocation);

      // Then fetch all reports
      const { data, error } = await supabase
        .from('misinformation_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all reports:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get enriched reports:', error);
      throw error;
    }
  }

  // Force refresh - fetch all data but don't overwrite existing locations
  async forceRefresh(userCurrentLocation?: LocationData): Promise<DataSyncResult> {
    try {
      console.log('Force refreshing data...');
      
      // Reset sync timestamp to fetch all reports
      const originalTimestamp = this.lastSyncTimestamp;
      this.lastSyncTimestamp = null;
      localStorage.removeItem('misinformation_last_sync');

      // Fetch all reports as "new"
      const result = await this.syncData(userCurrentLocation);

      // If there were errors, restore the original timestamp
      if (result.errors.length > 0 && originalTimestamp) {
        this.saveLastSyncTimestamp(originalTimestamp);
      }

      return result;
    } catch (error) {
      console.error('Force refresh failed:', error);
      throw error;
    }
  }

  // Check if location validation is available
  async isLocationValidationAvailable(): Promise<boolean> {
    try {
      const position = await geolocationService.getCurrentPosition();
      return !!(position.latitude && position.longitude);
    } catch {
      return false;
    }
  }
}

export const dataSyncService = new DataSynchronizationService();
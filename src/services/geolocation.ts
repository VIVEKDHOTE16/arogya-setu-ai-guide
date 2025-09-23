// Geolocation Service for Regional Analysis
export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
  region?: string;
  accuracy?: number;
  timestamp: Date;
}

export interface GeolocationError {
  code: number;
  message: string;
  type: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNKNOWN';
}

class GeolocationService {
  private watchId: number | null = null;
  private currentPosition: LocationData | null = null;

  // Check if geolocation is supported
  isSupported(): boolean {
    return 'geolocation' in navigator;
  }

  // Get current position once
  async getCurrentPosition(options?: PositionOptions): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject({
          code: 0,
          message: 'Geolocation is not supported by this browser',
          type: 'UNKNOWN'
        } as GeolocationError);
        return;
      }

      const defaultOptions: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
        ...options
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date()
          };

          // Try to get address information using reverse geocoding
          try {
            const addressInfo = await this.reverseGeocode(
              position.coords.latitude,
              position.coords.longitude
            );
            Object.assign(locationData, addressInfo);
          } catch (error) {
            console.warn('Reverse geocoding failed:', error);
          }

          this.currentPosition = locationData;
          resolve(locationData);
        },
        (error) => {
          const geoError: GeolocationError = {
            code: error.code,
            message: this.getErrorMessage(error.code),
            type: this.getErrorType(error.code)
          };
          reject(geoError);
        },
        defaultOptions
      );
    });
  }

  // Watch position changes
  watchPosition(
    callback: (location: LocationData) => void,
    errorCallback?: (error: GeolocationError) => void,
    options?: PositionOptions
  ): number | null {
    if (!this.isSupported()) {
      errorCallback?.({
        code: 0,
        message: 'Geolocation is not supported',
        type: 'UNKNOWN'
      });
      return null;
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // 1 minute cache for watch
      ...options
    };

    this.watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date()
        };

        try {
          const addressInfo = await this.reverseGeocode(
            position.coords.latitude,
            position.coords.longitude
          );
          Object.assign(locationData, addressInfo);
        } catch (error) {
          console.warn('Reverse geocoding failed:', error);
        }

        this.currentPosition = locationData;
        callback(locationData);
      },
      (error) => {
        const geoError: GeolocationError = {
          code: error.code,
          message: this.getErrorMessage(error.code),
          type: this.getErrorType(error.code)
        };
        errorCallback?.(geoError);
      },
      defaultOptions
    );

    return this.watchId;
  }

  // Stop watching position
  stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  // Get cached position
  getCachedPosition(): LocationData | null {
    return this.currentPosition;
  }

  // Reverse geocoding using Nominatim (OpenStreetMap)
  private async reverseGeocode(lat: number, lon: number): Promise<Partial<LocationData>> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Reverse geocoding API error');
      }

      const data = await response.json();
      const address = data.address || {};

      return {
        city: address.city || address.town || address.village || address.hamlet,
        state: address.state,
        country: address.country,
        region: this.getIndianRegion(address.state)
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return {};
    }
  }

  // Map Indian states to regions for better analysis
  private getIndianRegion(state?: string): string {
    if (!state) return 'Unknown';

    const regionMap: { [key: string]: string } = {
      // North India
      'Delhi': 'North India',
      'Punjab': 'North India',
      'Haryana': 'North India',
      'Himachal Pradesh': 'North India',
      'Jammu and Kashmir': 'North India',
      'Ladakh': 'North India',
      'Uttarakhand': 'North India',
      'Uttar Pradesh': 'North India',

      // West India
      'Rajasthan': 'West India',
      'Gujarat': 'West India',
      'Maharashtra': 'West India',
      'Goa': 'West India',

      // South India
      'Karnataka': 'South India',
      'Kerala': 'South India',
      'Tamil Nadu': 'South India',
      'Andhra Pradesh': 'South India',
      'Telangana': 'South India',
      'Puducherry': 'South India',

      // East India
      'West Bengal': 'East India',
      'Odisha': 'East India',
      'Jharkhand': 'East India',
      'Bihar': 'East India',

      // Northeast India
      'Assam': 'Northeast India',
      'Meghalaya': 'Northeast India',
      'Tripura': 'Northeast India',
      'Mizoram': 'Northeast India',
      'Manipur': 'Northeast India',
      'Nagaland': 'Northeast India',
      'Arunachal Pradesh': 'Northeast India',
      'Sikkim': 'Northeast India',

      // Central India
      'Madhya Pradesh': 'Central India',
      'Chhattisgarh': 'Central India'
    };

    return regionMap[state] || 'Other';
  }

  // Get user-friendly error messages
  private getErrorMessage(code: number): string {
    switch (code) {
      case 1:
        return 'Location access denied by user. Please enable location services to use this feature.';
      case 2:
        return 'Location information unavailable. Please check your internet connection and GPS.';
      case 3:
        return 'Location request timed out. Please try again.';
      default:
        return 'An unknown location error occurred.';
    }
  }

  // Get error type for better handling
  private getErrorType(code: number): GeolocationError['type'] {
    switch (code) {
      case 1:
        return 'PERMISSION_DENIED';
      case 2:
        return 'POSITION_UNAVAILABLE';
      case 3:
        return 'TIMEOUT';
      default:
        return 'UNKNOWN';
    }
  }

  // Check if location permission is granted
  async checkPermission(): Promise<'granted' | 'denied' | 'prompt'> {
    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        return permission.state;
      }
      return 'prompt';
    } catch (error) {
      return 'prompt';
    }
  }

  // Request location permission with user-friendly dialog
  async requestLocationPermission(): Promise<boolean> {
    try {
      const position = await this.getCurrentPosition({
        timeout: 5000,
        maximumAge: 0
      });
      return !!position;
    } catch (error) {
      return false;
    }
  }
}

// Create singleton instance
export const geolocationService = new GeolocationService();

// Helper functions for components
export const formatLocation = (location: LocationData): string => {
  const parts = [location.city, location.state, location.country].filter(Boolean);
  return parts.join(', ') || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
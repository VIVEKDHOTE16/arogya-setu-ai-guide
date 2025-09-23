// Enhanced Geocoding Service for converting location strings to coordinates
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeocodedLocation extends Coordinates {
  city?: string;
  state?: string;
  country?: string;
  displayName?: string;
}

// Comprehensive database of major Indian cities with coordinates
const INDIAN_CITIES_DATABASE: { [key: string]: GeocodedLocation } = {
  // Major metros
  'mumbai': { latitude: 19.0760, longitude: 72.8777, city: 'Mumbai', state: 'Maharashtra', country: 'India' },
  'delhi': { latitude: 28.6139, longitude: 77.2090, city: 'Delhi', state: 'Delhi', country: 'India' },
  'bangalore': { latitude: 12.9716, longitude: 77.5946, city: 'Bangalore', state: 'Karnataka', country: 'India' },
  'bengaluru': { latitude: 12.9716, longitude: 77.5946, city: 'Bengaluru', state: 'Karnataka', country: 'India' },
  'hyderabad': { latitude: 17.3850, longitude: 78.4867, city: 'Hyderabad', state: 'Telangana', country: 'India' },
  'chennai': { latitude: 13.0827, longitude: 80.2707, city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
  'kolkata': { latitude: 22.5726, longitude: 88.3639, city: 'Kolkata', state: 'West Bengal', country: 'India' },
  'pune': { latitude: 18.5204, longitude: 73.8567, city: 'Pune', state: 'Maharashtra', country: 'India' },
  
  // State capitals and major cities
  'ahmedabad': { latitude: 23.0225, longitude: 72.5714, city: 'Ahmedabad', state: 'Gujarat', country: 'India' },
  'surat': { latitude: 21.1702, longitude: 72.8311, city: 'Surat', state: 'Gujarat', country: 'India' },
  'jaipur': { latitude: 26.9124, longitude: 75.7873, city: 'Jaipur', state: 'Rajasthan', country: 'India' },
  'lucknow': { latitude: 26.8467, longitude: 80.9462, city: 'Lucknow', state: 'Uttar Pradesh', country: 'India' },
  'kanpur': { latitude: 26.4499, longitude: 80.3319, city: 'Kanpur', state: 'Uttar Pradesh', country: 'India' },
  'nagpur': { latitude: 21.1458, longitude: 79.0882, city: 'Nagpur', state: 'Maharashtra', country: 'India' },
  'indore': { latitude: 22.7196, longitude: 75.8577, city: 'Indore', state: 'Madhya Pradesh', country: 'India' },
  'thane': { latitude: 19.2183, longitude: 72.9781, city: 'Thane', state: 'Maharashtra', country: 'India' },
  'bhopal': { latitude: 23.2599, longitude: 77.4126, city: 'Bhopal', state: 'Madhya Pradesh', country: 'India' },
  'visakhapatnam': { latitude: 17.6868, longitude: 83.2185, city: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'India' },
  'pimpri-chinchwad': { latitude: 18.6298, longitude: 73.7997, city: 'Pimpri-Chinchwad', state: 'Maharashtra', country: 'India' },
  'patna': { latitude: 25.5941, longitude: 85.1376, city: 'Patna', state: 'Bihar', country: 'India' },
  'vadodara': { latitude: 22.3072, longitude: 73.1812, city: 'Vadodara', state: 'Gujarat', country: 'India' },
  'ghaziabad': { latitude: 28.6692, longitude: 77.4538, city: 'Ghaziabad', state: 'Uttar Pradesh', country: 'India' },
  'ludhiana': { latitude: 30.9010, longitude: 75.8573, city: 'Ludhiana', state: 'Punjab', country: 'India' },
  'agra': { latitude: 27.1767, longitude: 78.0081, city: 'Agra', state: 'Uttar Pradesh', country: 'India' },
  'nashik': { latitude: 19.9975, longitude: 73.7898, city: 'Nashik', state: 'Maharashtra', country: 'India' },
  'faridabad': { latitude: 28.4089, longitude: 77.3178, city: 'Faridabad', state: 'Haryana', country: 'India' },
  'meerut': { latitude: 28.9845, longitude: 77.7064, city: 'Meerut', state: 'Uttar Pradesh', country: 'India' },
  'rajkot': { latitude: 22.3039, longitude: 70.8022, city: 'Rajkot', state: 'Gujarat', country: 'India' },
  'kalyan-dombivli': { latitude: 19.2403, longitude: 73.1305, city: 'Kalyan-Dombivli', state: 'Maharashtra', country: 'India' },
  'vasai-virar': { latitude: 19.4912, longitude: 72.8054, city: 'Vasai-Virar', state: 'Maharashtra', country: 'India' },
  'varanasi': { latitude: 25.3176, longitude: 82.9739, city: 'Varanasi', state: 'Uttar Pradesh', country: 'India' },
  'srinagar': { latitude: 34.0837, longitude: 74.7973, city: 'Srinagar', state: 'Jammu and Kashmir', country: 'India' },
  'aurangabad': { latitude: 19.8762, longitude: 75.3433, city: 'Aurangabad', state: 'Maharashtra', country: 'India' },
  'dhanbad': { latitude: 23.7957, longitude: 86.4304, city: 'Dhanbad', state: 'Jharkhand', country: 'India' },
  'amritsar': { latitude: 31.6340, longitude: 74.8723, city: 'Amritsar', state: 'Punjab', country: 'India' },
  'navi mumbai': { latitude: 19.0330, longitude: 73.0297, city: 'Navi Mumbai', state: 'Maharashtra', country: 'India' },
  'allahabad': { latitude: 25.4358, longitude: 81.8463, city: 'Allahabad', state: 'Uttar Pradesh', country: 'India' },
  'prayagraj': { latitude: 25.4358, longitude: 81.8463, city: 'Prayagraj', state: 'Uttar Pradesh', country: 'India' },
  'howrah': { latitude: 22.5958, longitude: 88.2636, city: 'Howrah', state: 'West Bengal', country: 'India' },
  'ranchi': { latitude: 23.3441, longitude: 85.3096, city: 'Ranchi', state: 'Jharkhand', country: 'India' },
  'gwalior': { latitude: 26.2183, longitude: 78.1828, city: 'Gwalior', state: 'Madhya Pradesh', country: 'India' },
  'jabalpur': { latitude: 23.1815, longitude: 79.9864, city: 'Jabalpur', state: 'Madhya Pradesh', country: 'India' },
  'coimbatore': { latitude: 11.0168, longitude: 76.9558, city: 'Coimbatore', state: 'Tamil Nadu', country: 'India' },
  'vijayawada': { latitude: 16.5062, longitude: 80.6480, city: 'Vijayawada', state: 'Andhra Pradesh', country: 'India' },
  'jodhpur': { latitude: 26.2389, longitude: 73.0243, city: 'Jodhpur', state: 'Rajasthan', country: 'India' },
  'madurai': { latitude: 9.9252, longitude: 78.1198, city: 'Madurai', state: 'Tamil Nadu', country: 'India' },
  'raipur': { latitude: 21.2514, longitude: 81.6296, city: 'Raipur', state: 'Chhattisgarh', country: 'India' },
  'kota': { latitude: 25.2138, longitude: 75.8648, city: 'Kota', state: 'Rajasthan', country: 'India' },
  'chandigarh': { latitude: 30.7333, longitude: 76.7794, city: 'Chandigarh', state: 'Chandigarh', country: 'India' },
  'guwahati': { latitude: 26.1445, longitude: 91.7362, city: 'Guwahati', state: 'Assam', country: 'India' },
  'solapur': { latitude: 17.6599, longitude: 75.9064, city: 'Solapur', state: 'Maharashtra', country: 'India' },
  'hubli-dharwad': { latitude: 15.3647, longitude: 75.1240, city: 'Hubli-Dharwad', state: 'Karnataka', country: 'India' },
  'bareilly': { latitude: 28.3670, longitude: 79.4304, city: 'Bareilly', state: 'Uttar Pradesh', country: 'India' },
  'moradabad': { latitude: 28.8386, longitude: 78.7733, city: 'Moradabad', state: 'Uttar Pradesh', country: 'India' },
  'mysore': { latitude: 12.2958, longitude: 76.6394, city: 'Mysore', state: 'Karnataka', country: 'India' },
  'mysuru': { latitude: 12.2958, longitude: 76.6394, city: 'Mysuru', state: 'Karnataka', country: 'India' },
  'tiruchirappalli': { latitude: 10.7905, longitude: 78.7047, city: 'Tiruchirappalli', state: 'Tamil Nadu', country: 'India' },
  'salem': { latitude: 11.6643, longitude: 78.1460, city: 'Salem', state: 'Tamil Nadu', country: 'India' },
  'tiruppur': { latitude: 11.1085, longitude: 77.3411, city: 'Tiruppur', state: 'Tamil Nadu', country: 'India' }
};

// State mappings for broader regional grouping
const STATE_CENTERS: { [key: string]: GeocodedLocation } = {
  'maharashtra': { latitude: 19.7515, longitude: 75.7139, state: 'Maharashtra', country: 'India' },
  'uttar pradesh': { latitude: 26.8467, longitude: 80.9462, state: 'Uttar Pradesh', country: 'India' },
  'karnataka': { latitude: 15.3173, longitude: 75.7139, state: 'Karnataka', country: 'India' },
  'tamil nadu': { latitude: 11.1271, longitude: 78.6569, state: 'Tamil Nadu', country: 'India' },
  'gujarat': { latitude: 22.2587, longitude: 71.1924, state: 'Gujarat', country: 'India' },
  'west bengal': { latitude: 22.9868, longitude: 87.8550, state: 'West Bengal', country: 'India' },
  'rajasthan': { latitude: 27.0238, longitude: 74.2179, state: 'Rajasthan', country: 'India' },
  'madhya pradesh': { latitude: 22.9734, longitude: 78.6569, state: 'Madhya Pradesh', country: 'India' },
  'telangana': { latitude: 18.1124, longitude: 79.0193, state: 'Telangana', country: 'India' },
  'andhra pradesh': { latitude: 15.9129, longitude: 79.7400, state: 'Andhra Pradesh', country: 'India' },
  'kerala': { latitude: 10.8505, longitude: 76.2711, state: 'Kerala', country: 'India' },
  'punjab': { latitude: 31.1471, longitude: 75.3412, state: 'Punjab', country: 'India' },
  'haryana': { latitude: 29.0588, longitude: 76.0856, state: 'Haryana', country: 'India' },
  'bihar': { latitude: 25.0961, longitude: 85.3131, state: 'Bihar', country: 'India' },
  'odisha': { latitude: 20.9517, longitude: 85.0985, state: 'Odisha', country: 'India' },
  'jharkhand': { latitude: 23.6102, longitude: 85.2799, state: 'Jharkhand', country: 'India' },
  'assam': { latitude: 26.2006, longitude: 92.9376, state: 'Assam', country: 'India' },
  'chhattisgarh': { latitude: 21.2787, longitude: 81.8661, state: 'Chhattisgarh', country: 'India' },
  'himachal pradesh': { latitude: 31.1048, longitude: 77.1734, state: 'Himachal Pradesh', country: 'India' },
  'uttarakhand': { latitude: 30.0668, longitude: 79.0193, state: 'Uttarakhand', country: 'India' },
  'jammu and kashmir': { latitude: 34.0837, longitude: 74.7973, state: 'Jammu and Kashmir', country: 'India' },
  'delhi': { latitude: 28.6139, longitude: 77.2090, state: 'Delhi', country: 'India' }
};

class EnhancedGeocodingService {
  private geocodingCache: Map<string, GeocodedLocation> = new Map();

  // Main geocoding function
  async geocodeLocation(locationString: string): Promise<GeocodedLocation | null> {
    if (!locationString || locationString.trim() === '') {
      return null;
    }

    const normalizedLocation = locationString.toLowerCase().trim();
    
    // Check cache first
    if (this.geocodingCache.has(normalizedLocation)) {
      return this.geocodingCache.get(normalizedLocation)!;
    }

    let result = this.findInDatabase(normalizedLocation);
    
    if (!result) {
      // Try online geocoding as fallback
      result = await this.onlineGeocode(normalizedLocation);
    }

    if (result) {
      result.displayName = locationString;
      this.geocodingCache.set(normalizedLocation, result);
    }

    return result;
  }

  // Search in local database
  private findInDatabase(locationString: string): GeocodedLocation | null {
    const searchTerms = locationString.split(/[,\s]+/).map(term => term.trim().toLowerCase());
    
    // Direct city match
    for (const term of searchTerms) {
      if (INDIAN_CITIES_DATABASE[term]) {
        return { ...INDIAN_CITIES_DATABASE[term] };
      }
    }

    // Partial city match
    for (const [cityKey, cityData] of Object.entries(INDIAN_CITIES_DATABASE)) {
      for (const term of searchTerms) {
        if (cityKey.includes(term) || term.includes(cityKey)) {
          return { ...cityData };
        }
      }
    }

    // State match
    for (const term of searchTerms) {
      if (STATE_CENTERS[term]) {
        return { ...STATE_CENTERS[term] };
      }
    }

    // Partial state match
    for (const [stateKey, stateData] of Object.entries(STATE_CENTERS)) {
      for (const term of searchTerms) {
        if (stateKey.includes(term) || term.includes(stateKey)) {
          return { ...stateData };
        }
      }
    }

    return null;
  }

  // Online geocoding fallback using Nominatim
  private async onlineGeocode(locationString: string): Promise<GeocodedLocation | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&limit=1&q=${encodeURIComponent(locationString + ', India')}`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          displayName: result.display_name,
          city: this.extractCity(result.display_name),
          state: this.extractState(result.display_name),
          country: 'India'
        };
      }
    } catch (error) {
      console.warn('Online geocoding failed:', error);
    }

    return null;
  }

  // Extract city from display name
  private extractCity(displayName: string): string {
    const parts = displayName.split(',');
    return parts[0]?.trim() || 'Unknown City';
  }

  // Extract state from display name
  private extractState(displayName: string): string {
    const parts = displayName.split(',');
    // Usually the state is the second-to-last or third-to-last part
    if (parts.length >= 3) {
      return parts[parts.length - 3]?.trim() || 'Unknown State';
    }
    return 'Unknown State';
  }

  // Generate random coordinates within a region (for demo purposes)
  generateRandomLocationInIndia(): GeocodedLocation {
    const cities = Object.values(INDIAN_CITIES_DATABASE);
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    
    // Add some random offset to simulate nearby locations
    const latOffset = (Math.random() - 0.5) * 0.1; // ±0.05 degrees (~5km)
    const lngOffset = (Math.random() - 0.5) * 0.1;
    
    return {
      latitude: randomCity.latitude + latOffset,
      longitude: randomCity.longitude + lngOffset,
      city: randomCity.city,
      state: randomCity.state,
      country: 'India'
    };
  }

  // Batch geocode multiple locations
  async batchGeocode(locations: string[]): Promise<(GeocodedLocation | null)[]> {
    const results: (GeocodedLocation | null)[] = [];
    
    for (const location of locations) {
      try {
        const result = await this.geocodeLocation(location);
        results.push(result);
        
        // Add small delay to avoid overwhelming the API
        if (location.includes('nominatim')) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.warn(`Failed to geocode ${location}:`, error);
        results.push(null);
      }
    }
    
    return results;
  }
}

export const enhancedGeocodingService = new EnhancedGeocodingService();
/**
 * Location Service for Luach Board App
 * Handles location management including geocoding from zip codes and GPS
 */

class LocationService {
    constructor() {
        this.currentLocation = null;
        this.apiKey = null; // You'll need to set up a geocoding API key
        this.storageKey = 'luach-location-settings';
        this.titleKey = 'luach-custom-title';
        this.loadSavedLocation();
    }

    /**
     * Load saved location from local storage
     */
    loadSavedLocation() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                this.currentLocation = JSON.parse(saved);
            } else {
                // Default to New York if no location set
                this.currentLocation = {
                    name: 'New York, NY',
                    latitude: 40.7128,
                    longitude: -74.0060,
                    timezone: 'America/New_York',
                    method: 'default'
                };
            }
        } catch (error) {
            console.error('Error loading saved location:', error);
            this.setDefaultLocation();
        }
    }

    /**
     * Save current location to local storage
     */
    saveLocation() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.currentLocation));
            return true;
        } catch (error) {
            console.error('Error saving location:', error);
            return false;
        }
    }

    /**
     * Set default location (New York)
     */
    setDefaultLocation() {
        this.currentLocation = {
            name: 'New York, NY',
            latitude: 40.7128,
            longitude: -74.0060,
            timezone: 'America/New_York',
            method: 'default'
        };
    }

    /**
     * Get current location data
     */
    getCurrentLocation() {
        return this.currentLocation;
    }

    /**
     * Geocode a zip code to get lat/lng coordinates (offline/local first)
     * Uses local zip code database if available, otherwise falls back to API
     */
    async geocodeZipCode(zipCode) {
        // Try local lookup first
        if (!this._zipcodes) {
            // Lazy-load the zip code data (replace with full file for production)
            try {
                // For demo, use a small sample. For production, load a full JSON file.
                this._zipcodes = (await import('./zipcodes-sample.js')).US_ZIPCODES;
            } catch (e) {
                this._zipcodes = {};
            }
        }
        const zip = zipCode.trim();
        if (this._zipcodes[zip]) {
            const entry = this._zipcodes[zip];
            return {
                success: true,
                data: {
                    name: `${entry.city}, ${entry.state}`,
                    latitude: entry.lat,
                    longitude: entry.lng,
                    source: 'LocalZipDB'
                }
            };
        }

        try {
            // First try: Free service (nominatim)
            const nominatimResult = await this.geocodeWithNominatim(zipCode);
            if (nominatimResult.success) {
                return nominatimResult;
            }

            // Second try: zip-codes.com API (if available)
            const zipApiResult = await this.geocodeWithZipAPI(zipCode);
            if (zipApiResult.success) {
                return zipApiResult;
            }

            // Third try: GeoNames (if available)
            const geonamesResult = await this.geocodeWithGeoNames(zipCode);
            if (geonamesResult.success) {
                return geonamesResult;
            }

            return {
                success: false,
                error: 'Unable to geocode zip code with any available service'
            };

        } catch (error) {
            console.error('Geocoding error:', error);
            return {
                success: false,
                error: 'Network error during geocoding'
            };
        }
    }

    /**
     * Geocode using OpenStreetMap Nominatim (free service)
     */
    async geocodeWithNominatim(zipCode) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(zipCode)}&countrycodes=us&format=json&limit=1`,
                {
                    headers: {
                        'User-Agent': 'LuachBoard/1.0'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            
            if (data && data.length > 0) {
                const result = data[0];
                return {
                    success: true,
                    data: {
                        name: result.display_name,
                        latitude: parseFloat(result.lat),
                        longitude: parseFloat(result.lon),
                        source: 'Nominatim'
                    }
                };
            }

            return { success: false, error: 'No results found' };

        } catch (error) {
            console.error('Nominatim geocoding error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Geocode using zip-codes.com API (backup service)
     */
    async geocodeWithZipAPI(zipCode) {
        try {
            // This would require an API key from zip-codes.com
            // Returning failure for now as it's a paid service
            return { success: false, error: 'Zip API not configured' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Geocode using GeoNames (backup service)
     */
    async geocodeWithGeoNames(zipCode) {
        try {
            // This would require a username from geonames.org
            // Free but requires registration
            return { success: false, error: 'GeoNames not configured' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get current GPS location
     */
    async getCurrentGPSLocation() {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve({
                    success: false,
                    error: 'Geolocation is not supported by this device'
                });
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        
                        // Try to reverse geocode to get a readable location name
                        const locationName = await this.reverseGeocode(latitude, longitude);
                        
                        resolve({
                            success: true,
                            data: {
                                name: locationName || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                                latitude: latitude,
                                longitude: longitude,
                                accuracy: position.coords.accuracy,
                                source: 'GPS'
                            }
                        });
                    } catch (error) {
                        resolve({
                            success: true,
                            data: {
                                name: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude,
                                accuracy: position.coords.accuracy,
                                source: 'GPS'
                            }
                        });
                    }
                },
                (error) => {
                    let errorMessage;
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location access denied by user';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information unavailable';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out';
                            break;
                        default:
                            errorMessage = 'Unknown location error';
                            break;
                    }
                    
                    resolve({
                        success: false,
                        error: errorMessage
                    });
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        });
    }

    /**
     * Reverse geocode coordinates to get location name
     */
    async reverseGeocode(latitude, longitude) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                {
                    headers: {
                        'User-Agent': 'LuachBoard/1.0'
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (data && data.display_name) {
                    // Extract city and state from display name
                    const parts = data.display_name.split(',');
                    if (parts.length >= 2) {
                        return `${parts[0].trim()}, ${parts[1].trim()}`;
                    }
                    return data.display_name;
                }
            }
        } catch (error) {
            console.error('Reverse geocoding error:', error);
        }

        return null;
    }

    /**
     * Detect timezone from coordinates
     */
    detectTimezone(latitude, longitude) {
        // Enhanced timezone detection based on longitude and latitude
        // This is still approximate but more accurate
        
        // Special cases based on latitude and longitude
        if (latitude >= 31 && latitude <= 33.5 && longitude >= 34 && longitude <= 36) {
            return 'Asia/Jerusalem'; // Israel
        }
        
        if (latitude >= 49 && latitude <= 83 && longitude >= -141 && longitude <= -52) {
            // Canada - rough approximation
            if (longitude >= -141 && longitude < -120) return 'America/Vancouver';
            if (longitude >= -120 && longitude < -90) return 'America/Winnipeg';
            return 'America/Toronto';
        }
        
        // US timezone detection based on longitude
        const usTimezones = [
            { min: -180, max: -135, tz: 'Pacific/Honolulu' },
            { min: -135, max: -120, tz: 'America/Anchorage' },
            { min: -120, max: -105, tz: 'America/Los_Angeles' },
            { min: -105, max: -90, tz: 'America/Denver' },
            { min: -90, max: -75, tz: 'America/Chicago' },
            { min: -75, max: -60, tz: 'America/New_York' }
        ];
        
        // Check if coordinates are likely in US/Canada range
        if (latitude >= 25 && latitude <= 72 && longitude >= -180 && longitude <= -60) {
            for (const zone of usTimezones) {
                if (longitude >= zone.min && longitude < zone.max) {
                    return zone.tz;
                }
            }
        }
        
        // European timezone detection
        if (latitude >= 35 && latitude <= 71 && longitude >= -10 && longitude <= 40) {
            if (longitude >= -10 && longitude < 0) return 'Europe/London';
            if (longitude >= 0 && longitude < 15) return 'Europe/Paris';
            if (longitude >= 15 && longitude < 30) return 'Europe/Berlin';
            return 'Europe/Paris'; // Default for Europe
        }
        
        // Australia
        if (latitude >= -45 && latitude <= -10 && longitude >= 110 && longitude <= 155) {
            if (longitude >= 110 && longitude < 130) return 'Australia/Perth';
            return 'Australia/Sydney';
        }
        
        // South America
        if (latitude >= -55 && latitude <= 15 && longitude >= -85 && longitude <= -30) {
            if (longitude >= -70 && longitude <= -50) return 'America/Argentina/Buenos_Aires';
            return 'America/Sao_Paulo';
        }
        
        // South Africa
        if (latitude >= -35 && latitude <= -22 && longitude >= 16 && longitude <= 33) {
            return 'Africa/Johannesburg';
        }
        
        // Default fallback
        return 'America/New_York';
    }

    /**
     * Update current location
     */
    updateLocation(locationData, method = 'manual') {
        this.currentLocation = {
            name: locationData.name,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            timezone: locationData.timezone || this.detectTimezone(locationData.latitude, locationData.longitude),
            method: method,
            updatedAt: new Date().toISOString()
        };

        return this.saveLocation();
    }

    /**
     * Validate coordinates
     */
    validateCoordinates(latitude, longitude) {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (isNaN(lat) || isNaN(lng)) {
            return { valid: false, error: 'Coordinates must be numbers' };
        }

        if (lat < -90 || lat > 90) {
            return { valid: false, error: 'Latitude must be between -90 and 90' };
        }

        if (lng < -180 || lng > 180) {
            return { valid: false, error: 'Longitude must be between -180 and 180' };
        }

        return { valid: true, latitude: lat, longitude: lng };
    }

    /**
     * Validate zip code format
     */
    validateZipCode(zipCode) {
        const zip = zipCode.trim();
        
        // US zip code patterns (5 digits or 5+4)
        const zipPattern = /^\d{5}(-\d{4})?$/;
        
        if (!zipPattern.test(zip)) {
            return { valid: false, error: 'Invalid zip code format (use 12345 or 12345-6789)' };
        }

        return { valid: true, zipCode: zip };
    }

    /**
     * Get location display string
     */
    getLocationDisplayString() {
        if (!this.currentLocation) {
            return 'No location set';
        }

        return `${this.currentLocation.name} (${this.currentLocation.latitude.toFixed(4)}, ${this.currentLocation.longitude.toFixed(4)})`;
    }

    /**
     * Check if location is set
     */
    hasLocation() {
        return this.currentLocation && 
               typeof this.currentLocation.latitude === 'number' && 
               typeof this.currentLocation.longitude === 'number';
    }

    /**
     * Get custom title from local storage
     */
    getCustomTitle() {
        return localStorage.getItem(this.titleKey) || '';
    }

    /**
     * Set custom title in local storage
     */
    setCustomTitle(title) {
        if (title) {
            localStorage.setItem(this.titleKey, title);
        } else {
            localStorage.removeItem(this.titleKey);
        }
    }
}

// Create global instance
window.locationService = new LocationService();


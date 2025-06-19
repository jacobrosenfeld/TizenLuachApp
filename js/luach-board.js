/**
 * Luach Board Main Application
 * Handles UI interactions and coordinates between location service and zmanim calculations
 */

class LuachBoardApp {
    constructor() {
        this.currentPage = 'main-page';
        this.refreshInterval = null;
        this.autoRefreshMinutes = 60; // Refresh every hour
        this.showSeconds = this.loadShowSecondsSetting();
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    /**
     * Initialize the application
     */
    init() {
        try {
            console.log('Initializing Luach Board App...');
            
            this.setupEventListeners();
            this.loadInitialData();
            this.startAutoRefresh();
            this.updateHeaderTitle();
            console.log('Luach Board App initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize application');
        }
    }

    loadShowSecondsSetting() {
        return localStorage.getItem('luach-show-seconds') === 'true';
    }
    saveShowSecondsSetting(val) {
        localStorage.setItem('luach-show-seconds', val ? 'true' : 'false');
    }

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Main page navigation
        const settingsBtn = document.getElementById('settings-btn');
        const locationEditBtn = document.getElementById('location-edit-btn');
        const refreshBtn = document.getElementById('refresh-btn');
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showLocationSettings());
        }
        
        if (locationEditBtn) {
            locationEditBtn.addEventListener('click', () => this.showLocationSettings());
        }
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshZmanim());
        }

        // Location settings page
        const backBtn = document.getElementById('back-btn');
        const saveLocationBtn = document.getElementById('save-location-btn');
        const geocodeBtn = document.getElementById('geocode-btn');
        const getGpsBtn = document.getElementById('get-gps-btn');
        
        if (backBtn) {
            backBtn.addEventListener('click', () => this.showMainPage());
        }
        
        if (saveLocationBtn) {
            saveLocationBtn.addEventListener('click', () => this.saveLocation());
        }
        
        if (geocodeBtn) {
            geocodeBtn.addEventListener('click', () => this.geocodeZipCode());
        }
        
        if (getGpsBtn) {
            getGpsBtn.addEventListener('click', () => this.getGPSLocation());
        }

        // Location method radio buttons
        const locationMethodRadios = document.querySelectorAll('input[name="location-method"]');
        locationMethodRadios.forEach(radio => {
            radio.addEventListener('change', () => this.handleLocationMethodChange(radio.value));
        });

        // Auto-refresh when input values change in coordinates section
        const latInput = document.getElementById('latitude-input');
        const lngInput = document.getElementById('longitude-input');
        
        if (latInput && lngInput) {
            [latInput, lngInput].forEach(input => {
                input.addEventListener('blur', () => this.validateAndPreviewCoordinates());
            });
        }

        // Show seconds toggle (now a button)
        const showSecondsBtn = document.getElementById('show-seconds-btn');
        if (showSecondsBtn) {
            this.updateShowSecondsButton(showSecondsBtn);
            showSecondsBtn.addEventListener('click', () => {
                this.showSeconds = !this.showSeconds;
                this.saveShowSecondsSetting(this.showSeconds);
                this.updateShowSecondsButton(showSecondsBtn);
                this.refreshZmanim();
            });
        }
    }

    updateShowSecondsButton(btn) {
        btn.textContent = this.showSeconds ? 'Hide Seconds' : 'Show Seconds';
        btn.classList.toggle('active', this.showSeconds);
    }

    /**
     * Load initial data and display
     */
    async loadInitialData() {
        try {
            await this.updateLocationDisplay();
            await this.refreshZmanim();
            this.updateCurrentLocationSettings();
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showError('Error loading initial data');
        }
    }

    /**
     * Update the location display in the main interface
     */
    async updateLocationDisplay() {
        const locationNameEl = document.getElementById('location-name');
        
        if (locationService.hasLocation()) {
            const location = locationService.getCurrentLocation();
            if (locationNameEl) {
                locationNameEl.textContent = location.name;
            }
        } else {
            if (locationNameEl) {
                locationNameEl.textContent = 'Location not set';
            }
        }
    }

    /**
     * Refresh zmanim calculations and update display
     */
    async refreshZmanim() {
        try {
            const refreshBtn = document.getElementById('refresh-btn');
            if (refreshBtn) {
                refreshBtn.classList.add('loading');
            }

            if (!locationService.hasLocation()) {
                this.showError('Please set your location first');
                return;
            }

            const location = locationService.getCurrentLocation();
            kosherJava.setLocation(
                location.latitude,
                location.longitude,
                location.timezone
            );

            const today = new Date();
            // Wait for kosherJava to be ready before calculating zmanim
            await kosherJava.ready();
            const zmanim = await kosherJava.calculateZmanim(today);
            this.updateZmanimDisplay(zmanim);
            this.updateDateDisplay(today);
            this.updateLastUpdated();
        } catch (error) {
            console.error('Error refreshing zmanim:', error);
            this.showError('Error calculating zmanim');
        } finally {
            const refreshBtn = document.getElementById('refresh-btn');
            if (refreshBtn) {
                refreshBtn.classList.remove('loading');
            }
        }
    }

    /**
     * Update the zmanim display with calculated times
     */
    updateZmanimDisplay(zmanim) {
        console.log('updateZmanimDisplay received:', zmanim);
        const timeElements = {
            'sunrise': zmanim.sunrise,
            'sunset': zmanim.sunset,
            'alos': zmanim.alos,
            'misheyakir': zmanim.misheyakir,
            'sof-zman-shma': zmanim.sofZmanShma,
            'sof-zman-tfila': zmanim.sofZmanTfila,
            'chatzos': zmanim.chatzos,
            'mincha-gedola': zmanim.minchaGedola,
            'mincha-ketana': zmanim.minchaKetana,
            'plag-hamincha': zmanim.plagHamincha,
            'bein-hashmashos': zmanim.beinHashmashos,
            'tzeit-hakochavim': zmanim.tzeitHakochavim,
            'tzeit-72': zmanim.tzeit72
        };

        for (const [elementId, time] of Object.entries(timeElements)) {
            const element = document.getElementById(elementId);
            let dateObj = time;
            if (typeof time === 'string') {
                dateObj = new Date(time);
            }
            if (element) {
                element.textContent = kosherJava.formatTime(dateObj, '12h', this.showSeconds);
            }
        }
    }

    /**
     * Update date display (Hebrew and English)
     */
    updateDateDisplay(date) {
        const hebrewDateEl = document.getElementById('hebrew-date');
        const englishDateEl = document.getElementById('english-date');

        if (englishDateEl) {
            englishDateEl.textContent = date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        if (hebrewDateEl) {
            const hebrewDate = kosherJava.getHebrewDate(date);
            if (hebrewDate && hebrewDate.formatted) {
                hebrewDateEl.textContent = hebrewDate.formatted;
            }
        }
    }

    /**
     * Update last updated timestamp
     */
    updateLastUpdated() {
        const lastUpdatedEl = document.getElementById('last-updated');
        if (lastUpdatedEl) {
            const now = new Date();
            lastUpdatedEl.textContent = `Last updated: ${now.toLocaleTimeString()}`;
        }
    }

    /**
     * Show location settings page
     */
    showLocationSettings() {
        this.currentPage = 'location-page';
        document.getElementById('main-page').classList.remove('ui-page-active');
        document.getElementById('location-page').classList.add('ui-page-active');
        // Load custom title into input
        const customTitleInput = document.getElementById('custom-title-input');
        if (customTitleInput) {
            customTitleInput.value = locationService.getCustomTitle();
        }
    }

    /**
     * Show main page
     */
    showMainPage() {
        this.currentPage = 'main-page';
        document.getElementById('location-page').classList.remove('ui-page-active');
        document.getElementById('main-page').classList.add('ui-page-active');
        
        // Refresh zmanim in case location changed
        this.refreshZmanim();
        this.updateLocationDisplay();
    }

    /**
     * Handle location method change
     */
    handleLocationMethodChange(method) {
        // Hide all sections first
        document.getElementById('zipcode-section').classList.add('hidden');
        document.getElementById('coordinates-section').classList.add('hidden');
        document.getElementById('gps-section').classList.add('hidden');

        // Show selected section
        switch (method) {
            case 'zipcode':
                document.getElementById('zipcode-section').classList.remove('hidden');
                break;
            case 'coordinates':
                document.getElementById('coordinates-section').classList.remove('hidden');
                break;
            case 'gps':
                document.getElementById('gps-section').classList.remove('hidden');
                break;
        }
    }

    /**
     * Geocode zip code
     */
    async geocodeZipCode() {
        const zipInput = document.getElementById('zipcode-input');
        const geocodeBtn = document.getElementById('geocode-btn');
        const resultEl = document.getElementById('geocode-result');

        if (!zipInput || !zipInput.value.trim()) {
            this.showGeocodeResult('Please enter a zip code', 'error');
            return;
        }

        const zipCode = zipInput.value.trim();
        
        // Validate zip code format
        const validation = locationService.validateZipCode(zipCode);
        if (!validation.valid) {
            this.showGeocodeResult(validation.error, 'error');
            return;
        }

        try {
            geocodeBtn.disabled = true;
            geocodeBtn.textContent = 'Looking up...';
            
            const result = await locationService.geocodeZipCode(validation.zipCode);
            
            if (result.success) {
                this.showGeocodeResult(
                    `Found: ${result.data.name}\nLat: ${result.data.latitude.toFixed(4)}, Lng: ${result.data.longitude.toFixed(4)}`,
                    'success'
                );
                
                // Store the geocoded data for saving
                this.pendingLocation = {
                    name: result.data.name,
                    latitude: result.data.latitude,
                    longitude: result.data.longitude,
                    method: 'zipcode'
                };
            } else {
                this.showGeocodeResult(`Error: ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            this.showGeocodeResult('Network error during lookup', 'error');
        } finally {
            geocodeBtn.disabled = false;
            geocodeBtn.textContent = 'Lookup';
        }
    }

    /**
     * Get GPS location
     */
    async getGPSLocation() {
        const getGpsBtn = document.getElementById('get-gps-btn');
        const resultEl = document.getElementById('gps-result');

        try {
            getGpsBtn.disabled = true;
            getGpsBtn.textContent = 'Getting location...';
            
            const result = await locationService.getCurrentGPSLocation();
            
            if (result.success) {
                this.showGPSResult(
                    `Location found: ${result.data.name}\nLat: ${result.data.latitude.toFixed(4)}, Lng: ${result.data.longitude.toFixed(4)}\nAccuracy: ${Math.round(result.data.accuracy)}m`,
                    'success'
                );
                
                // Store the GPS data for saving
                this.pendingLocation = {
                    name: result.data.name,
                    latitude: result.data.latitude,
                    longitude: result.data.longitude,
                    method: 'gps'
                };
            } else {
                this.showGPSResult(`Error: ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('GPS error:', error);
            this.showGPSResult('Error getting GPS location', 'error');
        } finally {
            getGpsBtn.disabled = false;
            getGpsBtn.textContent = 'Get Current Location';
        }
    }

    /**
     * Validate and preview coordinates
     */
    validateAndPreviewCoordinates() {
        const latInput = document.getElementById('latitude-input');
        const lngInput = document.getElementById('longitude-input');
        const nameInput = document.getElementById('location-name-input');

        if (!latInput.value || !lngInput.value) return;

        const validation = locationService.validateCoordinates(latInput.value, lngInput.value);
        
        if (validation.valid) {
            this.pendingLocation = {
                name: nameInput.value || `${validation.latitude.toFixed(4)}, ${validation.longitude.toFixed(4)}`,
                latitude: validation.latitude,
                longitude: validation.longitude,
                method: 'coordinates'
            };
        }
    }

    /**
     * Save location settings
     */
    async saveLocation() {
        try {
            const selectedMethod = document.querySelector('input[name="location-method"]:checked').value;
            let locationData = null;

            if (selectedMethod === 'zipcode') {
                const zipInput = document.getElementById('zipcode-input');
                const zip = zipInput.value.trim();
                if (!zip) {
                    // No zip entered: if current location exists, allow save
                    if (locationService.hasLocation()) {
                        locationData = locationService.getCurrentLocation();
                    } else {
                        this.showError('Please enter a zip code or set a location');
                        return;
                    }
                } else {
                    const validation = locationService.validateZipCode(zip);
                    if (!validation.valid) {
                        this.showError(validation.error);
                        return;
                    }
                    // If no pendingLocation or pendingLocation doesn't match input, do lookup now
                    if (!this.pendingLocation || this.pendingLocation.method !== 'zipcode' || this.pendingLocation.name !== zip) {
                        // Attempt lookup
                        const geocodeBtn = document.getElementById('geocode-btn');
                        if (geocodeBtn) geocodeBtn.disabled = true;
                        const result = await locationService.geocodeZipCode(validation.zipCode);
                        if (geocodeBtn) geocodeBtn.disabled = false;
                        if (result.success) {
                            this.pendingLocation = {
                                name: result.data.name,
                                latitude: result.data.latitude,
                                longitude: result.data.longitude,
                                method: 'zipcode'
                            };
                        } else {
                            this.showError(result.error || 'Unable to lookup zip code');
                            return;
                        }
                    }
                    locationData = this.pendingLocation;
                }
            } else if (selectedMethod === 'coordinates') {
                const latInput = document.getElementById('latitude-input');
                const lngInput = document.getElementById('longitude-input');
                const nameInput = document.getElementById('location-name-input');
                const validation = locationService.validateCoordinates(latInput.value, lngInput.value);
                if (!validation.valid) {
                    this.showError(validation.error);
                    return;
                }
                locationData = {
                    name: nameInput.value || `${validation.latitude.toFixed(4)}, ${validation.longitude.toFixed(4)}`,
                    latitude: validation.latitude,
                    longitude: validation.longitude
                };
            } else if (this.pendingLocation) {
                locationData = this.pendingLocation;
            } else if (locationService.hasLocation()) {
                locationData = locationService.getCurrentLocation();
            } else {
                this.showError('Please select and configure a location first');
                return;
            }

            // Get timezone selection
            const timezoneSelect = document.getElementById('timezone-select');
            if (timezoneSelect.value !== 'auto') {
                locationData.timezone = timezoneSelect.value;
            }

            // Save location
            const success = locationService.updateLocation(locationData, selectedMethod);
            
            if (success) {
                // Save custom title
                const customTitleInput = document.getElementById('custom-title-input');
                if (customTitleInput) {
                    locationService.setCustomTitle(customTitleInput.value.trim());
                }
                // Update header title immediately
                this.updateHeaderTitle();

                this.updateCurrentLocationSettings();
                this.showMainPage();
                this.showSuccess('Location saved successfully', locationData);
            } else {
                this.showError('Failed to save location');
            }
        } catch (error) {
            console.error('Error saving location:', error);
            this.showError('Error saving location');
        }
    }

    /**
     * Update current location display in settings
     */
    updateCurrentLocationSettings() {
        const currentLocationName = document.getElementById('current-location-name');
        const currentCoordinates = document.getElementById('current-coordinates');
        const currentTimezone = document.getElementById('current-timezone');

        if (locationService.hasLocation()) {
            const location = locationService.getCurrentLocation();
            
            if (currentLocationName) {
                currentLocationName.textContent = location.name;
            }
            
            if (currentCoordinates) {
                currentCoordinates.textContent = `Lat: ${location.latitude.toFixed(4)}, Lon: ${location.longitude.toFixed(4)}`;
            }
            
            if (currentTimezone) {
                currentTimezone.textContent = `Timezone: ${location.timezone}`;
            }
        } else {
            if (currentLocationName) currentLocationName.textContent = 'Not set';
            if (currentCoordinates) currentCoordinates.textContent = 'Lat: --, Lon: --';
            if (currentTimezone) currentTimezone.textContent = 'Timezone: --';
        }
    }

    /**
     * Update header title on main page
     */
    updateHeaderTitle() {
        const customTitle = locationService.getCustomTitle();
        const titleEl = document.querySelector('.ui-title');
        if (titleEl) {
            titleEl.textContent = customTitle || 'Luach Board';
        }
    }

    /**
     * Show geocode result
     */
    showGeocodeResult(message, type) {
        const resultEl = document.getElementById('geocode-result');
        if (resultEl) {
            resultEl.textContent = message;
            resultEl.className = `geocode-result ${type}`;
        }
    }

    /**
     * Show GPS result
     */
    showGPSResult(message, type) {
        const resultEl = document.getElementById('gps-result');
        if (resultEl) {
            resultEl.textContent = message;
            resultEl.className = `gps-result ${type}`;
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        // Show error in a red bar above the Save Settings button
        let errorEl = document.getElementById('settings-error');
        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.id = 'settings-error';
            errorEl.style.color = '#fff';
            errorEl.style.background = '#e74c3c';
            errorEl.style.padding = '10px';
            errorEl.style.margin = '10px 0';
            errorEl.style.borderRadius = '8px';
            errorEl.style.textAlign = 'center';
            errorEl.style.fontWeight = 'bold';
            errorEl.style.fontSize = '15px';
        }
        errorEl.textContent = message;
        errorEl.style.display = 'block';
        // Insert above the Save Settings button
        const saveBtn = document.getElementById('save-location-btn');
        if (saveBtn && saveBtn.parentElement) {
            saveBtn.parentElement.insertBefore(errorEl, saveBtn);
        }
        // Hide after 5 seconds
        setTimeout(() => { if (errorEl) errorEl.style.display = 'none'; }, 5000);
    }

    /**
     * Show success message
     */
    showSuccess(message, locationData) {
        // Display success message as a green popup in the top-right corner
        const successContainer = document.getElementById('success-message-container');
        const successText = document.getElementById('success-message-text');
        if (successContainer && successText) {
            const locationInfo = locationData ? `Location: ${locationData.name}, Timezone: ${locationData.timezone || 'auto'}` : '';
            successText.textContent = `Success: ${message}. ${locationInfo}`;
            successContainer.classList.remove('hidden');
            successContainer.style.opacity = '1';
            successContainer.style.display = 'block';

            // Fade out after 5 seconds
            setTimeout(() => {
                successContainer.style.opacity = '0';
                setTimeout(() => {
                    successContainer.style.display = 'none';
                    successContainer.classList.add('hidden');
                }, 500); // match CSS transition
            }, 5000);
        }
    }

    /**
     * Start auto-refresh timer
     */
    startAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        this.refreshInterval = setInterval(() => {
            if (this.currentPage === 'main-page' && locationService.hasLocation()) {
                this.refreshZmanim();
            }
        }, this.autoRefreshMinutes * 60 * 1000);
    }

    /**
     * Stop auto-refresh timer
     */
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.stopAutoRefresh();
    }
}

// Initialize the app when the page loads
window.luachBoardApp = new LuachBoardApp();


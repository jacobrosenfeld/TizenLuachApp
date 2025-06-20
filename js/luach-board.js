/**
 * Luach Board Main Application
 * Handles UI interactions and coordinates between location service and zmanim calculations
 */

class LuachBoardApp {
    constructor() {
        this.currentPage = 'main-page';
        this.refreshInterval = null;
        this.autoRefreshMinutes = this.loadAutoRefreshSetting();
        this.showSeconds = this.loadShowSecondsSetting();
        this.allowZmanimLookups = this.loadAllowZmanimLookupsSetting();
        this.debugMode = this.loadDebugModeSetting();
        this.selectedDate = new Date();
        
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

    loadAutoRefreshSetting() {
        const val = localStorage.getItem('luach-auto-refresh-minutes');
        return val ? parseInt(val, 10) || 60 : 60;
    }
    saveAutoRefreshSetting(val) {
        localStorage.setItem('luach-auto-refresh-minutes', String(val));
    }

    loadShowSecondsSetting() {
        return localStorage.getItem('luach-show-seconds') === 'true';
    }
    saveShowSecondsSetting(val) {
        localStorage.setItem('luach-show-seconds', val ? 'true' : 'false');
    }

    loadAllowZmanimLookupsSetting() {
        return localStorage.getItem('luach-allow-zmanim-lookups') === 'true';
    }
    saveAllowZmanimLookupsSetting(val) {
        localStorage.setItem('luach-allow-zmanim-lookups', val ? 'true' : 'false');
    }

    loadDebugModeSetting() {
        return localStorage.getItem('luach-debug') === 'true';
    }
    saveDebugModeSetting(val) {
        localStorage.setItem('luach-debug', val ? 'true' : 'false');
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

        // Settings page
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

        // Auto-refresh interval input
        const autoRefreshInput = document.getElementById('auto-refresh-input');
        if (autoRefreshInput) {
            autoRefreshInput.value = this.autoRefreshMinutes;
            autoRefreshInput.addEventListener('change', (e) => {
                let val = parseInt(autoRefreshInput.value, 10);
                if (isNaN(val) || val < 1) val = 1;
                if (val > 1440) val = 1440;
                this.autoRefreshMinutes = val;
                this.saveAutoRefreshSetting(val);
                autoRefreshInput.value = val;
                this.startAutoRefresh();
            });
        }

        // Allow Zmanim Lookups toggle
        const allowLookupsBtn = document.getElementById('allow-zmanim-lookups-btn');
        if (allowLookupsBtn) {
            this.updateAllowLookupsButton(allowLookupsBtn);
            allowLookupsBtn.addEventListener('click', () => {
                this.allowZmanimLookups = !this.allowZmanimLookups;
                this.saveAllowZmanimLookupsSetting(this.allowZmanimLookups);
                this.updateAllowLookupsButton(allowLookupsBtn);
                this.renderDatePickerAndArrows();
            });
        }

        // Debug Mode toggle
        const debugModeBtn = document.getElementById('debug-mode-btn');
        if (debugModeBtn) {
            this.updateDebugModeButton(debugModeBtn);
            debugModeBtn.addEventListener('click', () => {
                this.debugMode = !this.debugMode;
                this.updateDebugModeButton(debugModeBtn);
                // Do not save or reload here; wait for Save Settings
            });
        }

        // Date picker and arrows
        document.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'zmanim-date-left') {
                this.changeSelectedDate(-1);
            } else if (e.target && e.target.id === 'zmanim-date-right') {
                this.changeSelectedDate(1);
            }
        });

        // Date picker change
        document.addEventListener('change', (e) => {
            if (e.target && e.target.id === 'zmanim-date-picker') {
                const val = e.target.value;
                if (val) {
                    this.selectedDate = new Date(val + 'T00:00:00');
                    this.refreshZmanim();
                }
            }
        });
    }

    updateShowSecondsButton(btn) {
        btn.textContent = this.showSeconds ? 'Hide Seconds' : 'Show Seconds';
        btn.classList.toggle('active', this.showSeconds);
    }

    updateAllowLookupsButton(btn) {
        btn.textContent = this.allowZmanimLookups ? 'Disable Zmanim Lookups' : 'Allow Zmanim Lookups';
        btn.classList.toggle('active', this.allowZmanimLookups);
    }

    updateDebugModeButton(btn) {
        btn.textContent = this.debugMode ? 'Disable Debug Mode' : 'Enable Debug Mode';
        btn.classList.toggle('active', this.debugMode);
    }

    renderDatePickerAndArrows() {
        const board = document.querySelector('.luach-board');
        if (!board) return;
        let picker = document.getElementById('zmanim-date-controls');
        if (this.allowZmanimLookups) {
            if (!picker) {
                const div = document.createElement('div');
                div.id = 'zmanim-date-controls';
                div.style.display = 'flex';
                div.style.justifyContent = 'center';
                div.style.alignItems = 'center';
                div.style.marginBottom = '10px';
                div.innerHTML = `
                    <button id="zmanim-date-left" class="ui-btn ui-btn-icon">&#8592;</button>
                    <input type="date" id="zmanim-date-picker" class="ui-input" style="width: 140px; margin: 0 8px;" value="${this.selectedDate.toISOString().slice(0,10)}">
                    <button id="zmanim-date-right" class="ui-btn ui-btn-icon">&#8594;</button>
                `;
                board.insertBefore(div, board.firstChild);
            } else {
                const input = picker.querySelector('#zmanim-date-picker');
                if (input) input.value = this.selectedDate.toISOString().slice(0,10);
            }
        } else if (picker) {
            picker.remove();
        }
    }

    changeSelectedDate(deltaDays) {
        const d = new Date(this.selectedDate);
        d.setDate(d.getDate() + deltaDays);
        this.selectedDate = d;
        this.renderDatePickerAndArrows();
        this.refreshZmanim();
    }

    /**
     * Load initial data and display
     */
    async loadInitialData() {
        try {
            this.renderDatePickerAndArrows();
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

            const date = this.allowZmanimLookups ? this.selectedDate : new Date();
            // Wait for kosherJava to be ready before calculating zmanim
            await kosherJava.ready();
            const zmanim = await kosherJava.calculateZmanim(date);
            this.updateZmanimDisplay(zmanim);
            this.updateDateDisplay(date);
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
            'sof-zman-shma-mga': zmanim.sofZmanShmaMGA,
            'sof-zman-shma-gra': zmanim.sofZmanShmaGRA,
            'sof-zman-tfila-mga': zmanim.sofZmanTfilaMGA,
            'sof-zman-tfila-gra': zmanim.sofZmanTfilaGRA,
            'chatzos': zmanim.chatzos,
            'mincha-gedola': zmanim.minchaGedola,
            'mincha-ketana': zmanim.minchaKetana,
            'plag-hamincha': zmanim.plagHamincha,
            'Tzeis-hakochavim': zmanim.tzeisHakochavim,
            'Tzeis-72': zmanim.tzeis72,
            'Tzeis-baal-hatanya': zmanim.tzeisBaalHatanya
        };

        // Candle lighting logic
        const candleLightingRow = document.getElementById('candleLighting')?.parentElement;
        if (candleLightingRow) {
            if (zmanim.candleLighting) {
                let dateObj = zmanim.candleLighting;
                if (typeof dateObj === 'string') {
                    dateObj = new Date(dateObj);
                }
                document.getElementById('candleLighting').textContent = kosherJava.formatTime(dateObj, '12h', this.showSeconds);
                candleLightingRow.style.display = '';
            } else {
                candleLightingRow.style.display = 'none';
            }
        }

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
            let enDate = date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            // Replace 'Saturday' with 'Shabbos'
            if (enDate.startsWith('Saturday')) {
                enDate = enDate.replace('Saturday', 'Shabbos');
            }
            englishDateEl.textContent = enDate;
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
     * Show Settings page
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
     * Save Settings
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

                // Save debug mode setting
                this.saveDebugModeSetting(this.debugMode);
                // Optionally, reload if debug mode changed
                if (this.debugMode !== (localStorage.getItem('luach-debug') === 'true')) {
                    location.reload();
                    return;
                }

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
        if (this.autoRefreshMinutes > 0) {
            this.refreshInterval = setInterval(() => {
                this.refreshZmanim();
            }, this.autoRefreshMinutes * 60 * 1000);
        }
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


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
        this.zmanimVisibility = this.loadZmanimVisibility();
        
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

    loadLabelLanguageSetting() {
        return localStorage.getItem('luach-label-language') || 'en';
    }
    saveLabelLanguageSetting(val) {
        localStorage.setItem('luach-label-language', val);
    }

    loadZmanimVisibility() {
        const json = localStorage.getItem('luach-zmanim-visibility');
        if (json) {
            try {
                return JSON.parse(json);
            } catch (e) {}
        }
        // Default: all true, based on ZMANIM_LIST
        if (window.ZMANIM_LIST) {
            const vis = {};
            window.ZMANIM_LIST.forEach(z => vis[z.id] = true);
            return vis;
        }
        return {};
    }
    saveZmanimVisibility(vis) {
        localStorage.setItem('luach-zmanim-visibility', JSON.stringify(vis));
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

        // Zmanim Label Language button group
        const labelLangEn = document.getElementById('label-lang-en');
        const labelLangBoth = document.getElementById('label-lang-both');
        const labelLangHe = document.getElementById('label-lang-he');
        const group = document.getElementById('label-language-group');
        if (labelLangEn && labelLangBoth && labelLangHe && group) {
            const updateActive = (val) => {
                labelLangEn.classList.remove('active');
                labelLangBoth.classList.remove('active');
                labelLangHe.classList.remove('active');
                if (val === 'en') labelLangEn.classList.add('active');
                else if (val === 'both') labelLangBoth.classList.add('active');
                else labelLangHe.classList.add('active');
            };
            let current = this.loadLabelLanguageSetting();
            updateActive(current);
            [labelLangEn, labelLangBoth, labelLangHe].forEach(btn => {
                btn.addEventListener('click', () => {
                    let val = btn.id === 'label-lang-en' ? 'en' : btn.id === 'label-lang-both' ? 'both' : 'he';
                    this.saveLabelLanguageSetting(val);
                    updateActive(val);
                    this.refreshZmanim();
                });
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

        // Zmanim toggle switches
        document.addEventListener('DOMContentLoaded', () => {
            const toggleList = document.getElementById('zmanim-toggle-list');
            if (toggleList && typeof ZMANIM_LIST !== 'undefined') {
                this.renderZmanimToggles(toggleList);
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

    renderZmanimToggles(container) {
        container.innerHTML = '';
        if (!window.ZMANIM_LIST) return;
        window.ZMANIM_LIST.forEach(zman => {
            const div = document.createElement('div');
            div.className = 'zmanim-toggle-row';
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.marginBottom = '6px';
            const label = document.createElement('label');
            label.textContent = zman.label;
            label.style.flex = '1';
            // Switch UI
            const switchLabel = document.createElement('label');
            switchLabel.className = 'switch';
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = this.zmanimVisibility[zman.id] !== false; // default ON
            input.addEventListener('change', () => {
                this.zmanimVisibility[zman.id] = input.checked;
                this.saveZmanimVisibility(this.zmanimVisibility);
                this.refreshZmanim();
            });
            const slider = document.createElement('span');
            slider.className = 'slider';
            switchLabel.appendChild(input);
            switchLabel.appendChild(slider);
            div.appendChild(label);
            div.appendChild(switchLabel);
            container.appendChild(div);
        });
    }

    renderZmanimList() {
        const list = document.getElementById('zmanim-list');
        if (!list || !window.ZMANIM_LIST) return;
        list.innerHTML = '';
        
        // Determine label language
        const labelLang = this.loadLabelLanguageSetting ? this.loadLabelLanguageSetting() : 'both';
        const showEn = labelLang === 'en' || labelLang === 'both';
        const showHe = labelLang === 'he' || labelLang === 'both';
        
        // Get the zmanim with their times for sorting
        let zmanimWithTimes = [...window.ZMANIM_LIST];
        
        // Sort by time if we have calculated zmanim available
        if (kosherJava.lastCalculatedZmanim) {
            const zmanim = kosherJava.lastCalculatedZmanim;
            
            // Add time values to the zmanim list for sorting
            zmanimWithTimes = zmanimWithTimes.map(z => {
                const timeValue = zmanim[z.id];
                return {
                    ...z,
                    timeObj: timeValue ? new Date(timeValue) : null
                };
            });
            
            // Sort by time (earliest to latest)
            zmanimWithTimes.sort((a, b) => {
                // Handle null values (put them at the end)
                if (!a.timeObj) return 1;
                if (!b.timeObj) return -1;
                return a.timeObj - b.timeObj;
            });
        }
        
        zmanimWithTimes.forEach(z => {
            if (this.zmanimVisibility && this.zmanimVisibility[z.id] === false) return;
            const row = document.createElement('div');
            row.className = 'zmanim-list-row';
            // Hebrew and English labels
            const en = document.createElement('span');
            en.className = 'label label-en';
            en.textContent = z.label.split('/')[0] ? z.label.split('/')[0].trim() : '';
            en.style.display = showEn ? '' : 'none';
            en.style.order = 1;
            const time = document.createElement('span');
            time.className = 'time';
            time.id = z.id;
            time.textContent = '--:--';
            time.style.order = 2;
            const he = document.createElement('span');
            he.className = 'label label-he';
            he.textContent = z.label.split('/')[1] ? z.label.split('/')[1].trim() : '';
            he.style.display = showHe ? '' : 'none';
            he.style.order = 3;
            row.appendChild(en);
            row.appendChild(time);
            row.appendChild(he);
            list.appendChild(row);
        });
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
            
            // Store the calculated zmanim for later use (for sorting)
            kosherJava.lastCalculatedZmanim = zmanim;
            
            // Render the zmanim list (now it will be sorted)
            this.renderZmanimList();
            
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
     * Refresh the zmanim list when new zmanim are added
     * without recalculating all zmanim
     */
    refreshZmanList() {
        // This method refreshes the zmanim list when new zmanim are added
        // without recalculating all zmanim
        if (kosherJava.lastCalculatedZmanim) {
            this.renderZmanimList();
            this.updateZmanimDisplay(kosherJava.lastCalculatedZmanim);
        } else {
            this.refreshZmanim();
        }
    }

    /**
     * Update the zmanim display with calculated times
     */
    updateZmanimDisplay(zmanim) {
        // Do not call renderZmanimList here anymore as it's called in refreshZmanim
        // after storing the zmanim for sorting
        
        if (!window.ZMANIM_LIST) return;
        window.ZMANIM_LIST.forEach(z => {
            const element = document.getElementById(z.id);
            if (element) {
                if (zmanim[z.id]) {
                    let dateObj = zmanim[z.id];
                    if (typeof dateObj === 'string') dateObj = new Date(dateObj);
                    element.textContent = kosherJava.formatTime(dateObj, '12h', this.showSeconds);
                }
            }
        });
        // Hide any time-item not in ZMANIM_LIST
        document.querySelectorAll('.time-item .time').forEach(el => {
            const id = el.id;
            if (!window.ZMANIM_LIST.find(z => z.id === id)) {
                el.parentElement.style.display = 'none';
            }
        });

        // Candle lighting logic
        const candleLightingRow = document.getElementById('candleLighting')?.parentElement;
        if (candleLightingRow) {
            // Only show if candleLighting is present in zmanim (set by wrapper only if hasCandleLighting is true)
            if (zmanim.candleLighting) {
                let dateObj = zmanim.candleLighting;
                if (typeof dateObj === 'string') {
                    dateObj = new Date(dateObj);
                }
                document.getElementById('candleLighting').textContent = kosherJava.formatTime(dateObj, '12h', this.showSeconds);
                candleLightingRow.style.display = '';
            } else {
                candleLightingRow.style.display = 'none';
                // Also clear any previous text just in case
                const candleLightingElem = document.getElementById('candleLighting');
                if (candleLightingElem) candleLightingElem.textContent = '--:--';
            }
        }

        // Show/hide labels based on language setting
        const labelLang = this.loadLabelLanguageSetting();
        const showEn = labelLang === 'en' || labelLang === 'both';
        const showHe = labelLang === 'he' || labelLang === 'both';
        // For each time-item, toggle label-en and label-he
        document.querySelectorAll('.time-item').forEach(item => {
            const en = item.querySelector('.label-en');
            const he = item.querySelector('.label-he');
            if (en) en.style.display = showEn ? '' : 'none';
            if (he) he.style.display = showHe ? '' : 'none';
        });
    }

    /**
     * Update date display (Hebrew and English)
     */
    updateDateDisplay(date) {
        const labelLang = this.loadLabelLanguageSetting();
        const hebrewDateEl = document.getElementById('hebrew-date');
        const englishDateEl = document.getElementById('english-date');

        // Determine if we are after sunset for the selected date
        let useNextJewishDay = false;
        let sunset = null;
        if (kosherJava.lastCalculatedZmanim && kosherJava.lastCalculatedZmanim.sunset) {
            sunset = kosherJava.lastCalculatedZmanim.sunset;
            if (typeof sunset === 'string') sunset = new Date(sunset);
            const now = new Date();
            if (date.toDateString() === now.toDateString() && now > sunset) {
                useNextJewishDay = true;
            }
        }

        // For Hebrew date, use the next day if after sunset
        let jewishDateToShow = new Date(date);
        if (useNextJewishDay) {
            jewishDateToShow.setDate(jewishDateToShow.getDate() + 1);
        }

        if (labelLang === 'en') {
            if (englishDateEl) englishDateEl.style.display = '';
            if (hebrewDateEl) hebrewDateEl.style.display = 'none';
        } else if (labelLang === 'he') {
            if (englishDateEl) englishDateEl.style.display = 'none';
            if (hebrewDateEl) hebrewDateEl.style.display = '';
        } else {
            if (englishDateEl) englishDateEl.style.display = '';
            if (hebrewDateEl) hebrewDateEl.style.display = '';
        }

        // Always show the civil (English) date for the selected date
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

        // Only the Hebrew date changes after sunset
        if (hebrewDateEl) {
            const hebrewDate = kosherJava.getHebrewDate(jewishDateToShow);
            if (hebrewDate && hebrewDate.formatted) {
                let hebText = hebrewDate.formatted;
                if (useNextJewishDay) {
                    // Add 'ליל' prefix and day name
                    const dayName = kosherJava.getHebrewDayName(jewishDateToShow);
                    hebText = `ליל ${dayName} (${hebText})`;
                }
                hebrewDateEl.textContent = hebText;
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

        // Refresh zmanim toggles in settings
        setTimeout(() => {
            const toggleList = document.getElementById('zmanim-toggle-list');
            if (toggleList && typeof ZMANIM_LIST !== 'undefined') {
                this.renderZmanimToggles(toggleList);
            }
        }, 0);
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
                this.showSuccess('Settings saved successfully', locationData);
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

    /**
     * Load zmanim list from an external JSON file or API endpoint
     * This allows for dynamic customization of zmanim list without changing the code
     * @param {string} url - URL to the JSON file or API endpoint
     */
    async loadZmanimListFromUrl(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch zmanim list: ${response.status}`);
            }
            const zmanimList = await response.json();
            
            // Replace the current ZMANIM_LIST with the new one
            window.ZMANIM_LIST = zmanimList;
            
            // Refresh the display
            this.refreshZmanList();
            
            return true;
        } catch (error) {
            console.error('Failed to load zmanim list:', error);
            this.showError('Failed to load zmanim list');
            return false;
        }
    }
}

// Initialize the app when the page loads
window.luachBoardApp = new LuachBoardApp();


/**
 * KosherJava Wrapper for Luach Board App
 * This module provides JavaScript interface to zmanim calculations
 * Note: This is a simplified implementation. For production use, you would
 * need to integrate with the actual KosherJava library or API
 */

class KosherJavaWrapper {
    constructor() {
        this.defaultElevation = 30; // Sea level
        this.zmanimCalculator = null;
        this.jewishCalendar = null;
        this.hebrewDateFormatter = null;
        this.initialized = false;
        this.lastCalculatedZmanim = null; // Store the last calculated zmanim for sorting
        this._readyPromise = new Promise((resolve) => {
            if (window.KosherZmanim) {
                this.initialized = true;
                resolve();
            } else {
                document.addEventListener('kosher-zmanim-loaded', () => {
                    this.initialized = true;
                    resolve();
                }, { once: true });
            }
        });
        
        this.init();
    }

    async ready() {
        await this._readyPromise;
    }

    /**
     * Initialize the wrapper
     * In a real implementation, this would load the KosherJava library
     */
    init() {
        try {
            // Simulated initialization
            // In production, you would initialize actual KosherJava objects here
            this.initialized = true;
            console.log('KosherJava wrapper initialized');
        } catch (error) {
            console.error('Failed to initialize KosherJava wrapper:', error);
            this.initialized = false;
        }
    }

    /**
     * Set location for calculations
     */
    setLocation(latitude, longitude, timezone, elevation = 0) {
        try {
            // In real implementation, you would create GeoLocation object:
            // this.geoLocation = new GeoLocation(locationName, latitude, longitude, elevation, timezone);
            // this.zmanimCalculator = new ZmanimCalendar(this.geoLocation);
            
            this.location = {
                latitude,
                longitude,
                timezone,
                elevation
            };
            
            return true;
        } catch (error) {
            console.error('Error setting location:', error);
            return false;
        }
    }

    /**
     * Calculate all zmanim for a given date using kosher-zmanim
     */
    async calculateZmanim(date = new Date()) {
        await this.ready();
        if (!this.location) {
            throw new Error('Location not set');
        }
        if (!window.KosherZmanim) {
            throw new Error('kosher-zmanim library not loaded');
        }
        const { latitude, longitude, timezone, elevation } = this.location;
        const GeoLocation = window.KosherZmanim.GeoLocation;
        const ComplexZmanimCalendar = window.KosherZmanim.ComplexZmanimCalendar;
        const JewishCalendar = window.KosherZmanim.JewishCalendar;
        const geoLocation = new GeoLocation('Location', latitude, longitude, elevation || 0, timezone);
        const zmanimCalendar = new ComplexZmanimCalendar(geoLocation);
        zmanimCalendar.setDate(date);
        const jewishCal = new JewishCalendar(date);
        
        // Dynamically calculate zmanim from ZMANIM_LIST
        const zmanim = {};
        
        if (window.ZMANIM_LIST) {
            // Store registered methods for debugging
            const registeredMethods = [];
            
            // Go through each zman in the ZMANIM_LIST
            for (const zman of window.ZMANIM_LIST) {
                try {
                    // Skip if no method is defined
                    if (!zman.method) continue;

                    // Special case: candleLighting should only be set if hasCandleLighting() is true
                    if (zman.id === 'candleLighting') {
                        if (jewishCal.hasCandleLighting && jewishCal.hasCandleLighting()) {
                            if (typeof zmanimCalendar.getCandleLighting === 'function') {
                                zmanim[zman.id] = zmanimCalendar.getCandleLighting();
                                registeredMethods.push('getCandleLighting');
                            }
                        }
                        // Always skip further processing for candleLighting
                        continue;
                    }
                    // Check if it's a direct method on the zmanimCalendar
                    if (typeof zmanimCalendar[zman.method] === 'function') {
                        // Call the method directly
                        zmanim[zman.id] = zmanimCalendar[zman.method]();
                        registeredMethods.push(zman.method);
                    }
                    // Handle parameterized methods - methods defined like "getMethod(param)"
                    else if (zman.method.includes('(') && zman.method.includes(')')) {
                        const methodMatch = zman.method.match(/(\w+)\s*\(\s*([\d.-]+)\s*\)/);
                        if (methodMatch && methodMatch.length >= 3) {
                            const methodName = methodMatch[1];
                            const param = parseFloat(methodMatch[2]);
                            if (typeof zmanimCalendar[methodName] === 'function') {
                                zmanim[zman.id] = zmanimCalendar[methodName](param);
                                registeredMethods.push(`${methodName}(${param})`);
                            }
                        }
                    }
                    // Try to find a similar method by removing prefixes (get, calculate, etc.)
                    else {
                        const methodNameNormalized = zman.method.replace(/^(get|calculate)/i, '');
                        // Loop through all methods on the zmanimCalendar
                        for (const key in zmanimCalendar) {
                            if (typeof zmanimCalendar[key] === 'function' && 
                                key.toLowerCase().replace(/^(get|calculate)/i, '').includes(methodNameNormalized.toLowerCase())) {
                                zmanim[zman.id] = zmanimCalendar[key]();
                                registeredMethods.push(key);
                                break;
                            }
                        }
                    }
                } catch (error) {
                    console.error(`Error calculating zman ${zman.id} (${zman.method}):`, error);
                }
            }
            
            console.log('Registered zmanim methods:', registeredMethods);
        }
        
        console.log('Zmanim calculated:', zmanim);
        return zmanim;
    }

    /**
     * Convert UTC time to specific timezone
     */
    convertToTimezone(utcDate, timezone) {
        try {
            // Use Intl.DateTimeFormat to convert to target timezone
            const options = {
                timeZone: timezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            };
            
            const formatter = new Intl.DateTimeFormat('en-CA', options);
            const parts = formatter.formatToParts(utcDate);
            
            const year = parseInt(parts.find(p => p.type === 'year').value);
            const month = parseInt(parts.find(p => p.type === 'month').value) - 1;
            const day = parseInt(parts.find(p => p.type === 'day').value);
            const hour = parseInt(parts.find(p => p.type === 'hour').value);
            const minute = parseInt(parts.find(p => p.type === 'minute').value);
            const second = parseInt(parts.find(p => p.type === 'second').value);
            
            return new Date(year, month, day, hour, minute, second);
        } catch (error) {
            console.error('Error converting timezone:', error);
            // Fallback to simple offset calculation
            return this.convertToTimezoneSimple(utcDate, timezone);
        }
    }

    /**
     * Simple timezone conversion fallback
     */
    convertToTimezoneSimple(utcDate, timezone) {
        // Simple offset mapping for common timezones
        const timezoneOffsets = {
            'America/New_York': -5,    // EST (winter), -4 for EDT (summer)
            'America/Chicago': -6,     // CST (winter), -5 for CDT (summer)
            'America/Denver': -7,      // MST (winter), -6 for MDT (summer)
            'America/Los_Angeles': -8, // PST (winter), -7 for PDT (summer)
            'America/Anchorage': -9,   // AKST (winter), -8 for AKDT (summer)
            'Pacific/Honolulu': -10,   // HST (no DST)
            'Asia/Jerusalem': 2,       // IST (winter), 3 for IDT (summer)
            'Europe/London': 0,        // GMT (winter), 1 for BST (summer)
            'Europe/Paris': 1,         // CET (winter), 2 for CEST (summer)
            'Australia/Sydney': 10     // AEST (winter), 11 for AEDT (summer)
        };
        
        const offset = timezoneOffsets[timezone] || 0;
        
        // Note: This is a simplified approach that doesn't handle DST properly
        // For production, use a proper timezone library or the Intl API above
        const localTime = new Date(utcDate.getTime() + (offset * 60 * 60 * 1000));
        
        return localTime;
    }

    /**
     * Get Hebrew date
     */
    getHebrewDate(date = new Date()) {
        try {
            if (!window.KosherZmanim) {
                throw new Error('kosher-zmanim library not loaded');
            }
            const JewishCalendar = window.KosherZmanim.JewishCalendar;
            const HebrewDateFormatter = window.KosherZmanim.HebrewDateFormatter;
            const jewishCal = new JewishCalendar(date);
            const formatter = new HebrewDateFormatter();
            formatter.setHebrewFormat(true); // Output in Hebrew
            // Only return the formatted Hebrew date (no day name)
            return {
                formatted: formatter.format(jewishCal)
            };
        } catch (error) {
            console.error('Error getting Hebrew date:', error);
            return { formatted: '' };
        }
    }

    /**
     * Convert number to Hebrew numerals
     * Simplified implementation
     */
    numberToHebrew(num) {
        if (num < 1 || num > 9999) return num.toString();
        
        const ones = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
        const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
        const hundreds = ['', 'ק', 'ר', 'ש', 'ת', 'תק', 'תר', 'תש', 'תת', 'תתק'];
        const thousands = ['', 'א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ז׳', 'ח׳', 'ט׳'];
        
        let result = '';
        let remaining = num;
        
        if (remaining >= 1000) {
            result += thousands[Math.floor(remaining / 1000)];
            remaining %= 1000;
        }
        
        if (remaining >= 100) {
            result += hundreds[Math.floor(remaining / 100)];
            remaining %= 100;
        }
        
        if (remaining >= 10) {
            result += tens[Math.floor(remaining / 10)];
            remaining %= 10;
        }
        
        if (remaining > 0) {
            result += ones[remaining];
        }
        
        return result || num.toString();
    }

    /**
     * Format time for display
     */
    formatTime(date, format = '12h', showSeconds = true) {
        // Handle Luxon DateTime
        if (date && typeof date === 'object' && typeof date.toJSDate === 'function') {
            date = date.toJSDate();
        }
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
            return '--:--';
        }

        try {
            // Convert UTC time to local timezone for display
            const timezone = this.location?.timezone || 'America/New_York';
            const secondOption = showSeconds ? { second: '2-digit' } : {};
            if (timezone && timezone !== 'auto') {
                // Use the specified timezone for formatting
                const options = {
                    timeZone: timezone,
                    hour: format === '12h' ? 'numeric' : '2-digit',
                    minute: '2-digit',
                    hour12: format === '12h',
                    ...secondOption
                };
                return date.toLocaleTimeString('en-US', options);
            } else {
                // Use local timezone
                if (format === '12h') {
                    return date.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        second: showSeconds ? '2-digit' : undefined,
                        hour12: true
                    });
                } else {
                    return date.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: showSeconds ? '2-digit' : undefined,
                        hour12: false
                    });
                }
            }
        } catch (error) {
            console.error('Error formatting time:', error);
            return '--:--';
        }
    }

    /**
     * Check if zmanim are available
     */
    isAvailable() {
        return this.initialized && this.location !== null;
    }

    /**
     * Get current status
     */
    getStatus() {
        return {
            initialized: this.initialized,
            hasLocation: this.location !== null,
            location: this.location
        };
    }

    /**
     * List all available zmanim methods in the KosherZmanim library
     * Useful for discovering available methods to add to ZMANIM_LIST
     */
    async listAvailableZmanimMethods() {
        await this.ready();
        if (!window.KosherZmanim) {
            throw new Error('kosher-zmanim library not loaded');
        }
        
        const ComplexZmanimCalendar = window.KosherZmanim.ComplexZmanimCalendar;
        const zmanimCalendar = new ComplexZmanimCalendar();
        
        // Get all methods that might be zmanim calculations
        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(zmanimCalendar))
            .filter(name => {
                // Filter to likely zmanim methods (get* methods that return Date objects)
                return typeof zmanimCalendar[name] === 'function' && 
                       (name.startsWith('get') || name.startsWith('calculate'));
            });
            
        return methods;
    }

    /**
     * Add a new zman to the ZMANIM_LIST
     * @param {string} id - The unique ID for the zman
     * @param {string} label - The display label (English/Hebrew)
     * @param {string} method - The method name in KosherZmanim
     * @returns {boolean} - Whether the addition was successful
     */
    addZman(id, label, method) {
        if (!window.ZMANIM_LIST) {
            console.error('ZMANIM_LIST not found');
            return false;
        }
        
        // Check if the ID already exists
        if (window.ZMANIM_LIST.some(z => z.id === id)) {
            console.error(`Zman with ID "${id}" already exists`);
            return false;
        }
        
        // Add to the list
        window.ZMANIM_LIST.push({ id, label, method });
        
        // Refresh if we've already calculated zmanim
        if (this.lastCalculatedZmanim) {
            console.log(`Added new zman: ${id}`);
            return true;
        }
        
        return true;
    }

    /**
     * Get Hebrew day name for a given date
     */
    getHebrewDayName(date = new Date()) {
        // 0 = Sunday, 6 = Shabbat
        const hebrewDays = [
            'ראשון', // Sunday
            'שני',   // Monday
            'שלישי', // Tuesday
            'רביעי', // Wednesday
            'חמישי', // Thursday
            'שישי',  // Friday
            'שבת'    // Shabbat
        ];
        // JS: 0=Sunday, 6=Saturday
        const day = date.getDay();
        return hebrewDays[day];
    }
}

// Create global instance
window.kosherJava = new KosherJavaWrapper();


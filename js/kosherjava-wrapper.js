/**
 * KosherJava Wrapper for Luach Board App
 * This module provides JavaScript interface to zmanim calculations
 * Note: This is a simplified implementation. For production use, you would
 * need to integrate with the actual KosherJava library or API
 */

class KosherJavaWrapper {
    constructor() {
        this.defaultElevation = 0; // Sea level
        this.zmanimCalculator = null;
        this.jewishCalendar = null;
        this.hebrewDateFormatter = null;
        this.initialized = false;
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
        // Use ComplexZmanimCalendar for advanced zmanim calculations
        const GeoLocation = window.KosherZmanim.GeoLocation;
        const ComplexZmanimCalendar = window.KosherZmanim.ComplexZmanimCalendar;
        const geoLocation = new GeoLocation('Location', latitude, longitude, elevation || 0, timezone);
        const zmanimCalendar = new ComplexZmanimCalendar(geoLocation);
        zmanimCalendar.setDate(date);
        // Return all available zmanim
        const zmanim = {
            alos: zmanimCalendar.getAlosHashachar(),
            misheyakir: zmanimCalendar.getMisheyakir10Point2Degrees(),
            sunrise: zmanimCalendar.getSunrise(),
            sofZmanShma: zmanimCalendar.getSofZmanShmaMGA(),
            sofZmanTfila: zmanimCalendar.getSofZmanTfilaMGA(),
            chatzos: zmanimCalendar.getChatzos(),
            minchaGedola: zmanimCalendar.getMinchaGedola(),
            minchaKetana: zmanimCalendar.getMinchaKetana(),
            plagHamincha: zmanimCalendar.getPlagHamincha(),
            sunset: zmanimCalendar.getSunset(),
            tzeitHakochavim: zmanimCalendar.getTzais(),
            tzeit72: zmanimCalendar.getTzais72(),
            beinHashmashos: (typeof zmanimCalendar.getBainHasmashos === 'function') ? zmanimCalendar.getBainHasmashos() : undefined
        };
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
            // Get Hebrew day of week
            const hebrewDays = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'יום שבת'];
            const dayOfWeek = hebrewDays[jewishCal.getDayOfWeek() - 1];
            return {
                formatted: `${dayOfWeek}, ${formatter.format(jewishCal)}`
            };
        } catch (error) {
            console.error('Error getting Hebrew date:', error);
            return null;
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
}

// Create global instance
window.kosherJava = new KosherJavaWrapper();


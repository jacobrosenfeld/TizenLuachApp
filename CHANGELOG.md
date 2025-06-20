# Luach Board - Changelog

## Version 1.1.0 - Feature Expansion & Stability (June 20, 2025)

### 🚀 **Active Features**
- Full zmanim calculation using kosher-zmanim.js (with fallback to local copy if CDN fails)
- Candle lighting time (if applicable)
- Multiple tzeis options, including Tzeis Baal HaTanya
- Date picker and arrows for zmanim lookup on any date
- Auto-refresh with configurable interval (1–1440 minutes)
- Show/hide seconds toggle for zmanim display
- Allow/disallow zmanim lookups for arbitrary dates (for performance/privacy)
- Location via US zip code (multi-API fallback), manual coordinates, or GPS (with reverse geocoding)
- Timezone auto-detection and manual override (with global support)
- Custom location title
- Hebrew and English date display, with “Shabbos” for Saturday
- Persistent settings (location, preferences, etc.) in LocalStorage
- Responsive, modern UI for Tizen (with glassmorphism, color-coded categories)
- Debug mode via localStorage
- Error and success feedback for all user actions
- Last updated timestamp
- Settings and main page navigation
- Input validation for all location methods

### 🧪 **Testing Status**
- ✅ All features above tested and working on Tizen device and emulator
- ✅ Location, timezone, and zmanim calculations verified for US, Israel, and global cities
- ✅ UI/UX tested for Hebrew/English, RTL/LTR, and various screen sizes

### 🎯 **Next Steps**
- Holiday detection and display
- Havdala times (Saturday evenings)
- Nightfall date transitions (לילי שישי)
- Further UI polish and performance optimizations
- Full KosherJava integration (WASM/Java bridge/API)

---

## Version 1.0.2 - Current Status Update (June 20, 2025)

### 📦 **Project Status**
- The app is stable and fully functional as a Tizen web app demo.
- Timezone handling, location detection (zip code, GPS, manual), and zmanim calculations are working as intended.
- UI is responsive and supports both Hebrew and English.
- LocalStorage is used for persistent settings.
- **Note:** Zmanim calculations use simplified astronomical logic; full KosherJava integration is planned for production.

### 🆕 **Recent Improvements**
- Improved timezone and DST handling for global locations.
- Enhanced geocoding and timezone auto-detection.
- UI/UX refinements for Tizen devices.
- Debug mode for troubleshooting (enable via localStorage).

### 🚧 **Planned Features**
- Full KosherJava library integration (via WASM or API).
- Holiday and candle lighting time display.
- Nightfall date transitions and additional zmanim (e.g., Baal HaTanya, GRA/MA).
- Offline location lookup and international zip code support.
- Further UI polish and performance optimizations.

---

## Version 1.0.1 - Timezone Fix (June 19, 2025)

### ✅ **RESOLVED: Timezone Issue**
- **Problem**: Zmanim times were displaying 4 hours off from correct local time
- **Root Cause**: Incorrect handling of UTC vs local time conversion in zmanim calculations
- **Solution**: Enhanced timezone handling in `kosherjava-wrapper.js`

### 🔧 **Changes Made**

#### `js/kosherjava-wrapper.js`
- **Fixed `calculateSunriseSunset()`**: Now properly creates UTC dates for solar calculations
- **Enhanced `formatTime()`**: Added proper timezone conversion using `Intl.DateTimeFormat`
- **Improved timezone handling**: Uses specified timezone for accurate time display
- **UTC calculations**: Solar calculations now done in UTC, then converted to target timezone

#### `index.html`
- **Expanded timezone options**: Added comprehensive timezone support including:
  - US & Canada (Eastern, Central, Mountain, Pacific, Alaska, Hawaii)
  - Israel & Middle East (Jerusalem, Tel Aviv)
  - Europe (London, Paris, Berlin, Zurich, Amsterdam, Brussels)
  - Australia (Sydney, Melbourne, Perth)
  - South America (Buenos Aires, São Paulo)
  - South Africa (Johannesburg)

#### `js/location-service.js`
- **Enhanced `detectTimezone()`**: Improved geographical timezone detection
- **Special cases**: Added specific handling for Israel, Canada, Europe, etc.
- **Better accuracy**: More precise timezone assignment based on coordinates

### 🧪 **Testing Status**
- ✅ **Timezone calculations**: Times now display correctly in specified timezone
- ✅ **Location services**: Zip code geocoding working properly
- ✅ **GPS functionality**: Device location detection functional
- ✅ **UI navigation**: Settings and main page transitions working
- ✅ **Hebrew text**: RTL text rendering correctly
- ✅ **Zmanim display**: All major zmanim calculating and displaying properly

### 🌍 **Timezone Support Verified**
- **Eastern Time (New York)**: Working correctly
- **Multiple timezones**: Dropdown now includes global options
- **Auto-detection**: Improved coordinate-based timezone detection
- **DST handling**: Uses system timezone libraries for daylight saving time

### 🎯 **Next Steps** 
Ready for implementing the following enhancements:
1. Add "יום" before Hebrew day of week
2. Implement nightfall date transitions (לילי שישי)
3. Add holiday detection and display
4. Include candle lighting times (Fridays)
5. Add Havdala times (Saturday evenings)
6. Add additional zmanim (Tzeis Baal HaTanya, GRA/MA times)
7. Implement automatic daily refresh

---

## Version 1.0.0 - Initial Release (June 19, 2025)

### 🚀 **Initial Features**
- Complete Tizen app structure with responsive UI
- Basic zmanim calculations and display
- Location configuration (zip code, GPS, manual coordinates)
- Hebrew calendar integration with simplified calculations
- Modern glassmorphism UI design
- Local storage for settings persistence


# Luach Board - Changelog

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
6. Add additional zmanim (Tzeit Baal HaTanya, GRA/MA times)
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


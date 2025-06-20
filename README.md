# Luach Board - Tizen App

A comprehensive Jewish calendar and zmanim display board built for Tizen devices, featuring location-based calculations using KosherJava libraries (planned for production; current version uses kosher-zmanim.js with full feature set).

---

## 🚦 Project Status (June 2025)

- **Stable demo release:** All core features (zmanim display, location detection, timezone support, Hebrew calendar, responsive UI) are implemented and working.
- **Zmanim calculations:** Uses kosher-zmanim.js for full-featured zmanim, including candle lighting, multiple tzeis, Baal HaTanya, and more.
- **Location services:** US zip code lookup (multi-API fallback), manual coordinates, and GPS (with reverse geocoding) are fully supported.
- **Date picker:** Lookup zmanim for any date with arrows and calendar input.
- **Auto-refresh:** Configurable interval (1–1440 minutes); can be disabled.
- **Show/hide seconds:** Toggle for zmanim display.
- **Allow/disallow lookups:** Option to restrict zmanim to today only for privacy/performance.
- **Timezone support:** Auto-detect and manual override for global timezones.
- **Custom location title:** Set a custom name for your location.
- **Persistent settings:** All preferences and location info saved in LocalStorage.
- **Error/success feedback:** User-friendly messages for all actions.
- **Debug mode:** Enable with `localStorage.setItem('luach-debug', 'true')`.
- **Production readiness:** See notes below for planned enhancements and integration steps.

---

## Features

### 🕰️ Zmanim Display
- **Full Zmanim Suite:**
  - Sunrise, Sunset
  - Alos Hashachar, Misheyakir
  - Sof Zman Shma (MGA/GRA), Sof Zman Tfila (MGA/GRA)
  - Chatzos, Mincha Gedola, Mincha Ketana, Plag Hamincha
  - Bein Hashmashos, Tzeis Hakochavim, Tzeis 72, Tzeis Baal HaTanya
  - Candle lighting (Fridays, if applicable)
- **Date Picker:** Lookup zmanim for any date (arrows and calendar input)
- **Show/Hide Seconds:** Toggle seconds in zmanim display
- **Auto-Refresh:** Configurable interval (1–1440 minutes)
- **Allow/Disallow Lookups:** Option to restrict to today only
- **Last Updated:** Timestamp for last zmanim refresh

### 📍 Flexible Location Settings
- **Zip Code Lookup:** US zip code with multi-API fallback (Nominatim, ZipAPI, GeoNames)
- **Manual Coordinates:** Direct latitude/longitude input
- **GPS Location:** Device geolocation with reverse geocoding
- **Timezone Support:** Auto-detect from coordinates or manual selection (global)
- **Custom Location Title:** Set a custom name for your location
- **Persistent Storage:** All settings saved in LocalStorage

### 🗓️ Hebrew Calendar
- Hebrew date display with proper formatting
- Hebrew numerals for dates and years
- Day of week in Hebrew (with “יום” prefix)
- “Shabbos” replaces “Saturday” in English display

### 📱 User Interface
- Clean, modern design optimized for Tizen
- Responsive layout for different screen sizes
- Hebrew and English text support
- Color-coded zmanim categories
- Glassmorphism and modern UI effects
- Auto-refresh and manual refresh
- Error and success feedback for all actions

### 🛠️ Technical Details
- **Zmanim Engine:** kosher-zmanim.js (full feature set, fallback to local copy if CDN fails)
- **Location:** Multi-API geocoding, GPS, manual
- **Timezone:** Auto/manual, DST support
- **Persistence:** LocalStorage for all settings
- **Debug Mode:** Enable with `localStorage.setItem('luach-debug', 'true')`
- **Input Validation:** All user inputs validated
- **Error Handling:** User-friendly error and success messages

---

## Installation

### Prerequisites
- Tizen Studio or compatible development environment
- Tizen device or emulator (version 6.5+)

### Setup Steps

1. **Clone or Download** this project to your development machine

2. **Open in Tizen Studio**
   ```bash
   # Navigate to the project directory
   cd TizenLuachApp
   
   # Open with Tizen Studio
   tizen-studio TizenLuachApp
   ```

3. **Install Dependencies**
   - The app includes simplified zmanim calculations
   - For production use, integrate with actual KosherJava library

4. **Configure Location Services**
   - The app uses free geocoding services (OpenStreetMap Nominatim)
   - For production, consider adding API keys for more reliable services

5. **Build and Deploy**
   ```bash
   # Build the project
   tizen build-web
   
   # Deploy to device/emulator
   tizen install -n TizenLuachApp.wgt -t [DEVICE_ID]
   ```

## Usage

### Setting Up Location

1. **Launch the App** - Open Luach Board from your Tizen device
2. **Access Settings** - Tap the settings icon or location pin
3. **Choose Location Method**:
   - **Zip Code**: Enter US zip code and tap "Lookup"
   - **Coordinates**: Enter latitude and longitude manually
   - **GPS**: Use "Get Current Location" for device GPS

4. **Select Timezone** - Choose appropriate timezone or use auto-detect
5. **Save Location** - Tap "Save Location" to apply settings

### Viewing Zmanim

- **Main Display** shows all current zmanim
- **Color Coding**:
  - 🟡 Orange: Sunrise/Sunset
  - 🔵 Blue: Shacharit times
  - 🔴 Red: Afternoon times
  - 🟣 Purple: Evening times

- **Refresh** - Tap the refresh button or wait for auto-refresh (hourly)

## Technical Details

### Architecture

```
TizenLuachApp/
├── index.html              # Main UI structure
├── config.xml              # Tizen app configuration
├── css/
│   └── style.css           # Styling and responsive design
├── js/
│   ├── location-service.js # Location management and geocoding
│   ├── kosherjava-wrapper.js # Zmanim calculations interface
│   └── luach-board.js      # Main application logic
└── lib/                    # Tizen UI framework (TAU)
```

### Location Services

- **Geocoding**: Uses OpenStreetMap Nominatim API (free)
- **GPS**: Native HTML5 Geolocation API
- **Storage**: LocalStorage for persistent settings
- **Validation**: Input validation for coordinates and zip codes

### Zmanim Calculations

**Current Implementation:** Simplified astronomical calculations for demonstration. **Not for halachic use.**

**Planned Production Integration:** Replace with actual KosherJava library (via WASM, Java bridge, or API service).

```javascript
// Example integration with real KosherJava
import { GeoLocation, ZmanimCalendar } from 'kosherjava';

const geoLocation = new GeoLocation(locationName, latitude, longitude, elevation, timezone);
const zmanimCalendar = new ZmanimCalendar(geoLocation);
const sunrise = zmanimCalendar.getSunrise();
```

### Data Persistence

- Location settings saved to LocalStorage
- Settings persist across app restarts
- No external data transmission (privacy-focused)

## Customization

### Adding New Zmanim

1. **Update KosherJava Wrapper**:
   ```javascript
   // In kosherjava-wrapper.js
   calculateZmanimSimulated(date) {
       // Add new zman calculation
       const newZman = new Date(/* calculation */);
       
       return {
           // existing zmanim...
           newZman
       };
   }
   ```

2. **Update UI**:
   ```html
   <!-- In index.html -->
   <div class="time-item">
       <span class="time" id="new-zman">--:--</span>
       <span class="label">זמן חדש</span>
       <span class="label-en">New Zman</span>
   </div>
   ```

3. **Update Display Logic**:
   ```javascript
   // In luach-board.js
   updateZmanimDisplay(zmanim) {
       const timeElements = {
           // existing elements...
           'new-zman': zmanim.newZman
       };
   }
   ```

### Styling Customization

- **Colors**: Modify CSS variables in `style.css`
- **Fonts**: Update font families for Hebrew/English text
- **Layout**: Adjust grid layouts for different screen sizes

### Location Services

- **Additional APIs**: Add new geocoding services in `location-service.js`
- **International**: Extend zip code validation for other countries
- **Offline**: Implement offline location lookup for remote areas

## Production Considerations

### KosherJava Integration

- **Current:** kosher-zmanim.js (full feature set)
- **Planned:** Integrate KosherJava for even more accurate zmanim (via WASM, Java bridge, or API service)

### API Keys

Set up API keys for reliable geocoding:
- Google Geocoding API
- MapBox Geocoding API
- Here Geocoding API

### Performance

- **Caching**: Cache zmanim calculations for multiple days
- **Background**: Calculate next day's zmanim in background
- **Optimization**: Minimize DOM updates and API calls

### Security

- **HTTPS Only**: Ensure all external API calls use HTTPS
- **Input Validation**: Sanitize all user inputs
- **CSP**: Configure Content Security Policy appropriately

## Troubleshooting

### Common Issues

1. **Location Not Found**
   - Check internet connection
   - Verify zip code format (US only: 12345 or 12345-6789)
   - Try manual coordinates as backup

2. **GPS Not Working**
   - Ensure location permissions granted
   - Check if device supports GPS
   - Try in outdoor location for better signal

3. **Zmanim Not Updating**
   - Verify location is set correctly
   - Check if date/time is correct
   - Manually refresh using refresh button

4. **Hebrew Text Issues**
   - Ensure device supports Hebrew fonts
   - Check if RTL text direction is working
   - Verify Hebrew calendar calculations

### Debug Mode

Enable debug logging:
```javascript
// In browser console
localStorage.setItem('luach-debug', 'true');
// Reload app to see debug messages
```

## License

This project is a demonstration. For production, ensure compliance with:
- KosherJava library license (if/when integrated)
- Geocoding service terms of use
- Tizen development guidelines

## Contributing

To contribute to this project:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on Tizen device/emulator
5. Submit a pull request

## Support

For issues and questions:
- Check the troubleshooting section above
- Review Tizen development documentation
- Consult KosherJava library documentation
- File issues in the project repository


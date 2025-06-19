# Luach Board - Tizen App

A comprehensive Jewish calendar and zmanim display board built for Tizen devices, featuring location-based calculations using KosherJava libraries.

## Features

### 🕰️ Zmanim Display
- **Sunrise & Sunset** - Basic solar times
- **Shacharit Times** - Alos Hashachar, Misheyakir, Sof Zman Shma, Sof Zman Tfila
- **Midday & Afternoon** - Chatzos, Mincha Gedola, Mincha Ketana, Plag Hamincha
- **Evening Times** - Bein Hashmashos, Tzeit Hakochavim, Tzeit 72 minutes

### 📍 Flexible Location Settings
- **Zip Code Lookup** - Automatic geocoding from US zip codes
- **Manual Coordinates** - Direct latitude/longitude input
- **GPS Location** - Current device location detection
- **Timezone Support** - Automatic and manual timezone selection

### 🗓️ Hebrew Calendar
- Hebrew date display with proper formatting
- Hebrew numerals for dates and years
- Day of week in Hebrew

### 📱 User Interface
- Clean, modern design optimized for Tizen
- Responsive layout for different screen sizes
- Hebrew and English text support
- Color-coded zmanim categories
- Auto-refresh functionality

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

**Current Implementation**: Simplified astronomical calculations for demonstration

**Production Integration**: Replace with actual KosherJava library:
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

For production use, integrate with the actual KosherJava library:

1. **Java Integration**: Use Tizen's Java-JavaScript bridge
2. **WebAssembly**: Compile KosherJava to WASM
3. **API Service**: Host KosherJava calculations on a server

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

This project is provided as a demonstration. For production use, ensure compliance with:
- KosherJava library license
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


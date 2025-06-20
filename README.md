# Luach Board – Tizen App

A comprehensive Jewish calendar and zmanim display board for Tizen devices, featuring dynamic, location-based calculations using the KosherJava zmanim engine (via kosher-zmanim.js). The app is designed for flexibility, modern UI, and easy customization.

---

## 🚦 Project Status (June 2025)
- **Stable demo release:** All core features implemented and working.
- **Dynamic zmanim:** Zmanim are now loaded dynamically based on the `method` field in `js/zmanim-list.js`—no more hardcoded zmanim list.
- **Time-sorted list:** Zmanim are displayed in order from earliest to latest.
- **Location services:** US zip code lookup, manual coordinates, and GPS (with reverse geocoding).
- **Date picker:** Lookup zmanim for any date.
- **Auto-refresh:** Configurable interval; can be disabled.
- **Persistent settings:** All preferences and location info saved in LocalStorage.
- **Debug mode:** Enable with `localStorage.setItem('luach-debug', 'true')`.

---

## Features

### 🕰️ Zmanim Display
- **Dynamic Zmanim Suite:**
  - Zmanim are defined in `js/zmanim-list.js` with `{ id, label, method }`.
  - The app calls the specified `method` on the kosher-zmanim engine for each zman.
  - Supports all kosher-zmanim methods, including custom ones.
  - Add/remove zmanim by editing `js/zmanim-list.js`—no code changes needed.
- **Time-Sorted List:**
  - Zmanim are automatically sorted by their calculated time (earliest to latest).
- **Customizable Display:**
  - English/Hebrew labels, show/hide seconds, color coding, and more.
- **Date Picker:** Lookup zmanim for any date.
- **Auto-Refresh:** Configurable interval (1–1440 minutes).

### 📍 Flexible Settings
- **Zip Code Lookup:** US zip code with multi-API fallback.
- **Manual Coordinates:** Direct latitude/longitude input.
- **GPS Location:** Device geolocation with reverse geocoding.
- **Timezone Support:** Auto-detect or manual selection.
- **Custom Location Title:** Set a custom name for your location.
- **Persistent Storage:** All settings saved in LocalStorage.

### 🗓️ Hebrew Calendar
- Hebrew date display with proper formatting and numerals.
- Day of week in Hebrew (with “יום” prefix).
- “Shabbos” replaces “Saturday” in English display.

### 📱 User Interface
- Modern, responsive design for Tizen.
- Hebrew and English text support.
- Color-coded zmanim categories.
- Glassmorphism and modern UI effects.
- Error and success feedback for all actions.

### 🛠️ Technical Details
- **Zmanim Engine:** kosher-zmanim.js (full feature set, fallback to local copy if CDN fails).
- **Location:** Multi-API geocoding, GPS, manual.
- **Timezone:** Auto/manual, DST support.
- **Persistence:** LocalStorage for all settings.
- **Debug Mode:** Enable with `localStorage.setItem('luach-debug', 'true')`.
- **Input Validation:** All user inputs validated.
- **Error Handling:** User-friendly error and success messages.

---

## Installation

### Prerequisites
- Tizen Studio or compatible development environment
- Tizen device or emulator (version 6.5+)

### Setup Steps
1. **Clone or Download** this project to your development machine
2. **Open in Tizen Studio**
   ```bash
   cd TizenLuachApp
   tizen-studio TizenLuachApp
   ```
3. **Install Dependencies**
   - All dependencies are included; kosher-zmanim.js is bundled.
4. **Configure Location Services**
   - The app uses free geocoding services (OpenStreetMap Nominatim, etc.).
5. **Build and Deploy**
   ```bash
   tizen build-web
   tizen install -n TizenLuachApp.wgt -t [DEVICE_ID]
   ```

## Usage

### Setting Up Location
1. **Launch the App**
2. **Access Settings** (settings icon or location pin)
3. **Choose Location Method**: Zip code, manual coordinates, or GPS
4. **Select Timezone** (auto/manual)
5. **Save Location**

### Viewing Zmanim
- Main display shows all zmanim for the selected date, sorted by time.
- Color coding for different zmanim categories.
- Tap refresh or wait for auto-refresh.

---

## Project Structure

```
TizenLuachApp/
├── index.html                  # Main UI structure
├── config.xml                  # Tizen app configuration
├── package.json                # Project metadata
├── css/
│   └── style.css               # Styling and responsive design
├── js/
│   ├── kosher-zmanim-debug.js  # Debug logging for zmanim calculations
│   ├── kosher-zmanim-loader.js # Loader for zmanim calculation scripts
│   ├── kosher-zmanim.min.js    # Main zmanim calculation library
│   ├── kosherjava-wrapper.js   # Zmanim calculations interface (dynamic)
│   ├── location-service.js     # Location management and geocoding
│   ├── luach-board.js          # Main application logic and UI handlers
│   ├── zmanim-list.js          # List of zmanim to display (edit this to add/remove)
│   ├── zipcodes.js             # US zip code data and lookup
│   ├── zipcodes-sample.js      # Sample zip code data (for testing)
├── lib/
│   └── tau/
│       └── wearable/
│           ├── js/
│           │   └── tau.min.js  # Tizen Advanced UI (TAU) JavaScript
│           └── theme/
│               └── default/
│                   └── tau.min.css # TAU default theme
├── resources/
│   └── US.txt                  # US zip code data file
├── tools/
│   ├── convert-zipcodes.js     # Tool for processing zip code data (JS)
│   └── convert_zipcodes.py     # Tool for processing zip code data (Python)
├── test.html                   # Test/demo page
├── CHANGELOG.md                # Project changelog
└── README.md                   # Project documentation
```

---

## Customization

### Adding or Editing Zmanim

1. **Edit `js/zmanim-list.js`:**
   - Each zman is an object: `{ id, label, method }`
   - `id`: Unique string for the zman (used as HTML id and key)
   - `label`: Display label (English / Hebrew, separated by `/`)
   - `method`: Name of the kosher-zmanim method to call (e.g., `getSunrise`, `getTzais72`)
   - Example:
     ```js
     window.ZMANIM_LIST = [
       { id: 'sunrise', label: 'Sunrise / נץ החמה', method: 'getSunrise' },
       { id: 'sof-zman-shma-mga', label: 'Sof Zman Shma (MGA) / סוף זמן שמע (מג"א)', method: 'getSofZmanShmaMGA' },
       // Add more zmanim here
     ];
     ```
2. **No code changes needed!**
   - The app will automatically call the specified method for each zman and display it in the sorted list.
   - If you add a zman with a method that exists in kosher-zmanim, it will be calculated and shown.

### Styling
- Edit `css/style.css` for colors, fonts, and layout.
- Responsive design for different screen sizes.

### Location Services
- Add new geocoding APIs in `js/location-service.js` if needed.
- Extend zip code support or add internationalization as desired.

---

## Production Considerations
- For halachic use, integrate with the official KosherJava library (WASM, Java bridge, or API service).
- Set up API keys for geocoding if needed.
- Ensure all external API calls use HTTPS.
- Sanitize all user inputs.
- Configure Content Security Policy (CSP) for security.

---

## Troubleshooting

- **Location Not Found:** Check internet, zip code format, or use manual coordinates.
- **GPS Not Working:** Ensure permissions, try outdoors, or use manual entry.
- **Zmanim Not Updating:** Check location, date/time, or refresh manually.
- **Hebrew Text Issues:** Ensure device supports Hebrew fonts and RTL text.
- **Debug Mode:**
  ```js
  localStorage.setItem('luach-debug', 'true');
  // Reload app to see debug messages
  ```

---

## License & Contributing

- Demo project. For production, ensure compliance with KosherJava license, geocoding service terms, and Tizen guidelines.
- To contribute: fork, branch, make changes, test, and submit a pull request.

---

## Support
- See troubleshooting above, Tizen docs, KosherJava docs, or file an issue in the repo.


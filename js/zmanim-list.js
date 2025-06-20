// zmanim-list.js
//
// This file defines the list of zmanim (halachic times) to be displayed and controlled in the app.
//
// To add or remove zmanim from the app, simply edit this file. Each entry should have:
//   - id: The unique string used for the HTML element id and as the key for toggling visibility.
//   - label: The display label for the settings panel (can include English/Hebrew).
//   - method: The method name in the kosher-zmanim library to calculate this zman.
//
// Method specification options:
//   1. Direct method name:            'getSunrise'
//   2. Method with parameter:         'getSunsetOffset(18.0)'
//   3. Special cases:                 Methods like 'candleLighting' are handled specially
//
// The app will automatically try to find the best match for your method name in the KosherZmanim library.
// If you're not sure what methods are available, you can use kosherJava.listAvailableZmanimMethods() 
// in the browser console to see a list of all available methods.
//
// Examples:
//   { id: 'sunrise', label: 'Sunrise / נץ החמה', method: 'getSunrise' }
//   { id: 'shkia-18', label: 'Shkia 18° / שקיעה 18°', method: 'getSunsetOffset(18.0)' }
//   { id: 'candleLighting', label: 'Candle Lighting / הדלקת נרות', method: 'getCandleLighting' }

window.ZMANIM_LIST = [
  { id: 'sunrise', label: 'Sunrise / נץ החמה', method: 'getSunrise' },
  { id: 'sunset', label: 'Sunset / שקיעת החמה', method: 'getSunset' },
  { id: 'alos', label: 'Alos Hashachar / עלות השחר', method: 'getAlosHashachar' },
  { id: 'misheyakir', label: 'Misheyakir / משיכיר', method: 'getMisheyakir10Point2Degrees' },
  { id: 'sof-zman-shma-mga', label: 'Sof Zman Shma (MGA) / סוף זמן שמע (מג"א)', method: 'getSofZmanShmaMGA' },
  { id: 'sof-zman-shma-gra', label: 'Sof Zman Shma (GRA) / סוף זמן שמע (הגר"א)', method: 'getSofZmanShmaGRA' },
  { id: 'sof-zman-tfila-mga', label: 'Sof Zman Tfila (MGA) / סוף זמן תפילה (מג"א)', method: 'getSofZmanTfilaMGA' },
  { id: 'sof-zman-tfila-gra', label: 'Sof Zman Tfila (GRA) / סוף זמן תפילה (הגר"א)', method: 'getSofZmanTfilaGRA' },
  { id: 'chatzos', label: 'Chatzos / חצות', method: 'getChatzos' },
  { id: 'mincha-gedola', label: 'Mincha Gedola / מנחה גדולה', method: 'getMinchaGedola' },
  { id: 'mincha-ketana', label: 'Mincha Ketana / מנחה קטנה', method: 'getMinchaKetana' },
  { id: 'plag-hamincha', label: 'Plag Hamincha / פלג המנחה', method: 'getPlagHamincha' },
  { id: 'Tzeis-hakochavim', label: 'Tzeis Hakochavim / צאת הכוכבים', method: 'getTzais' },
  { id: 'Tzeis-72', label: 'Tzeis 72 / צאת 72', method: 'getTzais72' },
  { id: 'Tzeis-baal-hatanya', label: 'Tzeis Baal Hatanya / צאת בעל התניא', method: 'getTzaisBaalHatanya' },
  { id: 'candleLighting', label: 'Candle Lighting / הדלקת נרות', method: 'getCandleLighting' },
  { id: 'plag-hamincha-gra', label: 'Plag Hamincha (GRA) / פלג המנחה (הגר"א)', method: 'getPlagHaminchaGRA' }, 
  // Example of a zman with a parameter
  { id: 'alos-16-1', label: 'Alos 16.1° / עלות 16.1°', method: 'getAlos16Point1Degrees' },
];

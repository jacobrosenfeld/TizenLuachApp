// zmanim-list.js
//
// This file defines the list of zmanim (halachic times) to be displayed and controlled in the app.
//
// To add or remove zmanim from the app, simply edit this file. Each entry should have:
//   - id: The unique string used for the HTML element id and as the key for toggling visibility.
//   - label: The display label for the settings panel (can include English/Hebrew).
//   - method: (optional) The method name in the kosher-zmanim library (if different from id, for custom zmanim).
//
// If you add a zman here and it matches a method in the kosher-zmanim library, it will be calculated and displayed automatically.
//
// Example for a custom zman:
//   { id: 'customZman', label: 'Custom Zman / זמן מותאם', method: 'getCustomZman' }

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
];

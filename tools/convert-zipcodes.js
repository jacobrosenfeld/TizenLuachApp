// Node.js script to convert US.txt to zipcodes.js for offline geocoding
// Usage: node convert-zipcodes.js resources/US.txt js/zipcodes.js

const fs = require('fs');
const readline = require('readline');

if (process.argv.length < 4) {
  console.error('Usage: node convert-zipcodes.js <input US.txt> <output zipcodes.js>');
  process.exit(1);
}

const inputFile = process.argv[2];
const outputFile = process.argv[3];

const out = fs.createWriteStream(outputFile);
out.write('// This file is auto-generated from resources/US.txt for offline zip code geocoding\n');
out.write('// Format: { [zipcode]: { lat, lng, city, state } }\n');
out.write('export const US_ZIPCODES = {\n');

const rl = readline.createInterface({
  input: fs.createReadStream(inputFile),
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  if (!line.trim() || line.startsWith('US\tZIP')) return; // skip header/empty
  const parts = line.split('\t');
  if (parts.length < 12) return;
  const zip = parts[1];
  const city = parts[2].replace(/"/g, '\"');
  const state = parts[4];
  const lat = parseFloat(parts[9]);
  const lng = parseFloat(parts[10]);
  if (!zip || isNaN(lat) || isNaN(lng)) return;
  out.write(`  "${zip}": { lat: ${lat}, lng: ${lng}, city: "${city}", state: "${state}" },\n`);
});

rl.on('close', () => {
  out.write('};\n');
  out.end();
  console.log('Done!');
});

# Python script to convert US.txt to zipcodes.js for offline geocoding
# Usage: python convert_zipcodes.py resources/US.txt js/zipcodes.js
import sys

if len(sys.argv) < 3:
    print('Usage: python convert_zipcodes.py <input US.txt> <output zipcodes.js>')
    sys.exit(1)

input_file = sys.argv[1]
output_file = sys.argv[2]

with open(output_file, 'w', encoding='utf-8') as out:
    out.write('// This file is auto-generated from resources/US.txt for offline zip code geocoding\n')
    out.write('// Format: { [zipcode]: { lat, lng, city, state } }\n')
    out.write('export const US_ZIPCODES = {\n')
    with open(input_file, 'r', encoding='utf-8') as f:
        for line in f:
            if not line.strip() or line.startswith('US\tZIP'):
                continue
            parts = line.strip().split('\t')
            if len(parts) < 12:
                continue
            zipc = parts[1]
            city = parts[2].replace('"', '\"')
            state = parts[4]
            try:
                lat = float(parts[9])
                lng = float(parts[10])
            except ValueError:
                continue
            if not zipc or lat == '' or lng == '':
                continue
            out.write(f'  "{zipc}": {{ lat: {lat}, lng: {lng}, city: "{city}", state: "{state}" }},\n')
    out.write('};\n')
print('Done!')

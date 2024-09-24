import requests
import json
import os
import math
from collections import Counter
import re

osm_data_file_path = "data/osm_data.json"

if os.path.exists(osm_data_file_path):
    print("Loading OSM data from JSON file...")
    with open(osm_data_file_path, 'r', encoding='utf-8') as f:
        osm_data = json.load(f)
else:
    print("Querying Overpass API for OSM data...")
    # Define the Overpass API query
    overpass_url = "http://overpass-api.de/api/interpreter"
    overpass_query = """
    [out:json][timeout:300];
    area["ISO3166-1"="FR"][admin_level=2];
    (node["highway"="speed_camera"](area);
    way["highway"="speed_camera"](area);
    rel["highway"="speed_camera"](area);
    );
    out body;
    >;
    out skel qt;
    """

    # Send the request to the Overpass API
    response = requests.get(overpass_url, params={'data': overpass_query})
    osm_data = response.json()
    with open(osm_data_file_path, 'w', encoding='utf-8') as f:
        os.makedirs(os.path.dirname(osm_data_file_path), exist_ok=True)
        json.dump(osm_data, f, ensure_ascii=False, indent=4)


securite_routiere_file_path = "data/securite_routiere_data.json"

if os.path.exists(securite_routiere_file_path):
    print("Loading Securité Routière data from JSON file...")
    with open(securite_routiere_file_path, 'r', encoding='utf-8') as f:
        securite_routiere_data = json.load(f)
else:
    print("Querying Securité Routière API for radar data...")
    securite_routiere_url = "https://radars.securite-routiere.gouv.fr/radars/all"

    # Headers including the Accept header
    headers = {
        "Accept": "application/json",  # or "application/xml" or whatever your curl command sends
        "User-Agent": "curl/7.68.0"    # Mimic the curl User-Agent
    }

    # Send a GET request to the URL
    response = requests.get(securite_routiere_url, headers=headers)

    # Raise an exception if the request was unsuccessful
    response.raise_for_status()

    # Parse the JSON content of the response and store it in a variable
    securite_routiere_data = response.json()
    with open(securite_routiere_file_path, 'w', encoding='utf-8') as f:
        os.makedirs(os.path.dirname(securite_routiere_file_path), exist_ok=True)
        json.dump(securite_routiere_data, f, ensure_ascii=False, indent=4)

# Extract the 'type' from each item and count occurrences
type_counts = Counter(item['type'] for item in securite_routiere_data)

# Display the results
for item_type, count in type_counts.items():
    print(f"Type: {item_type}, Count: {count}")

def find_radar_in_osm_data(lat, lon, osm_data):
    for element in osm_data['elements']:
        if 'lat' in element and 'lon' in element:
            if abs(element['lat'] - lat) <= 0.01 and abs(element['lon'] - lon) <= 0.01:
                return element
    return None

def find_radars_in_osm_data(lat, lon, osm_data, radius):
    radars_within_radius = []
    for element in osm_data['elements']:
        if 'lat' in element and 'lon' in element:
            distance = compute_distance_in_km(lat, lon, element['lat'], element['lon'])
            if distance <= radius:
                radars_within_radius.append(element)
    return radars_within_radius

def compute_distance_in_km(lat1, lon1, lat2, lon2):
    # Convert latitude and longitude from degrees to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    # Compute the differences between the latitudes and longitudes
    delta_lat = lat2_rad - lat1_rad
    delta_lon = lon2_rad - lon1_rad

    # Compute the square of half the chord length using the haversine formula
    a = math.sin(delta_lat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2

    # Compute the angular distance in radians
    c = 2 * math.asin(math.sqrt(a))

    # Radius of the Earth in kilometers
    R = 6371

    # Compute the distance
    return R * c

result = []
              
for item in securite_routiere_data:
    if item['type'] == 'fixes':
        id = item['id']
        headers = {
            "Accept": "application/json",
            "User-Agent": "curl/7.68.0"
        }
        print("https://radars.securite-routiere.gouv.fr/radars/" + id)
        # Send a GET request to the URL
        response = requests.get("https://radars.securite-routiere.gouv.fr/radars/" + id, headers=headers)
        # Raise an exception if the request was unsuccessful
        response.raise_for_status()

        # Parse the JSON content of the response and store it in a variable
        securite_routiere_radar = response.json()
        rules_mesured = securite_routiere_radar['rulesmesured']
        if len(rules_mesured) != 1:
            print(f"Radar ID {id} has {len(rules_mesured)} rules measured.")
        else:
            rule = rules_mesured[0]
            macinename = rule['macinename']
            match = re.search(r'vitesse_vl_(\d+)', macinename)
            speed_limit = int(match.group(1)) if match else None
            result.append({
                'speed_limit': speed_limit,
                'latitude': item['lat'],
                'longitude': item['lng'],
                'source': "securite_routiere"
            })
    elif item['type'] == 'itineraire':
        id = item['id']
        headers = {
            "Accept": "application/json",
            "User-Agent": "curl/7.68.0"
        }
        print("https://radars.securite-routiere.gouv.fr/radars/" + id)
        # Send a GET request to the URL
        response = requests.get("https://radars.securite-routiere.gouv.fr/radars/" + id, headers=headers)
        # Raise an exception if the request was unsuccessful
        response.raise_for_status()

        # Parse the JSON content of the response and store it in a variable
        securite_routiere_radar = response.json()
        try:
            radius = float(securite_routiere_radar['radartronconkm'])
        except (ValueError, TypeError):
            radius = 30.0
        radars_within_radius = find_radars_in_osm_data(item['lat'], item['lng'], osm_data, radius)
        if len(radars_within_radius) == 0:
            print(f"No radar found within {radius} km of the coordinates {item['lat']}, {item['lng']}.")
        for closest_radar in radars_within_radius:
            print(f"Closest radar found within {radius} km of the coordinates {item['lat']}, {item['lng']}")
            if 'tags' in closest_radar and 'maxspeed' in closest_radar['tags']:
                result.append({
                'latitude': closest_radar['lat'],
                'longitude': closest_radar['lon'],
                'speed_limit': closest_radar['tags']['maxspeed'],
                'source': "osm"
                })
            else:
                print(f"No speed limit found for the closest radar.")
                result.append({
                'latitude': closest_radar['lat'],
                'longitude': closest_radar['lon'],  
                'source': "osm"
                })                    

            
            
def remove_duplicates(radars):
    unique_radars = []
    for radar in radars:
        is_duplicate = False
        for unique_radar in unique_radars:
            distance = compute_distance_in_km(radar['latitude'], radar['longitude'], unique_radar['latitude'], unique_radar['longitude'])
            if distance < 1:
                if radar['source'] == 'osm' and unique_radar['source'] == 'securite_routiere':
                    is_duplicate = True
                    break
                elif radar['source'] == 'securite_routiere' and unique_radar['source'] == 'osm':
                    print(f"Replacing OSM radar at coordinates {unique_radar['latitude']}, {unique_radar['longitude']} with Securité Routière radar.")
                    unique_radars.remove(unique_radar)
                    break
                else:
                    is_duplicate = True
                    break
        if not is_duplicate:
            unique_radars.append(radar)
        else:
            print(f"Duplicate radar found at coordinates {radar['latitude']}, {radar['longitude']}.")
    return unique_radars

result = remove_duplicates(result)

output_file_path = "data/radars.json"
with open(output_file_path, 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=4)

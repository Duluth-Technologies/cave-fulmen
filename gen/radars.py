import requests
import json
import os
import math
from collections import Counter
import re
from pathlib import Path
import argparse
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

parser = argparse.ArgumentParser(description="Download and build radar dataset.")
parser.add_argument(
    "--limit",
    type=int,
    default=None,
    help="Limit number of detail radar API lookups (for smoke tests).",
)
parser.add_argument(
    "--allow-empty-output",
    action="store_true",
    help="Allow overwriting output with an empty list when no radar data is collected.",
)
args = parser.parse_args()

session = requests.Session()
retry_policy = Retry(
    total=3,
    connect=3,
    read=3,
    backoff_factor=0.5,
    status_forcelist=[429, 500, 502, 503, 504],
    allowed_methods=["GET"],
)
adapter = HTTPAdapter(max_retries=retry_policy)
session.mount("https://", adapter)
session.mount("http://", adapter)

osm_data_file_path = DATA_DIR / "osm_data.json"

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
    response = session.get(overpass_url, params={'data': overpass_query}, timeout=120)
    response.raise_for_status()
    osm_data = response.json()
    with open(osm_data_file_path, 'w', encoding='utf-8') as f:
        json.dump(osm_data, f, ensure_ascii=False, indent=4)


securite_routiere_file_path = DATA_DIR / "securite_routiere_data.json"

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
    response = session.get(securite_routiere_url, headers=headers, timeout=120)

    # Raise an exception if the request was unsuccessful
    response.raise_for_status()

    # Parse the JSON content of the response and store it in a variable
    securite_routiere_data = response.json()
    with open(securite_routiere_file_path, 'w', encoding='utf-8') as f:
        json.dump(securite_routiere_data, f, ensure_ascii=False, indent=4)


def fetch_radar_details(radar_id):
    headers = {
        "Accept": "application/json",
        "User-Agent": "curl/7.68.0"
    }
    url = f"https://radars.securite-routiere.gouv.fr/radars/{radar_id}"
    print(url)
    try:
        response = session.get(url, headers=headers, timeout=60)
    except requests.RequestException as err:
        print(f"Skipping radar ID {radar_id}: request failed ({err}).")
        return None

    if response.status_code == 404:
        print(f"Skipping radar ID {radar_id}: not found (404).")
        return None

    try:
        response.raise_for_status()
        return response.json()
    except requests.RequestException as err:
        print(f"Skipping radar ID {radar_id}: HTTP error ({err}).")
    except ValueError as err:
        print(f"Skipping radar ID {radar_id}: invalid JSON ({err}).")
    return None

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
detail_lookups = 0
              
for item in securite_routiere_data:
    if args.limit is not None and detail_lookups >= args.limit:
        print(f"Reached --limit={args.limit}; stopping detail lookups.")
        break

    if item['type'] == 'fixes':
        detail_lookups += 1
        id = item['id']
        securite_routiere_radar = fetch_radar_details(id)
        if securite_routiere_radar is None:
            continue
        rules_mesured = securite_routiere_radar.get('rulesmesured', [])
        if len(rules_mesured) != 1:
            print(f"Radar ID {id} has {len(rules_mesured)} rules measured.")
        else:
            rule = rules_mesured[0]
            macinename = rule.get('macinename', '')
            match = re.search(r'vitesse_vl_(\d+)', macinename)
            speed_limit = int(match.group(1)) if match else None
            result.append({
                'speed_limit': speed_limit,
                'latitude': item['lat'],
                'longitude': item['lng'],
                'source': "securite_routiere"
            })
    elif item['type'] == 'itineraire':
        detail_lookups += 1
        id = item['id']
        securite_routiere_radar = fetch_radar_details(id)
        if securite_routiere_radar is None:
            continue
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
print(f"Detail lookups attempted: {detail_lookups}")
print(f"Unique radars written: {len(result)}")

output_file_path = DATA_DIR / "radars.json"
if not result and output_file_path.exists() and not args.allow_empty_output:
    print("No radars collected; preserving existing radars.json.")
    with open(output_file_path, 'r', encoding='utf-8') as f:
        existing_data = json.load(f)
    if isinstance(existing_data, list):
        result = existing_data
        print(f"Reused existing radar entries: {len(result)}")

with open(output_file_path, 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=4)

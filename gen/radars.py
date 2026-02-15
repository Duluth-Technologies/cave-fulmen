import requests
import json
import os
import math
import time
from collections import Counter
import re
from pathlib import Path
import argparse
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
ROAD_MAXSPEED_CACHE_PATH = DATA_DIR / "road_maxspeed_cache.json"
MISSING_SPEED_DEBUG_PATH = DATA_DIR / "missing_speed_debug.json"

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

def securite_get_with_retry(url, headers, timeout, request_name):
    while True:
        try:
            response = session.get(url, headers=headers, timeout=timeout)
        except requests.RequestException as err:
            err_text = str(err)
            if "RemoteDisconnected" in err_text or "Connection aborted" in err_text:
                print(
                    f"{request_name}: remote disconnected the connection. "
                    "Retrying in 30 seconds..."
                )
            else:
                print(
                    f"{request_name}: request failed ({err}). "
                    "Retrying in 30 seconds..."
                )
            time.sleep(30)
            continue

        if response.status_code in (429, 500, 502, 503, 504):
            print(
                f"{request_name}: HTTP {response.status_code}. "
                "Retrying in 30 seconds..."
            )
            time.sleep(30)
            continue

        return response


if ROAD_MAXSPEED_CACHE_PATH.exists():
    with open(ROAD_MAXSPEED_CACHE_PATH, 'r', encoding='utf-8') as f:
        road_maxspeed_cache = json.load(f)
else:
    road_maxspeed_cache = {}
road_maxspeed_cache_dirty = False


def normalize_maxspeed(raw_maxspeed):
    if raw_maxspeed is None:
        return None
    if isinstance(raw_maxspeed, list):
        for value in raw_maxspeed:
            normalized = normalize_maxspeed(value)
            if normalized is not None:
                return normalized
        return None

    text = str(raw_maxspeed).strip()
    if not text:
        return None

    match = re.search(r'\d+', text)
    if match:
        return match.group(0)
    return None


def extract_way_maxspeed(tags, element_id=None):
    # For directional limits, keep the stricter value so we do not overestimate.
    direct_maxspeed = normalize_maxspeed(tags.get('maxspeed'))
    if direct_maxspeed is not None:
        return direct_maxspeed

    forward_maxspeed = normalize_maxspeed(tags.get('maxspeed:forward'))
    backward_maxspeed = normalize_maxspeed(tags.get('maxspeed:backward'))

    candidates = []
    if forward_maxspeed is not None:
        candidates.append(int(forward_maxspeed))
    if backward_maxspeed is not None:
        candidates.append(int(backward_maxspeed))

    if not candidates:
        return None

    selected = str(min(candidates))
    print(
        f"[ROAD MAXSPEED] way_id={element_id}: no maxspeed tag; "
        f"using min(maxspeed:forward={forward_maxspeed!r}, "
        f"maxspeed:backward={backward_maxspeed!r}) -> {selected}."
    )
    return selected


def latlon_to_local_xy_m(lat, lon, ref_lat, ref_lon):
    lat_scale = 111320.0
    lon_scale = 111320.0 * math.cos(math.radians(ref_lat))
    x = (lon - ref_lon) * lon_scale
    y = (lat - ref_lat) * lat_scale
    return x, y


def point_to_segment_distance_m(px, py, ax, ay, bx, by):
    abx = bx - ax
    aby = by - ay
    apx = px - ax
    apy = py - ay
    ab_len_sq = abx * abx + aby * aby
    if ab_len_sq == 0:
        return math.hypot(apx, apy)

    t = (apx * abx + apy * aby) / ab_len_sq
    if t < 0:
        t = 0
    elif t > 1:
        t = 1

    closest_x = ax + t * abx
    closest_y = ay + t * aby
    return math.hypot(px - closest_x, py - closest_y)


def point_to_way_distance_m(lat, lon, way_geometry):
    if not isinstance(way_geometry, list) or len(way_geometry) < 2:
        return None

    px, py = latlon_to_local_xy_m(lat, lon, lat, lon)
    best_distance = None
    previous = None
    for current in way_geometry:
        if not isinstance(current, dict) or 'lat' not in current or 'lon' not in current:
            previous = current
            continue
        if previous is None or 'lat' not in previous or 'lon' not in previous:
            previous = current
            continue

        ax, ay = latlon_to_local_xy_m(previous['lat'], previous['lon'], lat, lon)
        bx, by = latlon_to_local_xy_m(current['lat'], current['lon'], lat, lon)
        segment_distance = point_to_segment_distance_m(px, py, ax, ay, bx, by)
        if best_distance is None or segment_distance < best_distance:
            best_distance = segment_distance
        previous = current

    return best_distance


def fetch_nearby_road_maxspeed(lat, lon, search_radius_m=60):
    global road_maxspeed_cache_dirty

    cache_key = f"{lat:.6f},{lon:.6f}"
    if cache_key in road_maxspeed_cache:
        print(
            f"[ROAD MAXSPEED] cache hit for {cache_key}: "
            f"{road_maxspeed_cache[cache_key]!r}"
        )
        return road_maxspeed_cache[cache_key]
    print(
        f"[ROAD MAXSPEED] cache miss for {cache_key}; "
        f"querying roads within {search_radius_m}m."
    )

    overpass_url = "https://overpass-api.de/api/interpreter"
    overpass_query = f"""
    [out:json][timeout:90];
    (
      way(around:{search_radius_m},{lat},{lon})["highway"]["maxspeed"];
      way(around:{search_radius_m},{lat},{lon})["highway"]["maxspeed:forward"];
      way(around:{search_radius_m},{lat},{lon})["highway"]["maxspeed:backward"];
    );
    out tags geom;
    """
    headers = {
        "Accept": "application/json",
        "User-Agent": "curl/7.68.0",
    }

    while True:
        try:
            response = session.get(
                overpass_url,
                params={'data': overpass_query},
                headers=headers,
                timeout=120,
            )
        except requests.RequestException as err:
            print(
                f"Overpass road maxspeed request failed ({err}) for {cache_key}. "
                "Retrying in 30 seconds..."
            )
            time.sleep(30)
            continue

        if response.status_code in (429, 500, 502, 503, 504):
            print(
                f"Overpass road maxspeed request got HTTP {response.status_code} for {cache_key}. "
                "Retrying in 30 seconds..."
            )
            time.sleep(30)
            continue

        if response.status_code >= 400:
            print(
                f"Overpass road maxspeed request got HTTP {response.status_code} for {cache_key}. "
                "Skipping road maxspeed fallback for this radar."
            )
            road_maxspeed_cache[cache_key] = None
            road_maxspeed_cache_dirty = True
            return None

        try:
            response_json = response.json()
        except ValueError as err:
            print(
                f"Overpass road maxspeed response is invalid JSON ({err}) for {cache_key}. "
                "Retrying in 30 seconds..."
            )
            time.sleep(30)
            continue

        best_distance = None
        best_maxspeed = None
        candidate_count = 0
        for element in response_json.get('elements', []):
            element_id = element.get('id')
            tags = element.get('tags', {})
            normalized_maxspeed = extract_way_maxspeed(tags, element_id=element_id)
            geometry = element.get('geometry')
            if normalized_maxspeed is None or geometry is None:
                print(
                    f"[ROAD MAXSPEED] ignoring way_id={element_id}: "
                    f"maxspeed={tags.get('maxspeed')!r}, "
                    f"maxspeed:forward={tags.get('maxspeed:forward')!r}, "
                    f"maxspeed:backward={tags.get('maxspeed:backward')!r}, "
                    f"geometry_present={geometry is not None}"
                )
                continue

            distance = point_to_way_distance_m(lat, lon, geometry)
            if distance is None:
                print(
                    f"[ROAD MAXSPEED] ignoring way_id={element_id}: "
                    "could not compute geometry distance."
                )
                continue
            candidate_count += 1
            print(
                f"[ROAD MAXSPEED] candidate way_id={element_id}: "
                f"maxspeed={normalized_maxspeed}, distance_m={distance:.2f}"
            )
            if best_distance is None or distance < best_distance:
                best_distance = distance
                best_maxspeed = normalized_maxspeed
                print(
                    f"[ROAD MAXSPEED] new best way_id={element_id}: "
                    f"maxspeed={best_maxspeed}, distance_m={best_distance:.2f}"
                )

        if candidate_count == 0:
            print(
                f"[ROAD MAXSPEED] no usable road candidate found for {cache_key}."
            )
        else:
            print(
                f"[ROAD MAXSPEED] selected maxspeed={best_maxspeed} "
                f"for {cache_key} from {candidate_count} candidate roads."
            )
        road_maxspeed_cache[cache_key] = best_maxspeed
        road_maxspeed_cache_dirty = True
        return best_maxspeed

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
    response = securite_get_with_retry(
        securite_routiere_url,
        headers=headers,
        timeout=120,
        request_name="Securité Routière list request",
    )

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
    while True:
        response = securite_get_with_retry(
            url,
            headers=headers,
            timeout=60,
            request_name=f"Radar ID {radar_id}",
        )

        if response.status_code == 404:
            print(f"Skipping radar ID {radar_id}: not found (404).")
            return None

        try:
            response.raise_for_status()
            return response.json()
        except requests.RequestException as err:
            print(
                f"Radar ID {radar_id}: HTTP error ({err}). "
                "Retrying in 30 seconds..."
            )
            time.sleep(30)
        except ValueError as err:
            print(
                f"Radar ID {radar_id}: invalid JSON ({err}). "
                "Retrying in 30 seconds..."
            )
            time.sleep(30)

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
missing_speed_debug = []
              
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
        print(
            f"[ITINERAIRE] Processing {id} at ({item['lat']}, {item['lng']}) "
            f"[detail lookup #{detail_lookups}]"
        )
        securite_routiere_radar = fetch_radar_details(id)
        if securite_routiere_radar is None:
            print(f"[ITINERAIRE] Skipping {id}: detail fetch failed.")
            continue
        try:
            radius = float(securite_routiere_radar['radartronconkm'])
        except (ValueError, TypeError):
            radius = 30.0
            print(f"[ITINERAIRE] {id}: invalid radartronconkm, fallback radius={radius} km.")
        radars_within_radius = find_radars_in_osm_data(item['lat'], item['lng'], osm_data, radius)
        print(
            f"[ITINERAIRE] {id}: found {len(radars_within_radius)} OSM radar candidates "
            f"within {radius} km."
        )
        if len(radars_within_radius) == 0:
            print(f"No radar found within {radius} km of the coordinates {item['lat']}, {item['lng']}.")
        for radar_index, closest_radar in enumerate(radars_within_radius, start=1):
            radar_id = closest_radar.get('id')
            radar_lat = closest_radar.get('lat')
            radar_lon = closest_radar.get('lon')
            tags = closest_radar.get('tags', {})
            node_maxspeed = tags.get('maxspeed')
            print(
                f"[OSM RADAR] {id} candidate #{radar_index}: "
                f"node_id={radar_id}, coords=({radar_lat}, {radar_lon}), "
                f"node_maxspeed={node_maxspeed!r}, tags={tags}"
            )
            if 'tags' in closest_radar and 'maxspeed' in closest_radar['tags']:
                print(
                    f"[OSM RADAR] {id} node_id={radar_id}: using node maxspeed="
                    f"{closest_radar['tags']['maxspeed']!r}."
                )
                result.append({
                'latitude': closest_radar['lat'],
                'longitude': closest_radar['lon'],
                'speed_limit': closest_radar['tags']['maxspeed'],
                'source': "osm"
                })
            else:
                road_maxspeed = fetch_nearby_road_maxspeed(
                    closest_radar['lat'],
                    closest_radar['lon'],
                )
                if road_maxspeed is not None:
                    print(
                        f"[OSM RADAR] {id} node_id={radar_id}: "
                        "no node maxspeed; "
                        f"using nearby road maxspeed={road_maxspeed}."
                    )
                    result.append({
                    'latitude': closest_radar['lat'],
                    'longitude': closest_radar['lon'],
                    'speed_limit': road_maxspeed,
                    'source': "osm"
                    })
                else:
                    print(
                        f"[OSM RADAR] {id} node_id={radar_id}: "
                        "no node maxspeed and no nearby road maxspeed found."
                    )
                    missing_speed_debug.append({
                        'itineraire_id': id,
                        'itineraire_latitude': item['lat'],
                        'itineraire_longitude': item['lng'],
                        'radius_km': radius,
                        'osm_node_id': radar_id,
                        'osm_radar_latitude': radar_lat,
                        'osm_radar_longitude': radar_lon,
                        'osm_tags': tags,
                    })
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

if road_maxspeed_cache_dirty:
    with open(ROAD_MAXSPEED_CACHE_PATH, 'w', encoding='utf-8') as f:
        json.dump(road_maxspeed_cache, f, ensure_ascii=False, indent=4)

with open(MISSING_SPEED_DEBUG_PATH, 'w', encoding='utf-8') as f:
    json.dump(missing_speed_debug, f, ensure_ascii=False, indent=4)
print(
    f"Saved missing-speed debug entries: {len(missing_speed_debug)} "
    f"to {MISSING_SPEED_DEBUG_PATH}"
)

with open(output_file_path, 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=4)

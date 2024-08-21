export function computeDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRadians = (degrees: number) => degrees * Math.PI / 180;

    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const rLat1 = toRadians(lat1);
    const rLat2 = toRadians(lat2);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(rLat1) * Math.cos(rLat2) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  export function computeEastWestOffset(lat: number, lon1: number, lon2: number): number {
    // Radius of the Earth in kilometers
    const R = 6371;

    // Convert latitudes and longitudes from degrees to radians
    const latRad = lat * (Math.PI / 180);
    const lon1Rad = lon1 * (Math.PI / 180);
    const lon2Rad = lon2 * (Math.PI / 180);

    // Difference in longitude
    const deltaLon = lon2Rad - lon1Rad;

    // Compute the east-west distance using the Haversine formula
    const x = deltaLon * Math.cos(latRad);
    const distance = R * x;

    return distance; // Return signed distance
}

export function computeNorthSouthOffset(lat1: number, lat2: number): number {
    // Radius of the Earth in kilometers
    const R = 6371;

    // Convert latitudes from degrees to radians
    const lat1Rad = lat1 * (Math.PI / 180);
    const lat2Rad = lat2 * (Math.PI / 180);

    // Difference in latitude
    const deltaLat = lat2Rad - lat1Rad;

    // Compute the north-south distance using the Haversine formula
    const distance = R * deltaLat;

    return distance; // Return signed distance
}
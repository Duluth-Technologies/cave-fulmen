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

  export function computeEastWestOffsetInMeters(lat: number, lon1: number, lon2: number): number {
    // Radius of the Earth in meters
    const R = 6371000;

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

export function computeNorthSouthOffsetInMeters(lat1: number, lat2: number): number {
    // Radius of the Earth in meters
    const R = 6371000;

    // Convert latitudes from degrees to radians
    const lat1Rad = lat1 * (Math.PI / 180);
    const lat2Rad = lat2 * (Math.PI / 180);

    // Difference in latitude
    const deltaLat = lat2Rad - lat1Rad;

    // Compute the north-south distance using the Haversine formula
    const distance = R * deltaLat;

    return distance; // Return signed distance
}

function dotProduct(vecA: [number, number], vecB: [number, number]): number {
  return vecA[0] * vecB[0] + vecA[1] * vecB[1];
}

function magnitude(vec: [number, number]): number {
  return Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1]);
}

function crossProductZ(vecA: [number, number], vecB: [number, number]): number {
  // For 2D vectors, the "z" component of the cross product is the determinant
  return vecA[0] * vecB[1] - vecA[1] * vecB[0];
}

function angleInDegreesBetweenVectors(vecA: [number, number], vecB: [number, number]): number {
  const dotProd = dotProduct(vecA, vecB);
  const magA = magnitude(vecA);
  const magB = magnitude(vecB);

  const cosTheta = dotProd / (magA * magB);
  const angle = 180 / Math.PI * Math.acos(cosTheta); // Returns the angle in degress between 0 and 180

  // Determine the sign of the angle using the cross product
  const crossZ = crossProductZ(vecA, vecB);

  // If the cross product's z-component is negative, the angle is clockwise, so make it negative
  return crossZ < 0 ? -angle : angle;
}

export function angleInDegreesBetweenVectorAndTowPoints(vec: [number, number], lat: number, lon: number, lat2: number, lon2: number): number {
  const eastWestOffset = computeEastWestOffsetInMeters(lat, lon, lon2);
  const northSouthOffset = computeNorthSouthOffsetInMeters(lat, lat2);
  const vec2: [number, number] = [northSouthOffset, eastWestOffset];
  return angleInDegreesBetweenVectors(vec, vec2);
}
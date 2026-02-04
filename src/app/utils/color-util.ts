/**
 * Color utility functions for the Cavefulmen speed camera warning app.
 * These functions compute colors based on distance, speed, and GPS accuracy.
 */

/**
 * Distance thresholds in kilometers for color coding.
 * - GREEN: distance > 2km (safe)
 * - YELLOW: 1km ≤ distance ≤ 2km (caution)
 * - RED: distance < 1km (danger)
 */
export const DISTANCE_THRESHOLDS = {
  GREEN: 2,    // > 2km
  YELLOW: 1,   // 1-2km
  RED: 0       // < 1km
} as const;

/**
 * GPS accuracy thresholds in meters for signal level indication.
 * - STRONG: accuracy < 10m (3 bars)
 * - MEDIUM: 10m ≤ accuracy ≤ 30m (2 bars)
 * - WEAK: accuracy > 30m (1 bar)
 */
export const GPS_ACCURACY_THRESHOLDS = {
  STRONG: 10,   // < 10m
  MEDIUM: 30,   // 10-30m
  WEAK: Infinity // > 30m
} as const;

/**
 * Speed warning thresholds for color coding.
 * - DISTANCE_THRESHOLD: 4km - distance at which speed limit becomes visible
 * - WARNING_MARGIN: 10 km/h - margin below limit for yellow zone
 */
export const SPEED_THRESHOLDS = {
  DISTANCE_THRESHOLD: 4,  // 4km - speed limit visible within this distance
  WARNING_MARGIN: 10      // 10 km/h below limit for yellow zone
} as const;

/**
 * Distance color type representing the three warning levels.
 */
export type DistanceColor = 'green' | 'yellow' | 'red';

/**
 * GPS signal level type representing the four signal strength levels.
 * - 0: No signal (null accuracy)
 * - 1: Weak signal (accuracy > 30m)
 * - 2: Medium signal (10m ≤ accuracy ≤ 30m)
 * - 3: Strong signal (accuracy < 10m)
 */
export type GpsSignalLevel = 0 | 1 | 2 | 3;

/**
 * Speed color type representing the four speed warning levels.
 * - default: Outside distance threshold (> 4km)
 * - green: Safe speed (more than 10 km/h below limit)
 * - yellow: Warning zone (within 10 km/h of limit)
 * - red: Speeding (exceeds limit)
 */
export type SpeedColor = 'default' | 'green' | 'yellow' | 'red';

/**
 * Computes the color for the distance display based on proximity to a speed camera.
 * 
 * Color logic:
 * - Green: distance > 2km (safe distance)
 * - Yellow: 1km ≤ distance ≤ 2km (approaching camera)
 * - Red: distance < 1km (very close to camera)
 * 
 * @param distance - The distance to the nearest speed camera in kilometers
 * @returns The color to display: 'green', 'yellow', or 'red'
 * 
 * @example
 * getDistanceColor(3.5)  // returns 'green'
 * getDistanceColor(1.5)  // returns 'yellow'
 * getDistanceColor(0.5)  // returns 'red'
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3**
 */
export function getDistanceColor(distance: number): DistanceColor {
  if (distance > DISTANCE_THRESHOLDS.GREEN) {
    return 'green';
  } else if (distance >= DISTANCE_THRESHOLDS.YELLOW) {
    return 'yellow';
  } else {
    return 'red';
  }
}

/**
 * Computes the GPS signal level based on accuracy in meters.
 * 
 * Signal level logic:
 * - 3 (strong): accuracy < 10m
 * - 2 (medium): 10m ≤ accuracy ≤ 30m
 * - 1 (weak): accuracy > 30m
 * - 0 (no signal): accuracy is null
 * 
 * @param accuracy - The GPS accuracy in meters, or null if no GPS fix is available
 * @returns The signal level: 0, 1, 2, or 3
 * 
 * @example
 * getGpsSignalLevel(5)    // returns 3 (strong)
 * getGpsSignalLevel(15)   // returns 2 (medium)
 * getGpsSignalLevel(50)   // returns 1 (weak)
 * getGpsSignalLevel(null) // returns 0 (no signal)
 * 
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**
 */
export function getGpsSignalLevel(accuracy: number | null): GpsSignalLevel {
  if (accuracy === null) {
    return 0;
  }
  
  if (accuracy < GPS_ACCURACY_THRESHOLDS.STRONG) {
    return 3;
  } else if (accuracy <= GPS_ACCURACY_THRESHOLDS.MEDIUM) {
    return 2;
  } else {
    return 1;
  }
}

/**
 * Computes the color for the speed display based on current speed, speed limit, and distance to camera.
 * 
 * Color logic:
 * - Default: distance > 4km (outside threshold, no speed warning needed)
 * - Green: speed < (limit - 10) (safe speed, more than 10 km/h below limit)
 * - Yellow: (limit - 10) ≤ speed ≤ limit (warning zone, within 10 km/h of limit)
 * - Red: speed > limit (speeding, exceeds limit)
 * 
 * @param speed - The current driving speed in km/h
 * @param limit - The speed limit in km/h
 * @param distance - The distance to the nearest speed camera in kilometers
 * @returns The color to display: 'default', 'green', 'yellow', or 'red'
 * 
 * @example
 * getSpeedColor(50, 80, 5)   // returns 'default' (outside threshold)
 * getSpeedColor(50, 80, 3)   // returns 'green' (safe speed within threshold)
 * getSpeedColor(75, 80, 3)   // returns 'yellow' (within 10 km/h of limit)
 * getSpeedColor(85, 80, 3)   // returns 'red' (exceeds limit)
 * 
 * **Validates: Requirements 10.1, 10.2, 10.3, 10.4**
 */
export function getSpeedColor(speed: number, limit: number, distance: number): SpeedColor {
  // Outside distance threshold - return default color
  if (distance > SPEED_THRESHOLDS.DISTANCE_THRESHOLD) {
    return 'default';
  }
  
  // Within threshold - compute color based on speed vs limit
  const warningThreshold = limit - SPEED_THRESHOLDS.WARNING_MARGIN;
  
  if (speed < warningThreshold) {
    return 'green';
  } else if (speed <= limit) {
    return 'yellow';
  } else {
    return 'red';
  }
}

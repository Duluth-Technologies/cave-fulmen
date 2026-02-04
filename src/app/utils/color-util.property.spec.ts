import * as fc from 'fast-check';
import { getDistanceColor, getGpsSignalLevel, getSpeedColor, DISTANCE_THRESHOLDS, GPS_ACCURACY_THRESHOLDS, SPEED_THRESHOLDS, DistanceColor, GpsSignalLevel, SpeedColor } from './color-util';

/**
 * Property-based tests for color utility functions
 * Feature: ux-redesign
 * 
 * These tests verify universal properties of the distance color mapping
 * across randomly generated inputs using fast-check library.
 */
describe('Color Utility Property Tests', () => {
  /**
   * Property 3: Distance to Color Mapping
   * 
   * For any distance value in kilometers, the computed distance color should be:
   * - Green when distance > 2
   * - Yellow when 1 ≤ distance ≤ 2
   * - Red when distance < 1
   * 
   * **Validates: Requirements 2.1, 2.2, 2.3**
   */
  describe('Feature: ux-redesign, Property 3: Distance to Color Mapping', () => {
    /**
     * Test that distances greater than 2km always return green.
     * Validates: Requirement 2.1 - WHEN the distance to a camera is greater than 2km,
     * THE Distance_Display SHALL display in green color
     */
    it('should return green for any distance greater than 2km', () => {
      fc.assert(
        fc.property(
          // Generate distances > 2km (from just above 2 to very large values)
          fc.double({ min: 2.0001, max: 1000, noNaN: true }),
          (distance: number) => {
            const color = getDistanceColor(distance);
            expect(color).toBe('green');
            return color === 'green';
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that distances between 1km and 2km (inclusive) always return yellow.
     * Validates: Requirement 2.2 - WHEN the distance to a camera is between 1km and 2km,
     * THE Distance_Display SHALL display in yellow/amber color
     */
    it('should return yellow for any distance between 1km and 2km (inclusive)', () => {
      fc.assert(
        fc.property(
          // Generate distances in the range [1, 2]
          fc.double({ min: 1, max: 2, noNaN: true }),
          (distance: number) => {
            const color = getDistanceColor(distance);
            expect(color).toBe('yellow');
            return color === 'yellow';
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that distances less than 1km always return red.
     * Validates: Requirement 2.3 - WHEN the distance to a camera is less than 1km,
     * THE Distance_Display SHALL display in red color
     */
    it('should return red for any distance less than 1km', () => {
      fc.assert(
        fc.property(
          // Generate distances < 1km (from 0 to just below 1)
          fc.double({ min: 0, max: 0.9999, noNaN: true }),
          (distance: number) => {
            const color = getDistanceColor(distance);
            expect(color).toBe('red');
            return color === 'red';
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test the complete color mapping property for any non-negative distance.
     * This test verifies that for any randomly generated distance value,
     * the color mapping follows the specification exactly.
     */
    it('should correctly map any non-negative distance to the appropriate color', () => {
      fc.assert(
        fc.property(
          // Generate any non-negative distance (realistic range 0 to 100km)
          fc.double({ min: 0, max: 100, noNaN: true }),
          (distance: number) => {
            const color = getDistanceColor(distance);
            
            // Verify the color matches the expected value based on distance
            if (distance > DISTANCE_THRESHOLDS.GREEN) {
              expect(color).toBe('green');
              return color === 'green';
            } else if (distance >= DISTANCE_THRESHOLDS.YELLOW) {
              expect(color).toBe('yellow');
              return color === 'yellow';
            } else {
              expect(color).toBe('red');
              return color === 'red';
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test boundary conditions: the function should handle exact boundary values correctly.
     * - Exactly 2km should be yellow (not green)
     * - Exactly 1km should be yellow (not red)
     */
    it('should handle boundary values correctly', () => {
      // Test exact boundaries
      expect(getDistanceColor(2)).toBe('yellow');
      expect(getDistanceColor(1)).toBe('yellow');
      
      // Test values just above and below boundaries
      fc.assert(
        fc.property(
          fc.double({ min: 0.0001, max: 0.1, noNaN: true }),
          (epsilon: number) => {
            // Just above 2km should be green
            expect(getDistanceColor(2 + epsilon)).toBe('green');
            
            // Just below 1km should be red
            expect(getDistanceColor(1 - epsilon)).toBe('red');
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that the color mapping is deterministic:
     * the same distance should always produce the same color.
     */
    it('should be deterministic - same distance always produces same color', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 100, noNaN: true }),
          (distance: number) => {
            const color1 = getDistanceColor(distance);
            const color2 = getDistanceColor(distance);
            const color3 = getDistanceColor(distance);
            
            expect(color1).toBe(color2);
            expect(color2).toBe(color3);
            
            return color1 === color2 && color2 === color3;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that the return value is always one of the valid DistanceColor values.
     */
    it('should always return a valid DistanceColor value', () => {
      const validColors: DistanceColor[] = ['green', 'yellow', 'red'];
      
      fc.assert(
        fc.property(
          fc.double({ min: -10, max: 1000, noNaN: true }),
          (distance: number) => {
            const color = getDistanceColor(distance);
            expect(validColors).toContain(color);
            return validColors.includes(color);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 4: GPS Accuracy to Signal Level Mapping
   * 
   * For any GPS accuracy value in meters (or null), the computed signal level should be:
   * - 3 (strong) when accuracy < 10
   * - 2 (medium) when 10 ≤ accuracy ≤ 30
   * - 1 (weak) when accuracy > 30
   * - 0 (no signal) when accuracy is null
   * 
   * **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**
   */
  describe('Feature: ux-redesign, Property 4: GPS Accuracy to Signal Level Mapping', () => {
    /**
     * Test that accuracy values less than 10m always return signal level 3 (strong).
     * Validates: Requirement 4.2 - WHEN GPS accuracy is better than 10 meters,
     * THE GPS_Indicator SHALL show a strong signal indicator (3 bars)
     */
    it('should return 3 (strong) for any accuracy less than 10m', () => {
      fc.assert(
        fc.property(
          // Generate accuracy values < 10m (from 0 to just below 10)
          fc.double({ min: 0, max: 9.9999, noNaN: true }),
          (accuracy: number) => {
            const signalLevel = getGpsSignalLevel(accuracy);
            expect(signalLevel).toBe(3);
            return signalLevel === 3;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that accuracy values between 10m and 30m (inclusive) always return signal level 2 (medium).
     * Validates: Requirement 4.3 - WHEN GPS accuracy is between 10 and 30 meters,
     * THE GPS_Indicator SHALL show a medium signal indicator (2 bars)
     */
    it('should return 2 (medium) for any accuracy between 10m and 30m (inclusive)', () => {
      fc.assert(
        fc.property(
          // Generate accuracy values in the range [10, 30]
          fc.double({ min: 10, max: 30, noNaN: true }),
          (accuracy: number) => {
            const signalLevel = getGpsSignalLevel(accuracy);
            expect(signalLevel).toBe(2);
            return signalLevel === 2;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that accuracy values greater than 30m always return signal level 1 (weak).
     * Validates: Requirement 4.4 - WHEN GPS accuracy is worse than 30 meters,
     * THE GPS_Indicator SHALL show a weak signal indicator (1 bar)
     */
    it('should return 1 (weak) for any accuracy greater than 30m', () => {
      fc.assert(
        fc.property(
          // Generate accuracy values > 30m (from just above 30 to very large values)
          fc.double({ min: 30.0001, max: 10000, noNaN: true }),
          (accuracy: number) => {
            const signalLevel = getGpsSignalLevel(accuracy);
            expect(signalLevel).toBe(1);
            return signalLevel === 1;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that null accuracy always returns signal level 0 (no signal).
     * Validates: Requirement 4.5 - WHEN no GPS fix is available,
     * THE GPS_Indicator SHALL show a "no signal" state (0 bars or crossed-out icon)
     */
    it('should return 0 (no signal) for null accuracy', () => {
      const signalLevel = getGpsSignalLevel(null);
      expect(signalLevel).toBe(0);
    });

    /**
     * Test the complete GPS signal level mapping property for any accuracy value.
     * This test verifies that for any randomly generated accuracy value (or null),
     * the signal level mapping follows the specification exactly.
     */
    it('should correctly map any accuracy value to the appropriate signal level', () => {
      fc.assert(
        fc.property(
          // Generate accuracy values or null using oneof
          fc.oneof(
            fc.constant(null),
            fc.double({ min: 0, max: 1000, noNaN: true })
          ),
          (accuracy: number | null) => {
            const signalLevel = getGpsSignalLevel(accuracy);
            
            // Verify the signal level matches the expected value based on accuracy
            if (accuracy === null) {
              expect(signalLevel).toBe(0);
              return signalLevel === 0;
            } else if (accuracy < GPS_ACCURACY_THRESHOLDS.STRONG) {
              expect(signalLevel).toBe(3);
              return signalLevel === 3;
            } else if (accuracy <= GPS_ACCURACY_THRESHOLDS.MEDIUM) {
              expect(signalLevel).toBe(2);
              return signalLevel === 2;
            } else {
              expect(signalLevel).toBe(1);
              return signalLevel === 1;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test boundary conditions: the function should handle exact boundary values correctly.
     * - Exactly 10m should be medium (not strong)
     * - Exactly 30m should be medium (not weak)
     */
    it('should handle boundary values correctly', () => {
      // Test exact boundaries
      expect(getGpsSignalLevel(10)).toBe(2);
      expect(getGpsSignalLevel(30)).toBe(2);
      
      // Test values just above and below boundaries
      fc.assert(
        fc.property(
          fc.double({ min: 0.0001, max: 0.1, noNaN: true }),
          (epsilon: number) => {
            // Just below 10m should be strong (3)
            expect(getGpsSignalLevel(10 - epsilon)).toBe(3);
            
            // Just above 30m should be weak (1)
            expect(getGpsSignalLevel(30 + epsilon)).toBe(1);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that the signal level mapping is deterministic:
     * the same accuracy should always produce the same signal level.
     */
    it('should be deterministic - same accuracy always produces same signal level', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(null),
            fc.double({ min: 0, max: 1000, noNaN: true })
          ),
          (accuracy: number | null) => {
            const level1 = getGpsSignalLevel(accuracy);
            const level2 = getGpsSignalLevel(accuracy);
            const level3 = getGpsSignalLevel(accuracy);
            
            expect(level1).toBe(level2);
            expect(level2).toBe(level3);
            
            return level1 === level2 && level2 === level3;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that the return value is always one of the valid GpsSignalLevel values.
     */
    it('should always return a valid GpsSignalLevel value', () => {
      const validLevels: GpsSignalLevel[] = [0, 1, 2, 3];
      
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(null),
            fc.double({ min: -10, max: 10000, noNaN: true })
          ),
          (accuracy: number | null) => {
            const signalLevel = getGpsSignalLevel(accuracy);
            expect(validLevels).toContain(signalLevel);
            return validLevels.includes(signalLevel);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that signal levels are monotonically decreasing as accuracy worsens.
     * Better accuracy (lower value) should result in higher or equal signal level.
     */
    it('should have monotonically decreasing signal levels as accuracy worsens', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 1000, noNaN: true }),
          fc.double({ min: 0, max: 1000, noNaN: true }),
          (accuracy1: number, accuracy2: number) => {
            const level1 = getGpsSignalLevel(accuracy1);
            const level2 = getGpsSignalLevel(accuracy2);
            
            // If accuracy1 is better (lower), signal level should be >= level2
            if (accuracy1 < accuracy2) {
              expect(level1).toBeGreaterThanOrEqual(level2);
              return level1 >= level2;
            } else if (accuracy1 > accuracy2) {
              expect(level1).toBeLessThanOrEqual(level2);
              return level1 <= level2;
            } else {
              expect(level1).toBe(level2);
              return level1 === level2;
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});


  /**
   * Property 12: Speed Display Color Based on Context
   * 
   * For any combination of current speed, speed limit, and distance to camera:
   * - When distance > 4 (outside threshold): default color
   * - When distance ≤ 4 and speed < (limit - 10): green
   * - When distance ≤ 4 and (limit - 10) ≤ speed ≤ limit: yellow
   * - When distance ≤ 4 and speed > limit: red
   * 
   * **Validates: Requirements 10.1, 10.2, 10.3, 10.4**
   */
  describe('Feature: ux-redesign, Property 12: Speed Display Color Based on Context', () => {
    /**
     * Test that when distance > 4km (outside threshold), the color is always 'default'.
     * Validates: Requirement 10.4 - WHEN outside the Distance_Threshold,
     * THE Speed_Display SHALL display in the default theme color
     */
    it('should return default for any distance greater than 4km (outside threshold)', () => {
      fc.assert(
        fc.property(
          // Generate speed values (0 to 200 km/h)
          fc.double({ min: 0, max: 200, noNaN: true }),
          // Generate speed limit values (20 to 150 km/h - realistic limits)
          fc.double({ min: 20, max: 150, noNaN: true }),
          // Generate distances > 4km (from just above 4 to very large values)
          fc.double({ min: 4.0001, max: 100, noNaN: true }),
          (speed: number, limit: number, distance: number) => {
            const color = getSpeedColor(speed, limit, distance);
            expect(color).toBe('default');
            return color === 'default';
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that when within threshold and speed < (limit - 10), the color is 'green'.
     * Validates: Requirement 10.1 - WHEN within the Distance_Threshold and current speed
     * is more than 10 km/h below the limit, THE Speed_Display SHALL display in green
     */
    it('should return green when within threshold and speed is more than 10 km/h below limit', () => {
      fc.assert(
        fc.property(
          // Generate speed limit values (20 to 150 km/h)
          fc.double({ min: 20, max: 150, noNaN: true }),
          // Generate distances within threshold (0 to 4km)
          fc.double({ min: 0, max: 4, noNaN: true }),
          // Generate a margin > 10 to ensure speed is below (limit - 10)
          fc.double({ min: 10.0001, max: 50, noNaN: true }),
          (limit: number, distance: number, margin: number) => {
            // Speed is more than 10 km/h below limit
            const speed = Math.max(0, limit - margin);
            const color = getSpeedColor(speed, limit, distance);
            expect(color).toBe('green');
            return color === 'green';
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that when within threshold and (limit - 10) ≤ speed ≤ limit, the color is 'yellow'.
     * Validates: Requirement 10.2 - WHEN within the Distance_Threshold and current speed
     * is within 10 km/h of the limit, THE Speed_Display SHALL display in yellow/amber
     */
    it('should return yellow when within threshold and speed is within 10 km/h of limit', () => {
      fc.assert(
        fc.property(
          // Generate speed limit values (20 to 150 km/h)
          fc.double({ min: 20, max: 150, noNaN: true }),
          // Generate distances within threshold (0 to 4km)
          fc.double({ min: 0, max: 4, noNaN: true }),
          // Generate a factor between 0 and 1 to interpolate between (limit-10) and limit
          fc.double({ min: 0, max: 1, noNaN: true }),
          (limit: number, distance: number, factor: number) => {
            // Speed is between (limit - 10) and limit (inclusive)
            const warningThreshold = limit - SPEED_THRESHOLDS.WARNING_MARGIN;
            const speed = warningThreshold + (factor * SPEED_THRESHOLDS.WARNING_MARGIN);
            const color = getSpeedColor(speed, limit, distance);
            expect(color).toBe('yellow');
            return color === 'yellow';
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that when within threshold and speed > limit, the color is 'red'.
     * Validates: Requirement 10.3 - WHEN within the Distance_Threshold and current speed
     * exceeds the limit, THE Speed_Display SHALL display in red
     */
    it('should return red when within threshold and speed exceeds limit', () => {
      fc.assert(
        fc.property(
          // Generate speed limit values (20 to 150 km/h)
          fc.double({ min: 20, max: 150, noNaN: true }),
          // Generate distances within threshold (0 to 4km)
          fc.double({ min: 0, max: 4, noNaN: true }),
          // Generate excess speed above limit (0.001 to 50 km/h over)
          fc.double({ min: 0.0001, max: 50, noNaN: true }),
          (limit: number, distance: number, excess: number) => {
            // Speed exceeds limit
            const speed = limit + excess;
            const color = getSpeedColor(speed, limit, distance);
            expect(color).toBe('red');
            return color === 'red';
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test the complete speed color mapping property for any combination of inputs.
     * This test verifies that for any randomly generated (speed, limit, distance) tuple,
     * the color mapping follows the specification exactly.
     */
    it('should correctly map any (speed, limit, distance) tuple to the appropriate color', () => {
      fc.assert(
        fc.property(
          // Generate speed values (0 to 200 km/h)
          fc.double({ min: 0, max: 200, noNaN: true }),
          // Generate speed limit values (20 to 150 km/h)
          fc.double({ min: 20, max: 150, noNaN: true }),
          // Generate distance values (0 to 100 km)
          fc.double({ min: 0, max: 100, noNaN: true }),
          (speed: number, limit: number, distance: number) => {
            const color = getSpeedColor(speed, limit, distance);
            const warningThreshold = limit - SPEED_THRESHOLDS.WARNING_MARGIN;
            
            // Verify the color matches the expected value based on inputs
            if (distance > SPEED_THRESHOLDS.DISTANCE_THRESHOLD) {
              expect(color).toBe('default');
              return color === 'default';
            } else if (speed < warningThreshold) {
              expect(color).toBe('green');
              return color === 'green';
            } else if (speed <= limit) {
              expect(color).toBe('yellow');
              return color === 'yellow';
            } else {
              expect(color).toBe('red');
              return color === 'red';
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test boundary conditions for distance threshold (4km).
     * - Exactly 4km should be within threshold (not default)
     * - Just above 4km should be outside threshold (default)
     */
    it('should handle distance threshold boundary (4km) correctly', () => {
      // Test exact boundary - 4km should be within threshold
      expect(getSpeedColor(50, 80, 4)).not.toBe('default');
      
      // Test values just above and below boundary
      fc.assert(
        fc.property(
          fc.double({ min: 0.0001, max: 0.1, noNaN: true }),
          fc.double({ min: 20, max: 150, noNaN: true }),
          (epsilon: number, limit: number) => {
            // Just above 4km should be default
            expect(getSpeedColor(50, limit, 4 + epsilon)).toBe('default');
            
            // Just below 4km should not be default (depends on speed)
            const colorBelow = getSpeedColor(50, limit, 4 - epsilon);
            expect(colorBelow).not.toBe('default');
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test boundary conditions for speed warning threshold (limit - 10).
     * - Speed exactly at (limit - 10) should be yellow
     * - Speed just below (limit - 10) should be green
     */
    it('should handle speed warning threshold boundary (limit - 10) correctly', () => {
      // Test exact boundary - (limit - 10) should be yellow
      expect(getSpeedColor(70, 80, 3)).toBe('yellow');
      
      // Test values just above and below boundary
      fc.assert(
        fc.property(
          fc.double({ min: 0.0001, max: 0.1, noNaN: true }),
          fc.double({ min: 20, max: 150, noNaN: true }),
          fc.double({ min: 0, max: 4, noNaN: true }),
          (epsilon: number, limit: number, distance: number) => {
            const warningThreshold = limit - SPEED_THRESHOLDS.WARNING_MARGIN;
            
            // Just below warning threshold should be green
            expect(getSpeedColor(warningThreshold - epsilon, limit, distance)).toBe('green');
            
            // Just above warning threshold should be yellow
            expect(getSpeedColor(warningThreshold + epsilon, limit, distance)).toBe('yellow');
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test boundary conditions for speed limit.
     * - Speed exactly at limit should be yellow
     * - Speed just above limit should be red
     */
    it('should handle speed limit boundary correctly', () => {
      // Test exact boundary - speed at limit should be yellow
      expect(getSpeedColor(80, 80, 3)).toBe('yellow');
      
      // Test values just above and below boundary
      fc.assert(
        fc.property(
          fc.double({ min: 0.0001, max: 0.1, noNaN: true }),
          fc.double({ min: 20, max: 150, noNaN: true }),
          fc.double({ min: 0, max: 4, noNaN: true }),
          (epsilon: number, limit: number, distance: number) => {
            // Speed at limit should be yellow
            expect(getSpeedColor(limit, limit, distance)).toBe('yellow');
            
            // Just above limit should be red
            expect(getSpeedColor(limit + epsilon, limit, distance)).toBe('red');
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that the speed color mapping is deterministic:
     * the same inputs should always produce the same color.
     */
    it('should be deterministic - same inputs always produce same color', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 200, noNaN: true }),
          fc.double({ min: 20, max: 150, noNaN: true }),
          fc.double({ min: 0, max: 100, noNaN: true }),
          (speed: number, limit: number, distance: number) => {
            const color1 = getSpeedColor(speed, limit, distance);
            const color2 = getSpeedColor(speed, limit, distance);
            const color3 = getSpeedColor(speed, limit, distance);
            
            expect(color1).toBe(color2);
            expect(color2).toBe(color3);
            
            return color1 === color2 && color2 === color3;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that the return value is always one of the valid SpeedColor values.
     */
    it('should always return a valid SpeedColor value', () => {
      const validColors: SpeedColor[] = ['default', 'green', 'yellow', 'red'];
      
      fc.assert(
        fc.property(
          fc.double({ min: -10, max: 250, noNaN: true }),
          fc.double({ min: 1, max: 200, noNaN: true }),
          fc.double({ min: -1, max: 150, noNaN: true }),
          (speed: number, limit: number, distance: number) => {
            const color = getSpeedColor(speed, limit, distance);
            expect(validColors).toContain(color);
            return validColors.includes(color);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that speed color severity increases as speed increases (within threshold).
     * For a fixed limit and distance within threshold:
     * - Lower speeds should have equal or less severe colors than higher speeds
     * - Color severity order: green < yellow < red
     */
    it('should have monotonically increasing severity as speed increases (within threshold)', () => {
      const colorSeverity: Record<SpeedColor, number> = {
        'default': 0,
        'green': 1,
        'yellow': 2,
        'red': 3
      };
      
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 150, noNaN: true }),
          fc.double({ min: 0, max: 150, noNaN: true }),
          fc.double({ min: 20, max: 150, noNaN: true }),
          fc.double({ min: 0, max: 4, noNaN: true }),
          (speed1: number, speed2: number, limit: number, distance: number) => {
            const color1 = getSpeedColor(speed1, limit, distance);
            const color2 = getSpeedColor(speed2, limit, distance);
            
            // If speed1 < speed2, severity of color1 should be <= severity of color2
            if (speed1 < speed2) {
              expect(colorSeverity[color1]).toBeLessThanOrEqual(colorSeverity[color2]);
              return colorSeverity[color1] <= colorSeverity[color2];
            } else if (speed1 > speed2) {
              expect(colorSeverity[color1]).toBeGreaterThanOrEqual(colorSeverity[color2]);
              return colorSeverity[color1] >= colorSeverity[color2];
            } else {
              expect(color1).toBe(color2);
              return color1 === color2;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test with various realistic speed limits used in France.
     * Common limits: 30, 50, 70, 80, 90, 110, 130 km/h
     */
    it('should work correctly with common French speed limits', () => {
      const frenchLimits = [30, 50, 70, 80, 90, 110, 130];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...frenchLimits),
          fc.double({ min: 0, max: 200, noNaN: true }),
          fc.double({ min: 0, max: 100, noNaN: true }),
          (limit: number, speed: number, distance: number) => {
            const color = getSpeedColor(speed, limit, distance);
            const warningThreshold = limit - SPEED_THRESHOLDS.WARNING_MARGIN;
            
            // Verify the color matches the expected value
            if (distance > SPEED_THRESHOLDS.DISTANCE_THRESHOLD) {
              expect(color).toBe('default');
              return color === 'default';
            } else if (speed < warningThreshold) {
              expect(color).toBe('green');
              return color === 'green';
            } else if (speed <= limit) {
              expect(color).toBe('yellow');
              return color === 'yellow';
            } else {
              expect(color).toBe('red');
              return color === 'red';
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

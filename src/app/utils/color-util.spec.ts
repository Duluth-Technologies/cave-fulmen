import { getDistanceColor, getGpsSignalLevel, getSpeedColor, DISTANCE_THRESHOLDS, GPS_ACCURACY_THRESHOLDS, SPEED_THRESHOLDS, DistanceColor, GpsSignalLevel, SpeedColor } from './color-util';

/**
 * Unit tests for color utility functions.
 * These tests verify specific examples and edge cases for the distance color function.
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3**
 */
describe('Color Utility Functions', () => {
  describe('getDistanceColor', () => {
    describe('Green zone (distance > 2km)', () => {
      it('should return green for distance greater than 2km', () => {
        expect(getDistanceColor(3)).toBe('green');
      });

      it('should return green for large distances', () => {
        expect(getDistanceColor(10)).toBe('green');
        expect(getDistanceColor(100)).toBe('green');
      });

      it('should return green for distance just above 2km', () => {
        expect(getDistanceColor(2.001)).toBe('green');
        expect(getDistanceColor(2.1)).toBe('green');
      });
    });

    describe('Yellow zone (1km ≤ distance ≤ 2km)', () => {
      it('should return yellow for distance exactly at 2km boundary', () => {
        expect(getDistanceColor(2)).toBe('yellow');
      });

      it('should return yellow for distance exactly at 1km boundary', () => {
        expect(getDistanceColor(1)).toBe('yellow');
      });

      it('should return yellow for distance between 1km and 2km', () => {
        expect(getDistanceColor(1.5)).toBe('yellow');
        expect(getDistanceColor(1.9)).toBe('yellow');
        expect(getDistanceColor(1.1)).toBe('yellow');
      });
    });

    describe('Red zone (distance < 1km)', () => {
      it('should return red for distance less than 1km', () => {
        expect(getDistanceColor(0.5)).toBe('red');
      });

      it('should return red for distance just below 1km', () => {
        expect(getDistanceColor(0.999)).toBe('red');
        expect(getDistanceColor(0.9)).toBe('red');
      });

      it('should return red for very small distances', () => {
        expect(getDistanceColor(0.1)).toBe('red');
        expect(getDistanceColor(0.01)).toBe('red');
      });

      it('should return red for zero distance', () => {
        expect(getDistanceColor(0)).toBe('red');
      });
    });

    describe('Edge cases', () => {
      it('should handle negative distances as red', () => {
        // Negative distances shouldn't occur in practice, but the function
        // should handle them gracefully by treating them as very close (red)
        expect(getDistanceColor(-1)).toBe('red');
      });
    });
  });

  describe('DISTANCE_THRESHOLDS', () => {
    it('should have correct threshold values', () => {
      expect(DISTANCE_THRESHOLDS.GREEN).toBe(2);
      expect(DISTANCE_THRESHOLDS.YELLOW).toBe(1);
      expect(DISTANCE_THRESHOLDS.RED).toBe(0);
    });
  });

  /**
   * Unit tests for GPS signal level function.
   * These tests verify specific examples and edge cases for the GPS signal level function.
   * 
   * **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**
   */
  describe('getGpsSignalLevel', () => {
    describe('Strong signal (3 bars) - accuracy < 10m', () => {
      it('should return 3 for accuracy less than 10m', () => {
        expect(getGpsSignalLevel(5)).toBe(3);
      });

      it('should return 3 for very accurate GPS', () => {
        expect(getGpsSignalLevel(1)).toBe(3);
        expect(getGpsSignalLevel(0.5)).toBe(3);
      });

      it('should return 3 for accuracy just below 10m', () => {
        expect(getGpsSignalLevel(9.999)).toBe(3);
        expect(getGpsSignalLevel(9)).toBe(3);
      });

      it('should return 3 for zero accuracy (perfect GPS)', () => {
        expect(getGpsSignalLevel(0)).toBe(3);
      });
    });

    describe('Medium signal (2 bars) - 10m ≤ accuracy ≤ 30m', () => {
      it('should return 2 for accuracy exactly at 10m boundary', () => {
        expect(getGpsSignalLevel(10)).toBe(2);
      });

      it('should return 2 for accuracy exactly at 30m boundary', () => {
        expect(getGpsSignalLevel(30)).toBe(2);
      });

      it('should return 2 for accuracy between 10m and 30m', () => {
        expect(getGpsSignalLevel(15)).toBe(2);
        expect(getGpsSignalLevel(20)).toBe(2);
        expect(getGpsSignalLevel(25)).toBe(2);
      });
    });

    describe('Weak signal (1 bar) - accuracy > 30m', () => {
      it('should return 1 for accuracy greater than 30m', () => {
        expect(getGpsSignalLevel(50)).toBe(1);
      });

      it('should return 1 for accuracy just above 30m', () => {
        expect(getGpsSignalLevel(30.001)).toBe(1);
        expect(getGpsSignalLevel(31)).toBe(1);
      });

      it('should return 1 for very poor accuracy', () => {
        expect(getGpsSignalLevel(100)).toBe(1);
        expect(getGpsSignalLevel(500)).toBe(1);
        expect(getGpsSignalLevel(1000)).toBe(1);
      });
    });

    describe('No signal (0 bars) - null accuracy', () => {
      it('should return 0 for null accuracy', () => {
        expect(getGpsSignalLevel(null)).toBe(0);
      });
    });

    describe('Edge cases', () => {
      it('should handle negative accuracy as strong signal', () => {
        // Negative accuracy shouldn't occur in practice, but the function
        // should handle it gracefully by treating it as very accurate (strong)
        expect(getGpsSignalLevel(-1)).toBe(3);
      });
    });
  });

  describe('GPS_ACCURACY_THRESHOLDS', () => {
    it('should have correct threshold values', () => {
      expect(GPS_ACCURACY_THRESHOLDS.STRONG).toBe(10);
      expect(GPS_ACCURACY_THRESHOLDS.MEDIUM).toBe(30);
      expect(GPS_ACCURACY_THRESHOLDS.WEAK).toBe(Infinity);
    });
  });

  /**
   * Unit tests for speed color function.
   * These tests verify specific examples and edge cases for the speed color function.
   * 
   * **Validates: Requirements 10.1, 10.2, 10.3, 10.4**
   */
  describe('getSpeedColor', () => {
    describe('Default color (distance > 4km - outside threshold)', () => {
      it('should return default for distance greater than 4km', () => {
        expect(getSpeedColor(50, 80, 5)).toBe('default');
      });

      it('should return default for large distances regardless of speed', () => {
        expect(getSpeedColor(100, 80, 10)).toBe('default');
        expect(getSpeedColor(50, 80, 100)).toBe('default');
      });

      it('should return default for distance just above 4km', () => {
        expect(getSpeedColor(50, 80, 4.001)).toBe('default');
        expect(getSpeedColor(50, 80, 4.1)).toBe('default');
      });
    });

    describe('Green color (within threshold, speed < limit - 10)', () => {
      it('should return green when speed is more than 10 km/h below limit', () => {
        expect(getSpeedColor(50, 80, 3)).toBe('green');
      });

      it('should return green for very low speeds within threshold', () => {
        expect(getSpeedColor(10, 80, 2)).toBe('green');
        expect(getSpeedColor(0, 80, 1)).toBe('green');
      });

      it('should return green for speed just below warning threshold', () => {
        expect(getSpeedColor(69, 80, 3)).toBe('green');
        expect(getSpeedColor(69.999, 80, 3)).toBe('green');
      });

      it('should return green at exactly 4km distance boundary', () => {
        expect(getSpeedColor(50, 80, 4)).toBe('green');
      });
    });

    describe('Yellow color (within threshold, limit - 10 ≤ speed ≤ limit)', () => {
      it('should return yellow when speed is exactly at warning threshold (limit - 10)', () => {
        expect(getSpeedColor(70, 80, 3)).toBe('yellow');
      });

      it('should return yellow when speed is exactly at limit', () => {
        expect(getSpeedColor(80, 80, 3)).toBe('yellow');
      });

      it('should return yellow for speed between warning threshold and limit', () => {
        expect(getSpeedColor(75, 80, 3)).toBe('yellow');
        expect(getSpeedColor(72, 80, 3)).toBe('yellow');
        expect(getSpeedColor(78, 80, 3)).toBe('yellow');
      });

      it('should return yellow at distance boundary (4km)', () => {
        expect(getSpeedColor(75, 80, 4)).toBe('yellow');
      });
    });

    describe('Red color (within threshold, speed > limit)', () => {
      it('should return red when speed exceeds limit', () => {
        expect(getSpeedColor(85, 80, 3)).toBe('red');
      });

      it('should return red for speed just above limit', () => {
        expect(getSpeedColor(80.001, 80, 3)).toBe('red');
        expect(getSpeedColor(81, 80, 3)).toBe('red');
      });

      it('should return red for significantly exceeding limit', () => {
        expect(getSpeedColor(100, 80, 3)).toBe('red');
        expect(getSpeedColor(150, 80, 2)).toBe('red');
      });

      it('should return red at distance boundary (4km)', () => {
        expect(getSpeedColor(85, 80, 4)).toBe('red');
      });
    });

    describe('Different speed limits', () => {
      it('should work correctly with 30 km/h limit', () => {
        expect(getSpeedColor(15, 30, 3)).toBe('green');  // < 20
        expect(getSpeedColor(20, 30, 3)).toBe('yellow'); // = 20 (limit - 10)
        expect(getSpeedColor(25, 30, 3)).toBe('yellow'); // between 20 and 30
        expect(getSpeedColor(30, 30, 3)).toBe('yellow'); // = limit
        expect(getSpeedColor(35, 30, 3)).toBe('red');    // > limit
      });

      it('should work correctly with 130 km/h limit', () => {
        expect(getSpeedColor(100, 130, 3)).toBe('green');  // < 120
        expect(getSpeedColor(120, 130, 3)).toBe('yellow'); // = 120 (limit - 10)
        expect(getSpeedColor(125, 130, 3)).toBe('yellow'); // between 120 and 130
        expect(getSpeedColor(130, 130, 3)).toBe('yellow'); // = limit
        expect(getSpeedColor(135, 130, 3)).toBe('red');    // > limit
      });
    });

    describe('Edge cases', () => {
      it('should handle zero speed', () => {
        expect(getSpeedColor(0, 80, 3)).toBe('green');
      });

      it('should handle zero distance', () => {
        expect(getSpeedColor(50, 80, 0)).toBe('green');
        expect(getSpeedColor(75, 80, 0)).toBe('yellow');
        expect(getSpeedColor(85, 80, 0)).toBe('red');
      });

      it('should handle negative distance as within threshold', () => {
        // Negative distances shouldn't occur in practice, but the function
        // should handle them gracefully by treating them as very close
        expect(getSpeedColor(50, 80, -1)).toBe('green');
      });

      it('should handle low speed limits where warning threshold could be negative', () => {
        // With limit = 5, warning threshold = -5
        // Any positive speed >= -5 would be yellow or red
        expect(getSpeedColor(0, 5, 3)).toBe('yellow');  // 0 >= -5 and 0 <= 5
        expect(getSpeedColor(5, 5, 3)).toBe('yellow');  // = limit
        expect(getSpeedColor(6, 5, 3)).toBe('red');     // > limit
      });
    });
  });

  describe('SPEED_THRESHOLDS', () => {
    it('should have correct threshold values', () => {
      expect(SPEED_THRESHOLDS.DISTANCE_THRESHOLD).toBe(4);
      expect(SPEED_THRESHOLDS.WARNING_MARGIN).toBe(10);
    });
  });
});

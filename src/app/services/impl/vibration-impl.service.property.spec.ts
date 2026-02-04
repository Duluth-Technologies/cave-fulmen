import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import * as fc from 'fast-check';
import { VibrationServiceImpl } from './vibration-impl.service';
import { VIBRATION_COOLDOWN } from '../vibration.service';

/**
 * Property-based tests for VibrationService
 * Feature: ux-redesign
 * 
 * These tests verify universal properties of the VibrationService across
 * randomly generated inputs using fast-check library.
 */
describe('VibrationServiceImpl Property Tests', () => {
  let service: VibrationServiceImpl;
  let mockVibrate: jasmine.Spy;
  let originalVibrate: typeof navigator.vibrate;

  beforeEach(() => {
    // Store original vibrate function
    originalVibrate = navigator.vibrate;
    
    // Create mock vibrate function that always succeeds
    mockVibrate = jasmine.createSpy('vibrate').and.returnValue(true);
    (navigator as any).vibrate = mockVibrate;

    TestBed.configureTestingModule({
      providers: [
        VibrationServiceImpl,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    service = TestBed.inject(VibrationServiceImpl);
  });

  afterEach(() => {
    // Restore original vibrate function
    if (originalVibrate !== undefined) {
      (navigator as any).vibrate = originalVibrate;
    } else {
      delete (navigator as any).vibrate;
    }
    TestBed.resetTestingModule();
  });

  /**
   * Property 14: Vibration Cooldown Enforcement
   * 
   * For any sequence of vibration trigger conditions, vibrations should occur
   * at most once per 5-second interval.
   * 
   * **Validates: Requirements 11.3**
   */
  describe('Feature: ux-redesign, Property 14: Vibration Cooldown Enforcement', () => {
    /**
     * Test that vibrations are blocked during the cooldown period.
     * For any time elapsed less than 5 seconds since the last vibration,
     * subsequent vibration attempts should be blocked.
     */
    it('should block vibrations during cooldown period (< 5 seconds)', () => {
      fc.assert(
        fc.property(
          // Generate time elapsed since last vibration (0 to just under 5000ms)
          fc.integer({ min: 0, max: VIBRATION_COOLDOWN - 1 }),
          (elapsedTime: number) => {
            // Reset service state
            service._resetLastVibrationTime();
            mockVibrate.calls.reset();

            // Simulate a previous vibration at a specific time
            const lastVibrationTime = Date.now() - elapsedTime;
            service._setLastVibrationTime(lastVibrationTime);

            // Attempt to vibrate - should be blocked
            const result = service.vibrate(200);

            expect(result).toBe(false);
            expect(mockVibrate).not.toHaveBeenCalled();
            expect(service.isInCooldown()).toBe(true);

            return result === false && mockVibrate.calls.count() === 0;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that vibrations are allowed after the cooldown period expires.
     * For any time elapsed >= 5 seconds since the last vibration,
     * subsequent vibration attempts should succeed.
     */
    it('should allow vibrations after cooldown period expires (>= 5 seconds)', () => {
      fc.assert(
        fc.property(
          // Generate time elapsed since last vibration (5000ms to much longer)
          fc.integer({ min: VIBRATION_COOLDOWN, max: VIBRATION_COOLDOWN * 10 }),
          (elapsedTime: number) => {
            // Reset service state
            service._resetLastVibrationTime();
            mockVibrate.calls.reset();

            // Simulate a previous vibration at a specific time
            const lastVibrationTime = Date.now() - elapsedTime;
            service._setLastVibrationTime(lastVibrationTime);

            // Attempt to vibrate - should succeed
            const result = service.vibrate(200);

            expect(result).toBe(true);
            expect(mockVibrate).toHaveBeenCalledTimes(1);
            expect(service.isInCooldown()).toBe(true); // Now in cooldown after successful vibration

            return result === true && mockVibrate.calls.count() === 1;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that the first vibration always succeeds (no prior cooldown).
     * When there has been no previous vibration, the first attempt should always succeed.
     */
    it('should always allow the first vibration (no prior cooldown)', () => {
      fc.assert(
        fc.property(
          // Generate various vibration patterns
          fc.oneof(
            fc.integer({ min: 1, max: 1000 }),
            fc.array(fc.integer({ min: 1, max: 500 }), { minLength: 1, maxLength: 5 })
          ),
          (pattern: number | number[]) => {
            // Reset service state - no previous vibration
            service._resetLastVibrationTime();
            mockVibrate.calls.reset();

            // First vibration should always succeed
            const result = service.vibrate(pattern);

            expect(result).toBe(true);
            expect(mockVibrate).toHaveBeenCalledTimes(1);
            expect(mockVibrate).toHaveBeenCalledWith(pattern);
            expect(service.getLastVibrationTime()).not.toBeNull();

            return result === true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that for any sequence of rapid vibration attempts,
     * only the first one succeeds within a 5-second window.
     */
    it('should allow at most one vibration per 5-second interval for rapid attempts', () => {
      fc.assert(
        fc.property(
          // Generate number of rapid vibration attempts (2 to 20)
          fc.integer({ min: 2, max: 20 }),
          (attemptCount: number) => {
            // Reset service state
            service._resetLastVibrationTime();
            mockVibrate.calls.reset();

            let successCount = 0;

            // Make multiple rapid vibration attempts (all within cooldown period)
            for (let i = 0; i < attemptCount; i++) {
              const result = service.vibrate(200);
              if (result) {
                successCount++;
              }
            }

            // Only the first attempt should succeed
            expect(successCount).toBe(1);
            expect(mockVibrate).toHaveBeenCalledTimes(1);

            return successCount === 1;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that vibrateWarning() also respects the cooldown period.
     * The warning vibration pattern should follow the same cooldown rules.
     */
    it('should enforce cooldown for vibrateWarning() calls', () => {
      fc.assert(
        fc.property(
          // Generate time elapsed since last vibration (0 to just under 5000ms)
          fc.integer({ min: 0, max: VIBRATION_COOLDOWN - 1 }),
          (elapsedTime: number) => {
            // Reset service state
            service._resetLastVibrationTime();
            mockVibrate.calls.reset();

            // Simulate a previous vibration
            const lastVibrationTime = Date.now() - elapsedTime;
            service._setLastVibrationTime(lastVibrationTime);

            // Attempt warning vibration - should be blocked
            const result = service.vibrateWarning();

            expect(result).toBe(false);
            expect(mockVibrate).not.toHaveBeenCalled();

            return result === false;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that cooldown is correctly calculated based on elapsed time.
     * The isInCooldown() method should return true only when less than 5 seconds
     * have passed since the last vibration.
     */
    it('should correctly report cooldown status based on elapsed time', () => {
      fc.assert(
        fc.property(
          // Generate time elapsed since last vibration (0 to 10 seconds)
          fc.integer({ min: 0, max: VIBRATION_COOLDOWN * 2 }),
          (elapsedTime: number) => {
            // Reset service state
            service._resetLastVibrationTime();

            // Simulate a previous vibration at a specific time
            const lastVibrationTime = Date.now() - elapsedTime;
            service._setLastVibrationTime(lastVibrationTime);

            const isInCooldown = service.isInCooldown();
            const expectedInCooldown = elapsedTime < VIBRATION_COOLDOWN;

            expect(isInCooldown).toBe(expectedInCooldown);

            return isInCooldown === expectedInCooldown;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that the cooldown boundary (exactly 5 seconds) is handled correctly.
     * At exactly 5 seconds, the cooldown should have expired.
     */
    it('should handle cooldown boundary (exactly 5 seconds) correctly', () => {
      // Reset service state
      service._resetLastVibrationTime();
      mockVibrate.calls.reset();

      // Set last vibration to exactly 5 seconds ago
      const lastVibrationTime = Date.now() - VIBRATION_COOLDOWN;
      service._setLastVibrationTime(lastVibrationTime);

      // Should not be in cooldown at exactly 5 seconds
      expect(service.isInCooldown()).toBe(false);

      // Vibration should succeed
      const result = service.vibrate(200);
      expect(result).toBe(true);
      expect(mockVibrate).toHaveBeenCalledTimes(1);
    });

    /**
     * Test that multiple vibration sequences with proper spacing all succeed.
     * If we wait at least 5 seconds between each vibration, all should succeed.
     */
    it('should allow multiple vibrations when properly spaced (>= 5 seconds apart)', () => {
      fc.assert(
        fc.property(
          // Generate number of vibration sequences (2 to 5)
          fc.integer({ min: 2, max: 5 }),
          // Generate spacing between vibrations (5000ms to 10000ms)
          fc.integer({ min: VIBRATION_COOLDOWN, max: VIBRATION_COOLDOWN * 2 }),
          (sequenceCount: number, spacing: number) => {
            // Reset service state
            service._resetLastVibrationTime();
            mockVibrate.calls.reset();

            let successCount = 0;
            let currentTime = Date.now();

            for (let i = 0; i < sequenceCount; i++) {
              if (i > 0) {
                // Simulate time passing by setting last vibration time appropriately
                // This simulates that `spacing` ms have passed since the last vibration
                const simulatedLastVibrationTime = currentTime - spacing;
                service._setLastVibrationTime(simulatedLastVibrationTime);
              }

              const result = service.vibrate(200);
              if (result) {
                successCount++;
                // Update current time to reflect the new vibration
                currentTime = Date.now();
              }
            }

            // All attempts should succeed when properly spaced
            expect(successCount).toBe(sequenceCount);
            expect(mockVibrate).toHaveBeenCalledTimes(sequenceCount);

            return successCount === sequenceCount;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that the lastVibrationTime is updated only on successful vibrations.
     * Failed vibration attempts should not update the cooldown timer.
     */
    it('should not update lastVibrationTime on blocked vibration attempts', () => {
      fc.assert(
        fc.property(
          // Generate number of blocked attempts (1 to 10)
          fc.integer({ min: 1, max: 10 }),
          (blockedAttempts: number) => {
            // Reset service state
            service._resetLastVibrationTime();
            mockVibrate.calls.reset();

            // First vibration succeeds
            service.vibrate(200);
            const firstVibrationTime = service.getLastVibrationTime();
            expect(firstVibrationTime).not.toBeNull();

            // Make multiple blocked attempts
            for (let i = 0; i < blockedAttempts; i++) {
              service.vibrate(200);
            }

            // lastVibrationTime should not have changed
            const currentVibrationTime = service.getLastVibrationTime();
            expect(currentVibrationTime).toBe(firstVibrationTime);

            return currentVibrationTime === firstVibrationTime;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that cooldown is deterministic - same elapsed time always produces same result.
     */
    it('should be deterministic - same elapsed time always produces same cooldown status', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: VIBRATION_COOLDOWN * 2 }),
          (elapsedTime: number) => {
            // Test multiple times with the same elapsed time
            const results: boolean[] = [];

            for (let i = 0; i < 3; i++) {
              service._resetLastVibrationTime();
              const lastVibrationTime = Date.now() - elapsedTime;
              service._setLastVibrationTime(lastVibrationTime);
              results.push(service.isInCooldown());
            }

            // All results should be the same
            expect(results[0]).toBe(results[1]);
            expect(results[1]).toBe(results[2]);

            return results[0] === results[1] && results[1] === results[2];
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that the cooldown constant is exactly 5000ms (5 seconds).
     * This validates that the implementation uses the correct cooldown value.
     */
    it('should use exactly 5000ms (5 seconds) as the cooldown period', () => {
      expect(VIBRATION_COOLDOWN).toBe(5000);
    });
  });
});

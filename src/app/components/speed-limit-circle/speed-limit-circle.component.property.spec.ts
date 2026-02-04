import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as fc from 'fast-check';
import { SpeedLimitCircleComponent, SPEED_LIMIT_THRESHOLDS } from './speed-limit-circle.component';

/**
 * Property-based tests for SpeedLimitCircleComponent
 * Feature: ux-redesign
 * 
 * These tests verify universal properties of the SpeedLimitCircleComponent across
 * randomly generated inputs using fast-check library.
 * 
 * **Validates: Requirements 3.1, 3.3**
 */
describe('SpeedLimitCircleComponent Property Tests', () => {
  let component: SpeedLimitCircleComponent;
  let fixture: ComponentFixture<SpeedLimitCircleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpeedLimitCircleComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SpeedLimitCircleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /**
   * Property 5: Speed Limit Circle Visibility
   * 
   * For any distance value, the speed limit circle should be visible if and only if
   * distance ≤ 4 (the Distance_Threshold).
   * 
   * **Validates: Requirement 3.1**
   */
  describe('Feature: ux-redesign, Property 5: Speed Limit Circle Visibility', () => {
    /**
     * Test that the speed limit circle is visible when distance is within threshold.
     * Validates: Requirement 3.1 - WHEN the distance to a camera is within the Distance_Threshold,
     * THE Speed_Limit_Circle SHALL be prominently displayed
     */
    it('should be visible when distance ≤ 4km (within threshold)', () => {
      fc.assert(
        fc.property(
          // Generate distances from 0 to 4 (within threshold)
          fc.double({ min: 0, max: SPEED_LIMIT_THRESHOLDS.VISIBILITY_THRESHOLD, noNaN: true }),
          (distance: number) => {
            component.distance = distance;
            component.speedLimit = 90;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.speed-limit-container');
            const isVisible = container.classList.contains('visible');
            
            expect(isVisible).toBe(true);
            return isVisible === true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that the speed limit circle is NOT visible when distance is outside threshold.
     * Validates: Requirement 3.1 - Circle should only be visible within threshold
     */
    it('should NOT be visible when distance > 4km (outside threshold)', () => {
      fc.assert(
        fc.property(
          // Generate distances greater than 4 (outside threshold)
          fc.double({ min: 4.001, max: 100, noNaN: true }),
          (distance: number) => {
            component.distance = distance;
            component.speedLimit = 90;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.speed-limit-container');
            const isVisible = container.classList.contains('visible');
            
            expect(isVisible).toBe(false);
            return isVisible === false;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Core property test: For any distance value, visibility should match the threshold condition.
     * This is the main property test that verifies the visibility logic across all distances.
     */
    it('should be visible if and only if distance ≤ 4km for any distance value', () => {
      fc.assert(
        fc.property(
          // Generate any positive distance value
          fc.double({ min: 0, max: 100, noNaN: true }),
          (distance: number) => {
            component.distance = distance;
            component.speedLimit = 90;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.speed-limit-container');
            const isVisible = container.classList.contains('visible');
            const expectedVisible = distance <= SPEED_LIMIT_THRESHOLDS.VISIBILITY_THRESHOLD;
            
            expect(isVisible).toBe(expectedVisible);
            return isVisible === expectedVisible;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test visibility at the exact boundary (4km).
     * Validates: Requirement 3.1 - Circle should be visible at exactly the threshold
     */
    it('should be visible at exactly the threshold boundary (4km)', () => {
      fc.assert(
        fc.property(
          // Generate values very close to the boundary
          fc.constantFrom(4, 4.0, 3.999, 3.9999),
          (distance: number) => {
            component.distance = distance;
            component.speedLimit = 90;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.speed-limit-container');
            const isVisible = container.classList.contains('visible');
            const expectedVisible = distance <= SPEED_LIMIT_THRESHOLDS.VISIBILITY_THRESHOLD;
            
            expect(isVisible).toBe(expectedVisible);
            return isVisible === expectedVisible;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that visibility is deterministic - same distance always produces same visibility.
     */
    it('should be deterministic - same distance always produces same visibility', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 100, noNaN: true }),
          (distance: number) => {
            // Set distance multiple times and verify consistency
            component.distance = distance;
            component.speedLimit = 90;
            fixture.detectChanges();
            const visible1 = fixture.nativeElement.querySelector('.speed-limit-container').classList.contains('visible');

            component.distance = distance;
            fixture.detectChanges();
            const visible2 = fixture.nativeElement.querySelector('.speed-limit-container').classList.contains('visible');

            component.distance = distance;
            fixture.detectChanges();
            const visible3 = fixture.nativeElement.querySelector('.speed-limit-container').classList.contains('visible');

            expect(visible1).toBe(visible2);
            expect(visible2).toBe(visible3);
            
            return visible1 === visible2 && visible2 === visible3;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that visibility changes correctly as distance changes.
     * Simulates approaching and moving away from a camera.
     */
    it('should correctly update visibility as distance changes', () => {
      fc.assert(
        fc.property(
          // Generate a sequence of distance values
          fc.array(fc.double({ min: 0, max: 100, noNaN: true }), { minLength: 1, maxLength: 10 }),
          (distanceSequence: number[]) => {
            for (const distance of distanceSequence) {
              component.distance = distance;
              component.speedLimit = 90;
              fixture.detectChanges();

              const container = fixture.nativeElement.querySelector('.speed-limit-container');
              const isVisible = container.classList.contains('visible');
              const expectedVisible = distance <= SPEED_LIMIT_THRESHOLDS.VISIBILITY_THRESHOLD;
              
              expect(isVisible).toBe(expectedVisible);
              if (isVisible !== expectedVisible) {
                return false;
              }
            }
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that visibility is independent of speed limit value.
     * The speed limit value should not affect visibility.
     */
    it('should have visibility independent of speed limit value', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 100, noNaN: true }),
          fc.integer({ min: 10, max: 200 }),
          (distance: number, speedLimit: number) => {
            component.distance = distance;
            component.speedLimit = speedLimit;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.speed-limit-container');
            const isVisible = container.classList.contains('visible');
            const expectedVisible = distance <= SPEED_LIMIT_THRESHOLDS.VISIBILITY_THRESHOLD;
            
            expect(isVisible).toBe(expectedVisible);
            return isVisible === expectedVisible;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 6: Speed Limit Circle Prominence
   * 
   * For any distance value where the speed limit circle is visible, the circle should be
   * in "prominent" mode if and only if distance < 1.
   * 
   * **Validates: Requirement 3.3**
   */
  describe('Feature: ux-redesign, Property 6: Speed Limit Circle Prominence', () => {
    /**
     * Test that the speed limit circle is prominent when distance < 1km.
     * Validates: Requirement 3.3 - WHEN the distance decreases below 1km,
     * THE Speed_Limit_Circle SHALL increase in visual prominence
     */
    it('should be prominent when distance < 1km', () => {
      fc.assert(
        fc.property(
          // Generate distances from 0 to just under 1 (prominent zone)
          fc.double({ min: 0, max: 0.999, noNaN: true }),
          (distance: number) => {
            component.distance = distance;
            component.speedLimit = 90;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.speed-limit-container');
            const isProminent = container.classList.contains('prominent');
            
            expect(isProminent).toBe(true);
            return isProminent === true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that the speed limit circle is NOT prominent when distance ≥ 1km.
     * Validates: Requirement 3.3 - Prominence only applies when distance < 1km
     */
    it('should NOT be prominent when distance ≥ 1km (but still visible)', () => {
      fc.assert(
        fc.property(
          // Generate distances from 1 to 4 (visible but not prominent)
          fc.double({ min: 1, max: SPEED_LIMIT_THRESHOLDS.VISIBILITY_THRESHOLD, noNaN: true }),
          (distance: number) => {
            component.distance = distance;
            component.speedLimit = 90;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.speed-limit-container');
            const isProminent = container.classList.contains('prominent');
            
            expect(isProminent).toBe(false);
            return isProminent === false;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Core property test: For any distance value where circle is visible,
     * prominence should match the threshold condition (distance < 1).
     */
    it('should be prominent if and only if distance < 1km when visible', () => {
      fc.assert(
        fc.property(
          // Generate distances within visibility threshold
          fc.double({ min: 0, max: SPEED_LIMIT_THRESHOLDS.VISIBILITY_THRESHOLD, noNaN: true }),
          (distance: number) => {
            component.distance = distance;
            component.speedLimit = 90;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.speed-limit-container');
            const isProminent = container.classList.contains('prominent');
            const expectedProminent = distance < SPEED_LIMIT_THRESHOLDS.PROMINENCE_THRESHOLD;
            
            expect(isProminent).toBe(expectedProminent);
            return isProminent === expectedProminent;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test prominence at the exact boundary (1km).
     * Validates: Requirement 3.3 - At exactly 1km, should NOT be prominent
     */
    it('should NOT be prominent at exactly the prominence boundary (1km)', () => {
      fc.assert(
        fc.property(
          // Generate values at or just above the boundary
          fc.constantFrom(1, 1.0, 1.001, 1.01),
          (distance: number) => {
            component.distance = distance;
            component.speedLimit = 90;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.speed-limit-container');
            const isProminent = container.classList.contains('prominent');
            const expectedProminent = distance < SPEED_LIMIT_THRESHOLDS.PROMINENCE_THRESHOLD;
            
            expect(isProminent).toBe(expectedProminent);
            return isProminent === expectedProminent;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that prominence is NOT applied when circle is not visible.
     * Even if distance < 1km, if visibility is overridden to false, prominence should be false.
     */
    it('should NOT be prominent when circle is not visible (even if distance < 1km)', () => {
      fc.assert(
        fc.property(
          // Generate distances that would normally be prominent
          fc.double({ min: 0, max: 0.999, noNaN: true }),
          (distance: number) => {
            component.distance = distance;
            component.speedLimit = 90;
            component.isVisibleInput = false; // Override visibility
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.speed-limit-container');
            const isProminent = container.classList.contains('prominent');
            
            expect(isProminent).toBe(false);
            return isProminent === false;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that prominence is deterministic - same distance always produces same prominence.
     */
    it('should be deterministic - same distance always produces same prominence', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: SPEED_LIMIT_THRESHOLDS.VISIBILITY_THRESHOLD, noNaN: true }),
          (distance: number) => {
            // Set distance multiple times and verify consistency
            component.distance = distance;
            component.speedLimit = 90;
            fixture.detectChanges();
            const prominent1 = fixture.nativeElement.querySelector('.speed-limit-container').classList.contains('prominent');

            component.distance = distance;
            fixture.detectChanges();
            const prominent2 = fixture.nativeElement.querySelector('.speed-limit-container').classList.contains('prominent');

            component.distance = distance;
            fixture.detectChanges();
            const prominent3 = fixture.nativeElement.querySelector('.speed-limit-container').classList.contains('prominent');

            expect(prominent1).toBe(prominent2);
            expect(prominent2).toBe(prominent3);
            
            return prominent1 === prominent2 && prominent2 === prominent3;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that prominence changes correctly as distance changes.
     * Simulates approaching a camera and entering the prominence zone.
     */
    it('should correctly update prominence as distance changes', () => {
      fc.assert(
        fc.property(
          // Generate a sequence of distance values within visibility threshold
          fc.array(fc.double({ min: 0, max: SPEED_LIMIT_THRESHOLDS.VISIBILITY_THRESHOLD, noNaN: true }), { minLength: 1, maxLength: 10 }),
          (distanceSequence: number[]) => {
            for (const distance of distanceSequence) {
              component.distance = distance;
              component.speedLimit = 90;
              fixture.detectChanges();

              const container = fixture.nativeElement.querySelector('.speed-limit-container');
              const isProminent = container.classList.contains('prominent');
              const expectedProminent = distance < SPEED_LIMIT_THRESHOLDS.PROMINENCE_THRESHOLD;
              
              expect(isProminent).toBe(expectedProminent);
              if (isProminent !== expectedProminent) {
                return false;
              }
            }
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that prominence is independent of speed limit value.
     * The speed limit value should not affect prominence.
     */
    it('should have prominence independent of speed limit value', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: SPEED_LIMIT_THRESHOLDS.VISIBILITY_THRESHOLD, noNaN: true }),
          fc.integer({ min: 10, max: 200 }),
          (distance: number, speedLimit: number) => {
            component.distance = distance;
            component.speedLimit = speedLimit;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.speed-limit-container');
            const isProminent = container.classList.contains('prominent');
            const expectedProminent = distance < SPEED_LIMIT_THRESHOLDS.PROMINENCE_THRESHOLD;
            
            expect(isProminent).toBe(expectedProminent);
            return isProminent === expectedProminent;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Combined property tests for visibility and prominence.
   * These tests verify that both properties work correctly together.
   */
  describe('Feature: ux-redesign, Combined Visibility and Prominence Properties', () => {
    /**
     * Test the relationship between visibility and prominence for any distance.
     * Prominence can only be true when visibility is true.
     */
    it('should never be prominent when not visible', () => {
      fc.assert(
        fc.property(
          // Generate any positive distance value
          fc.double({ min: 0, max: 100, noNaN: true }),
          (distance: number) => {
            component.distance = distance;
            component.speedLimit = 90;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.speed-limit-container');
            const isVisible = container.classList.contains('visible');
            const isProminent = container.classList.contains('prominent');
            
            // If not visible, should never be prominent
            if (!isVisible) {
              expect(isProminent).toBe(false);
              return isProminent === false;
            }
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test all distance zones: outside threshold, inside threshold but not prominent, prominent.
     */
    it('should correctly categorize distances into visibility and prominence zones', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 100, noNaN: true }),
          (distance: number) => {
            component.distance = distance;
            component.speedLimit = 90;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.speed-limit-container');
            const isVisible = container.classList.contains('visible');
            const isProminent = container.classList.contains('prominent');
            
            // Zone 1: Outside threshold (distance > 4)
            if (distance > SPEED_LIMIT_THRESHOLDS.VISIBILITY_THRESHOLD) {
              expect(isVisible).toBe(false);
              expect(isProminent).toBe(false);
              return !isVisible && !isProminent;
            }
            
            // Zone 2: Inside threshold but not prominent (1 ≤ distance ≤ 4)
            if (distance >= SPEED_LIMIT_THRESHOLDS.PROMINENCE_THRESHOLD) {
              expect(isVisible).toBe(true);
              expect(isProminent).toBe(false);
              return isVisible && !isProminent;
            }
            
            // Zone 3: Prominent (distance < 1)
            expect(isVisible).toBe(true);
            expect(isProminent).toBe(true);
            return isVisible && isProminent;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that the component correctly handles the transition through all zones.
     * Simulates a driver approaching a camera from far away.
     */
    it('should correctly handle transitions through all distance zones', () => {
      fc.assert(
        fc.property(
          // Generate decreasing distance sequences (approaching camera)
          fc.array(fc.double({ min: 0, max: 10, noNaN: true }), { minLength: 2, maxLength: 10 })
            .map(arr => arr.sort((a, b) => b - a)), // Sort descending (approaching)
          (distanceSequence: number[]) => {
            for (const distance of distanceSequence) {
              component.distance = distance;
              component.speedLimit = 90;
              fixture.detectChanges();

              const container = fixture.nativeElement.querySelector('.speed-limit-container');
              const isVisible = container.classList.contains('visible');
              const isProminent = container.classList.contains('prominent');
              
              const expectedVisible = distance <= SPEED_LIMIT_THRESHOLDS.VISIBILITY_THRESHOLD;
              const expectedProminent = expectedVisible && distance < SPEED_LIMIT_THRESHOLDS.PROMINENCE_THRESHOLD;
              
              expect(isVisible).toBe(expectedVisible);
              expect(isProminent).toBe(expectedProminent);
              
              if (isVisible !== expectedVisible || isProminent !== expectedProminent) {
                return false;
              }
            }
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that aria-hidden attribute is correctly set based on visibility.
     */
    it('should have aria-hidden correctly reflect visibility state', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 100, noNaN: true }),
          (distance: number) => {
            component.distance = distance;
            component.speedLimit = 90;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.speed-limit-container');
            const isVisible = container.classList.contains('visible');
            const ariaHidden = container.getAttribute('aria-hidden');
            
            // aria-hidden should be 'true' when not visible, 'false' when visible
            const expectedAriaHidden = isVisible ? 'false' : 'true';
            
            expect(ariaHidden).toBe(expectedAriaHidden);
            return ariaHidden === expectedAriaHidden;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that aria-label content reflects prominence state when visible.
     */
    it('should have aria-label reflect proximity when visible', () => {
      fc.assert(
        fc.property(
          // Generate distances within visibility threshold
          fc.double({ min: 0, max: SPEED_LIMIT_THRESHOLDS.VISIBILITY_THRESHOLD, noNaN: true }),
          fc.integer({ min: 10, max: 200 }),
          (distance: number, speedLimit: number) => {
            component.distance = distance;
            component.speedLimit = speedLimit;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.speed-limit-container');
            const ariaLabel = container.getAttribute('aria-label');
            const isProminent = distance < SPEED_LIMIT_THRESHOLDS.PROMINENCE_THRESHOLD;
            
            // Check that aria-label contains appropriate proximity text
            if (isProminent) {
              expect(ariaLabel).toContain('Very close to camera');
            } else {
              expect(ariaLabel).toContain('Approaching camera');
            }
            
            // Check that aria-label contains speed limit
            expect(ariaLabel).toContain(`Speed limit ${speedLimit} km/h`);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

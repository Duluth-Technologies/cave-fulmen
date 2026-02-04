import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as fc from 'fast-check';
import { DirectionalArrowComponent, ARROW_THRESHOLDS } from './directional-arrow.component';

/**
 * Property-based tests for DirectionalArrowComponent
 * Feature: ux-redesign
 * 
 * These tests verify universal properties of the DirectionalArrowComponent across
 * randomly generated inputs using fast-check library.
 * 
 * **Validates: Requirements 8.3, 8.4, 9.1, 9.3**
 */
describe('DirectionalArrowComponent Property Tests', () => {
  let component: DirectionalArrowComponent;
  let fixture: ComponentFixture<DirectionalArrowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectionalArrowComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DirectionalArrowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /**
   * Property 10: Arrow Visibility Based on Speed
   * 
   * For any speed value in km/h, the directional arrow should be visible if and only if
   * speed > 10.
   * 
   * **Validates: Requirements 8.3, 8.4**
   */
  describe('Feature: ux-redesign, Property 10: Arrow Visibility Based on Speed', () => {
    /**
     * Test that the arrow is visible when speed > 10 km/h.
     * Validates: Requirement 8.4 - WHEN speed exceeds 10 km/h, THE Directional_Arrow SHALL become visible
     */
    it('should be visible when speed > 10 km/h', () => {
      fc.assert(
        fc.property(
          // Generate speeds greater than 10 (visible zone)
          fc.double({ min: 10.001, max: 300, noNaN: true }),
          (speed: number) => {
            component.speed = speed;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.arrow-container');
            const isVisible = container.classList.contains('visible');
            
            expect(isVisible).toBe(true);
            return isVisible === true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that the arrow is NOT visible when speed ≤ 10 km/h.
     * Validates: Requirement 8.3 - WHEN speed is 10 km/h or below, THE Directional_Arrow SHALL remain hidden
     */
    it('should NOT be visible when speed ≤ 10 km/h', () => {
      fc.assert(
        fc.property(
          // Generate speeds from 0 to 10 (hidden zone)
          fc.double({ min: 0, max: ARROW_THRESHOLDS.SPEED_VISIBILITY_THRESHOLD, noNaN: true }),
          (speed: number) => {
            component.speed = speed;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.arrow-container');
            const isVisible = container.classList.contains('visible');
            
            expect(isVisible).toBe(false);
            return isVisible === false;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Core property test: For any speed value, visibility should match the threshold condition.
     * This is the main property test that verifies the visibility logic across all speeds.
     */
    it('should be visible if and only if speed > 10 km/h for any speed value', () => {
      fc.assert(
        fc.property(
          // Generate any positive speed value
          fc.double({ min: 0, max: 300, noNaN: true }),
          (speed: number) => {
            component.speed = speed;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.arrow-container');
            const isVisible = container.classList.contains('visible');
            const expectedVisible = speed > ARROW_THRESHOLDS.SPEED_VISIBILITY_THRESHOLD;
            
            expect(isVisible).toBe(expectedVisible);
            return isVisible === expectedVisible;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test visibility at the exact boundary (10 km/h).
     * Validates: Requirement 8.3 - At exactly 10 km/h, should NOT be visible
     */
    it('should NOT be visible at exactly the threshold boundary (10 km/h)', () => {
      fc.assert(
        fc.property(
          // Generate values at or just below the boundary
          fc.constantFrom(10, 10.0, 9.999, 9.99),
          (speed: number) => {
            component.speed = speed;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.arrow-container');
            const isVisible = container.classList.contains('visible');
            const expectedVisible = speed > ARROW_THRESHOLDS.SPEED_VISIBILITY_THRESHOLD;
            
            expect(isVisible).toBe(expectedVisible);
            return isVisible === expectedVisible;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that visibility is deterministic - same speed always produces same visibility.
     */
    it('should be deterministic - same speed always produces same visibility', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 300, noNaN: true }),
          (speed: number) => {
            // Set speed multiple times and verify consistency
            component.speed = speed;
            fixture.detectChanges();
            const visible1 = fixture.nativeElement.querySelector('.arrow-container').classList.contains('visible');

            component.speed = speed;
            fixture.detectChanges();
            const visible2 = fixture.nativeElement.querySelector('.arrow-container').classList.contains('visible');

            component.speed = speed;
            fixture.detectChanges();
            const visible3 = fixture.nativeElement.querySelector('.arrow-container').classList.contains('visible');

            expect(visible1).toBe(visible2);
            expect(visible2).toBe(visible3);
            
            return visible1 === visible2 && visible2 === visible3;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that visibility changes correctly as speed changes.
     * Simulates accelerating and decelerating.
     */
    it('should correctly update visibility as speed changes', () => {
      fc.assert(
        fc.property(
          // Generate a sequence of speed values
          fc.array(fc.double({ min: 0, max: 300, noNaN: true }), { minLength: 1, maxLength: 10 }),
          (speedSequence: number[]) => {
            for (const speed of speedSequence) {
              component.speed = speed;
              fixture.detectChanges();

              const container = fixture.nativeElement.querySelector('.arrow-container');
              const isVisible = container.classList.contains('visible');
              const expectedVisible = speed > ARROW_THRESHOLDS.SPEED_VISIBILITY_THRESHOLD;
              
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
     * Test that visibility is independent of distance value.
     * The distance value should not affect visibility (only speed matters).
     */
    it('should have visibility independent of distance value', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 300, noNaN: true }),
          fc.double({ min: 0, max: 100, noNaN: true }),
          (speed: number, distance: number) => {
            component.speed = speed;
            component.distance = distance;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.arrow-container');
            const isVisible = container.classList.contains('visible');
            const expectedVisible = speed > ARROW_THRESHOLDS.SPEED_VISIBILITY_THRESHOLD;
            
            expect(isVisible).toBe(expectedVisible);
            return isVisible === expectedVisible;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that visibility is independent of angle value.
     * The angle value should not affect visibility.
     */
    it('should have visibility independent of angle value', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 300, noNaN: true }),
          fc.double({ min: -360, max: 720, noNaN: true }),
          (speed: number, angle: number) => {
            component.speed = speed;
            component.angle = angle;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.arrow-container');
            const isVisible = container.classList.contains('visible');
            const expectedVisible = speed > ARROW_THRESHOLDS.SPEED_VISIBILITY_THRESHOLD;
            
            expect(isVisible).toBe(expectedVisible);
            return isVisible === expectedVisible;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that null speed results in hidden arrow.
     * Validates: Requirement 8.3 - Arrow should be hidden when no speed data
     */
    it('should NOT be visible when speed is null', () => {
      component.speed = null;
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.arrow-container');
      const isVisible = container.classList.contains('visible');
      
      expect(isVisible).toBe(false);
    });
  });

  /**
   * Property 11: Arrow Pulsing Based on Distance and Speed
   * 
   * For any combination of distance (km) and speed (km/h), the arrow should be pulsing
   * if and only if (distance < 1 AND speed > 10).
   * 
   * **Validates: Requirements 9.1, 9.3**
   */
  describe('Feature: ux-redesign, Property 11: Arrow Pulsing Based on Distance and Speed', () => {
    /**
     * Test that the arrow pulses when distance < 1km AND speed > 10 km/h.
     * Validates: Requirement 9.1 - WHEN the distance to a camera is less than 1km and speed exceeds 10 km/h,
     * THE Directional_Arrow SHALL display a pulsing animation
     */
    it('should pulse when distance < 1km AND speed > 10 km/h', () => {
      fc.assert(
        fc.property(
          // Generate distances less than 1 (pulsing zone)
          fc.double({ min: 0, max: 0.999, noNaN: true }),
          // Generate speeds greater than 10 (visible zone)
          fc.double({ min: 10.001, max: 300, noNaN: true }),
          (distance: number, speed: number) => {
            component.distance = distance;
            component.speed = speed;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.arrow-container');
            const isPulsing = container.classList.contains('pulsing');
            
            expect(isPulsing).toBe(true);
            return isPulsing === true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that the arrow does NOT pulse when distance ≥ 1km (even if speed > 10).
     * Validates: Requirement 9.3 - WHEN the distance exceeds 1km, THE Directional_Arrow SHALL stop pulsing
     */
    it('should NOT pulse when distance ≥ 1km (even if speed > 10 km/h)', () => {
      fc.assert(
        fc.property(
          // Generate distances >= 1 (non-pulsing zone)
          fc.double({ min: 1, max: 100, noNaN: true }),
          // Generate speeds greater than 10 (visible zone)
          fc.double({ min: 10.001, max: 300, noNaN: true }),
          (distance: number, speed: number) => {
            component.distance = distance;
            component.speed = speed;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.arrow-container');
            const isPulsing = container.classList.contains('pulsing');
            
            expect(isPulsing).toBe(false);
            return isPulsing === false;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that the arrow does NOT pulse when speed ≤ 10 km/h (even if distance < 1km).
     * Validates: Requirement 9.1 - Pulsing requires BOTH conditions to be met
     */
    it('should NOT pulse when speed ≤ 10 km/h (even if distance < 1km)', () => {
      fc.assert(
        fc.property(
          // Generate distances less than 1 (would pulse if visible)
          fc.double({ min: 0, max: 0.999, noNaN: true }),
          // Generate speeds <= 10 (hidden zone)
          fc.double({ min: 0, max: ARROW_THRESHOLDS.SPEED_VISIBILITY_THRESHOLD, noNaN: true }),
          (distance: number, speed: number) => {
            component.distance = distance;
            component.speed = speed;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.arrow-container');
            const isPulsing = container.classList.contains('pulsing');
            
            expect(isPulsing).toBe(false);
            return isPulsing === false;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Core property test: For any combination of distance and speed, pulsing should match
     * the combined condition (distance < 1 AND speed > 10).
     */
    it('should pulse if and only if (distance < 1km AND speed > 10 km/h) for any combination', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 100, noNaN: true }),
          fc.double({ min: 0, max: 300, noNaN: true }),
          (distance: number, speed: number) => {
            component.distance = distance;
            component.speed = speed;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.arrow-container');
            const isPulsing = container.classList.contains('pulsing');
            const expectedPulsing = distance < ARROW_THRESHOLDS.PULSING_DISTANCE_THRESHOLD && 
                                    speed > ARROW_THRESHOLDS.SPEED_VISIBILITY_THRESHOLD;
            
            expect(isPulsing).toBe(expectedPulsing);
            return isPulsing === expectedPulsing;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test pulsing at the exact distance boundary (1km).
     * Validates: Requirement 9.3 - At exactly 1km, should NOT be pulsing
     */
    it('should NOT pulse at exactly the distance boundary (1km) even with high speed', () => {
      fc.assert(
        fc.property(
          // Generate values at or just above the boundary
          fc.constantFrom(1, 1.0, 1.001, 1.01),
          // Generate speeds greater than 10 (visible zone)
          fc.double({ min: 10.001, max: 300, noNaN: true }),
          (distance: number, speed: number) => {
            component.distance = distance;
            component.speed = speed;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.arrow-container');
            const isPulsing = container.classList.contains('pulsing');
            const expectedPulsing = distance < ARROW_THRESHOLDS.PULSING_DISTANCE_THRESHOLD && 
                                    speed > ARROW_THRESHOLDS.SPEED_VISIBILITY_THRESHOLD;
            
            expect(isPulsing).toBe(expectedPulsing);
            return isPulsing === expectedPulsing;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test pulsing at the exact speed boundary (10 km/h).
     * Validates: Requirement 9.1 - At exactly 10 km/h, should NOT be pulsing
     */
    it('should NOT pulse at exactly the speed boundary (10 km/h) even with close distance', () => {
      fc.assert(
        fc.property(
          // Generate distances less than 1 (would pulse if visible)
          fc.double({ min: 0, max: 0.999, noNaN: true }),
          // Generate values at or just below the speed boundary
          fc.constantFrom(10, 10.0, 9.999, 9.99),
          (distance: number, speed: number) => {
            component.distance = distance;
            component.speed = speed;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.arrow-container');
            const isPulsing = container.classList.contains('pulsing');
            const expectedPulsing = distance < ARROW_THRESHOLDS.PULSING_DISTANCE_THRESHOLD && 
                                    speed > ARROW_THRESHOLDS.SPEED_VISIBILITY_THRESHOLD;
            
            expect(isPulsing).toBe(expectedPulsing);
            return isPulsing === expectedPulsing;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that pulsing is deterministic - same inputs always produce same pulsing state.
     */
    it('should be deterministic - same inputs always produce same pulsing state', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 100, noNaN: true }),
          fc.double({ min: 0, max: 300, noNaN: true }),
          (distance: number, speed: number) => {
            // Set inputs multiple times and verify consistency
            component.distance = distance;
            component.speed = speed;
            fixture.detectChanges();
            const pulsing1 = fixture.nativeElement.querySelector('.arrow-container').classList.contains('pulsing');

            component.distance = distance;
            component.speed = speed;
            fixture.detectChanges();
            const pulsing2 = fixture.nativeElement.querySelector('.arrow-container').classList.contains('pulsing');

            component.distance = distance;
            component.speed = speed;
            fixture.detectChanges();
            const pulsing3 = fixture.nativeElement.querySelector('.arrow-container').classList.contains('pulsing');

            expect(pulsing1).toBe(pulsing2);
            expect(pulsing2).toBe(pulsing3);
            
            return pulsing1 === pulsing2 && pulsing2 === pulsing3;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that pulsing changes correctly as distance and speed change.
     * Simulates approaching a camera while driving.
     */
    it('should correctly update pulsing as distance and speed change', () => {
      fc.assert(
        fc.property(
          // Generate a sequence of (distance, speed) pairs
          fc.array(
            fc.tuple(
              fc.double({ min: 0, max: 10, noNaN: true }),
              fc.double({ min: 0, max: 150, noNaN: true })
            ),
            { minLength: 1, maxLength: 10 }
          ),
          (inputSequence: [number, number][]) => {
            for (const [distance, speed] of inputSequence) {
              component.distance = distance;
              component.speed = speed;
              fixture.detectChanges();

              const container = fixture.nativeElement.querySelector('.arrow-container');
              const isPulsing = container.classList.contains('pulsing');
              const expectedPulsing = distance < ARROW_THRESHOLDS.PULSING_DISTANCE_THRESHOLD && 
                                      speed > ARROW_THRESHOLDS.SPEED_VISIBILITY_THRESHOLD;
              
              expect(isPulsing).toBe(expectedPulsing);
              if (isPulsing !== expectedPulsing) {
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
     * Test that pulsing is independent of angle value.
     * The angle value should not affect pulsing.
     */
    it('should have pulsing independent of angle value', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 100, noNaN: true }),
          fc.double({ min: 0, max: 300, noNaN: true }),
          fc.double({ min: -360, max: 720, noNaN: true }),
          (distance: number, speed: number, angle: number) => {
            component.distance = distance;
            component.speed = speed;
            component.angle = angle;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.arrow-container');
            const isPulsing = container.classList.contains('pulsing');
            const expectedPulsing = distance < ARROW_THRESHOLDS.PULSING_DISTANCE_THRESHOLD && 
                                    speed > ARROW_THRESHOLDS.SPEED_VISIBILITY_THRESHOLD;
            
            expect(isPulsing).toBe(expectedPulsing);
            return isPulsing === expectedPulsing;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Combined property tests for visibility and pulsing.
   * These tests verify that both properties work correctly together.
   */
  describe('Feature: ux-redesign, Combined Visibility and Pulsing Properties', () => {
    /**
     * Test the relationship between visibility and pulsing for any inputs.
     * Pulsing can only be true when visibility is true.
     */
    it('should never be pulsing when not visible', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 100, noNaN: true }),
          fc.double({ min: 0, max: 300, noNaN: true }),
          (distance: number, speed: number) => {
            component.distance = distance;
            component.speed = speed;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.arrow-container');
            const isVisible = container.classList.contains('visible');
            const isPulsing = container.classList.contains('pulsing');
            
            // If not visible, should never be pulsing
            if (!isVisible) {
              expect(isPulsing).toBe(false);
              return isPulsing === false;
            }
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test all state combinations: hidden, visible but not pulsing, visible and pulsing.
     */
    it('should correctly categorize inputs into visibility and pulsing states', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 100, noNaN: true }),
          fc.double({ min: 0, max: 300, noNaN: true }),
          (distance: number, speed: number) => {
            component.distance = distance;
            component.speed = speed;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.arrow-container');
            const isVisible = container.classList.contains('visible');
            const isPulsing = container.classList.contains('pulsing');
            
            // State 1: Hidden (speed ≤ 10)
            if (speed <= ARROW_THRESHOLDS.SPEED_VISIBILITY_THRESHOLD) {
              expect(isVisible).toBe(false);
              expect(isPulsing).toBe(false);
              return !isVisible && !isPulsing;
            }
            
            // State 2: Visible but not pulsing (speed > 10 AND distance ≥ 1)
            if (distance >= ARROW_THRESHOLDS.PULSING_DISTANCE_THRESHOLD) {
              expect(isVisible).toBe(true);
              expect(isPulsing).toBe(false);
              return isVisible && !isPulsing;
            }
            
            // State 3: Visible and pulsing (speed > 10 AND distance < 1)
            expect(isVisible).toBe(true);
            expect(isPulsing).toBe(true);
            return isVisible && isPulsing;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that the component correctly handles the transition through all states.
     * Simulates a driver approaching a camera while accelerating.
     */
    it('should correctly handle transitions through all states', () => {
      fc.assert(
        fc.property(
          // Generate sequences of (distance, speed) pairs
          fc.array(
            fc.tuple(
              fc.double({ min: 0, max: 10, noNaN: true }),
              fc.double({ min: 0, max: 150, noNaN: true })
            ),
            { minLength: 2, maxLength: 10 }
          ),
          (inputSequence: [number, number][]) => {
            for (const [distance, speed] of inputSequence) {
              component.distance = distance;
              component.speed = speed;
              fixture.detectChanges();

              const container = fixture.nativeElement.querySelector('.arrow-container');
              const isVisible = container.classList.contains('visible');
              const isPulsing = container.classList.contains('pulsing');
              
              const expectedVisible = speed > ARROW_THRESHOLDS.SPEED_VISIBILITY_THRESHOLD;
              const expectedPulsing = expectedVisible && distance < ARROW_THRESHOLDS.PULSING_DISTANCE_THRESHOLD;
              
              expect(isVisible).toBe(expectedVisible);
              expect(isPulsing).toBe(expectedPulsing);
              
              if (isVisible !== expectedVisible || isPulsing !== expectedPulsing) {
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
     * Test that aria-hidden attribute is correctly set based on visibility state.
     */
    it('should have aria-hidden correctly reflect visibility state', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 100, noNaN: true }),
          fc.double({ min: 0, max: 300, noNaN: true }),
          (distance: number, speed: number) => {
            component.distance = distance;
            component.speed = speed;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.arrow-container');
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
     * Test that aria-label content reflects pulsing state when visible.
     */
    it('should have aria-label reflect proximity when visible and pulsing', () => {
      fc.assert(
        fc.property(
          // Generate distances less than 1 (pulsing zone)
          fc.double({ min: 0, max: 0.999, noNaN: true }),
          // Generate speeds greater than 10 (visible zone)
          fc.double({ min: 10.001, max: 300, noNaN: true }),
          (distance: number, speed: number) => {
            component.distance = distance;
            component.speed = speed;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.arrow-container');
            const ariaLabel = container.getAttribute('aria-label');
            
            // Check that aria-label contains proximity text when pulsing
            expect(ariaLabel).toContain('very close');
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

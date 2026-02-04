import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as fc from 'fast-check';
import { StatusIndicatorsComponent } from './status-indicators.component';

/**
 * Property-based tests for StatusIndicatorsComponent
 * Feature: ux-redesign
 * 
 * These tests verify universal properties of the StatusIndicatorsComponent across
 * randomly generated inputs using fast-check library.
 * 
 * **Validates: Requirements 6.1, 6.2, 7.1, 7.2, 7.3**
 */
describe('StatusIndicatorsComponent Property Tests', () => {
  let component: StatusIndicatorsComponent;
  let fixture: ComponentFixture<StatusIndicatorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusIndicatorsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(StatusIndicatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /**
   * Property 8: Wake Lock UI State Consistency
   * 
   * For any wake lock service state (active/inactive), the wake lock button UI
   * should reflect the same state.
   * 
   * **Validates: Requirements 6.1, 6.2**
   */
  describe('Feature: ux-redesign, Property 8: Wake Lock UI State Consistency', () => {
    /**
     * Test that the wake lock indicator always reflects the active state correctly.
     * Validates: Requirement 6.1 - WHEN wake lock is successfully activated,
     * THE App SHALL display a visual indicator showing the active state
     */
    it('should display active indicator when wakeLockActive is true', () => {
      fc.assert(
        fc.property(
          // Generate true values (always active)
          fc.constant(true),
          (wakeLockActive: boolean) => {
            component.wakeLockActive = wakeLockActive;
            fixture.detectChanges();

            const wakeLockIndicator = fixture.nativeElement.querySelector('.wake-lock-indicator');
            const ariaLabel = wakeLockIndicator.getAttribute('aria-label');
            
            expect(ariaLabel).toBe('Screen wake lock: Active - screen will stay on');
            return ariaLabel === 'Screen wake lock: Active - screen will stay on';
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that the wake lock indicator always reflects the inactive state correctly.
     * Validates: Requirement 6.2 - WHEN wake lock is not active,
     * THE App SHALL display the button in an inactive/default state
     */
    it('should display inactive indicator when wakeLockActive is false', () => {
      fc.assert(
        fc.property(
          // Generate false values (always inactive)
          fc.constant(false),
          (wakeLockActive: boolean) => {
            component.wakeLockActive = wakeLockActive;
            fixture.detectChanges();

            const wakeLockIndicator = fixture.nativeElement.querySelector('.wake-lock-indicator');
            const ariaLabel = wakeLockIndicator.getAttribute('aria-label');
            
            expect(ariaLabel).toBe('Screen wake lock: Inactive - screen may turn off');
            return ariaLabel === 'Screen wake lock: Inactive - screen may turn off';
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that for any boolean wake lock state, the UI consistently reflects that state.
     * This is the core property test that verifies UI state consistency.
     */
    it('should consistently reflect any wake lock state in the UI', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (wakeLockActive: boolean) => {
            component.wakeLockActive = wakeLockActive;
            fixture.detectChanges();

            const wakeLockIndicator = fixture.nativeElement.querySelector('.wake-lock-indicator');
            const ariaLabel = wakeLockIndicator.getAttribute('aria-label');
            
            const expectedLabel = wakeLockActive
              ? 'Screen wake lock: Active - screen will stay on'
              : 'Screen wake lock: Inactive - screen may turn off';
            
            expect(ariaLabel).toBe(expectedLabel);
            return ariaLabel === expectedLabel;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that wake lock state changes are immediately reflected in the UI.
     * Verifies that toggling the state updates the indicator correctly.
     */
    it('should immediately reflect wake lock state changes in the UI', () => {
      fc.assert(
        fc.property(
          // Generate a sequence of boolean state changes
          fc.array(fc.boolean(), { minLength: 1, maxLength: 10 }),
          (stateSequence: boolean[]) => {
            for (const wakeLockActive of stateSequence) {
              component.wakeLockActive = wakeLockActive;
              fixture.detectChanges();

              const wakeLockIndicator = fixture.nativeElement.querySelector('.wake-lock-indicator');
              const ariaLabel = wakeLockIndicator.getAttribute('aria-label');
              
              const expectedLabel = wakeLockActive
                ? 'Screen wake lock: Active - screen will stay on'
                : 'Screen wake lock: Inactive - screen may turn off';
              
              expect(ariaLabel).toBe(expectedLabel);
              if (ariaLabel !== expectedLabel) {
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
     * Test that the wake lock indicator is deterministic:
     * the same state should always produce the same UI representation.
     */
    it('should be deterministic - same wake lock state always produces same UI', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (wakeLockActive: boolean) => {
            // Set state multiple times and verify consistency
            component.wakeLockActive = wakeLockActive;
            fixture.detectChanges();
            const ariaLabel1 = fixture.nativeElement.querySelector('.wake-lock-indicator').getAttribute('aria-label');

            component.wakeLockActive = wakeLockActive;
            fixture.detectChanges();
            const ariaLabel2 = fixture.nativeElement.querySelector('.wake-lock-indicator').getAttribute('aria-label');

            component.wakeLockActive = wakeLockActive;
            fixture.detectChanges();
            const ariaLabel3 = fixture.nativeElement.querySelector('.wake-lock-indicator').getAttribute('aria-label');

            expect(ariaLabel1).toBe(ariaLabel2);
            expect(ariaLabel2).toBe(ariaLabel3);
            
            return ariaLabel1 === ariaLabel2 && ariaLabel2 === ariaLabel3;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that the wake lock indicator has proper accessibility attributes
     * regardless of the state.
     */
    it('should always have proper accessibility attributes for wake lock indicator', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (wakeLockActive: boolean) => {
            component.wakeLockActive = wakeLockActive;
            fixture.detectChanges();

            const wakeLockIndicator = fixture.nativeElement.querySelector('.wake-lock-indicator');
            
            // Should have role="img" for accessibility
            expect(wakeLockIndicator.getAttribute('role')).toBe('img');
            
            // Should have a non-empty aria-label
            const ariaLabel = wakeLockIndicator.getAttribute('aria-label');
            expect(ariaLabel).toBeTruthy();
            expect(ariaLabel.length).toBeGreaterThan(0);
            
            // SVG should be hidden from screen readers
            const svg = wakeLockIndicator.querySelector('.status-icon');
            expect(svg.getAttribute('aria-hidden')).toBe('true');
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 9: Online Status Indicator Consistency
   * 
   * For any navigator.onLine state, the connection status indicator should
   * display the matching online/offline state.
   * 
   * **Validates: Requirements 7.1, 7.2, 7.3**
   */
  describe('Feature: ux-redesign, Property 9: Online Status Indicator Consistency', () => {
    /**
     * Test that the connection indicator always reflects the online state correctly.
     * Validates: Requirement 7.1 - THE App SHALL display an indicator showing online/offline status
     */
    it('should display online indicator when isOnline is true', () => {
      fc.assert(
        fc.property(
          // Generate true values (always online)
          fc.constant(true),
          (isOnline: boolean) => {
            component.isOnline = isOnline;
            fixture.detectChanges();

            const connectionIndicator = fixture.nativeElement.querySelector('.connection-indicator');
            const ariaLabel = connectionIndicator.getAttribute('aria-label');
            
            expect(ariaLabel).toBe('Network status: Online');
            return ariaLabel === 'Network status: Online';
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that the connection indicator always reflects the offline state correctly.
     * Validates: Requirement 7.2 - WHEN the app goes offline,
     * THE App SHALL indicate that it is operating in offline mode
     */
    it('should display offline indicator when isOnline is false', () => {
      fc.assert(
        fc.property(
          // Generate false values (always offline)
          fc.constant(false),
          (isOnline: boolean) => {
            component.isOnline = isOnline;
            fixture.detectChanges();

            const connectionIndicator = fixture.nativeElement.querySelector('.connection-indicator');
            const ariaLabel = connectionIndicator.getAttribute('aria-label');
            
            expect(ariaLabel).toBe('Network status: Offline');
            return ariaLabel === 'Network status: Offline';
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that for any boolean online state, the UI consistently reflects that state.
     * This is the core property test that verifies UI state consistency.
     * Validates: Requirements 7.1, 7.2, 7.3
     */
    it('should consistently reflect any online state in the UI', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (isOnline: boolean) => {
            component.isOnline = isOnline;
            fixture.detectChanges();

            const connectionIndicator = fixture.nativeElement.querySelector('.connection-indicator');
            const ariaLabel = connectionIndicator.getAttribute('aria-label');
            
            const expectedLabel = isOnline
              ? 'Network status: Online'
              : 'Network status: Offline';
            
            expect(ariaLabel).toBe(expectedLabel);
            return ariaLabel === expectedLabel;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that online state changes are immediately reflected in the UI.
     * Validates: Requirement 7.3 - WHEN the app comes back online,
     * THE App SHALL update the status indicator accordingly
     */
    it('should immediately reflect online state changes in the UI', () => {
      fc.assert(
        fc.property(
          // Generate a sequence of boolean state changes
          fc.array(fc.boolean(), { minLength: 1, maxLength: 10 }),
          (stateSequence: boolean[]) => {
            for (const isOnline of stateSequence) {
              component.isOnline = isOnline;
              fixture.detectChanges();

              const connectionIndicator = fixture.nativeElement.querySelector('.connection-indicator');
              const ariaLabel = connectionIndicator.getAttribute('aria-label');
              
              const expectedLabel = isOnline
                ? 'Network status: Online'
                : 'Network status: Offline';
              
              expect(ariaLabel).toBe(expectedLabel);
              if (ariaLabel !== expectedLabel) {
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
     * Test that the connection indicator is deterministic:
     * the same state should always produce the same UI representation.
     */
    it('should be deterministic - same online state always produces same UI', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (isOnline: boolean) => {
            // Set state multiple times and verify consistency
            component.isOnline = isOnline;
            fixture.detectChanges();
            const ariaLabel1 = fixture.nativeElement.querySelector('.connection-indicator').getAttribute('aria-label');

            component.isOnline = isOnline;
            fixture.detectChanges();
            const ariaLabel2 = fixture.nativeElement.querySelector('.connection-indicator').getAttribute('aria-label');

            component.isOnline = isOnline;
            fixture.detectChanges();
            const ariaLabel3 = fixture.nativeElement.querySelector('.connection-indicator').getAttribute('aria-label');

            expect(ariaLabel1).toBe(ariaLabel2);
            expect(ariaLabel2).toBe(ariaLabel3);
            
            return ariaLabel1 === ariaLabel2 && ariaLabel2 === ariaLabel3;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that the connection indicator has proper accessibility attributes
     * regardless of the state.
     */
    it('should always have proper accessibility attributes for connection indicator', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (isOnline: boolean) => {
            component.isOnline = isOnline;
            fixture.detectChanges();

            const connectionIndicator = fixture.nativeElement.querySelector('.connection-indicator');
            
            // Should have role="img" for accessibility
            expect(connectionIndicator.getAttribute('role')).toBe('img');
            
            // Should have a non-empty aria-label
            const ariaLabel = connectionIndicator.getAttribute('aria-label');
            expect(ariaLabel).toBeTruthy();
            expect(ariaLabel.length).toBeGreaterThan(0);
            
            // SVG should be hidden from screen readers
            const svg = connectionIndicator.querySelector('.status-icon');
            expect(svg.getAttribute('aria-hidden')).toBe('true');
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that the online/offline state transition is correctly reflected.
     * Simulates going from online to offline and back.
     */
    it('should correctly handle online/offline transitions', () => {
      fc.assert(
        fc.property(
          // Generate number of transitions
          fc.integer({ min: 1, max: 20 }),
          (transitionCount: number) => {
            let currentState = true; // Start online
            
            for (let i = 0; i < transitionCount; i++) {
              // Toggle state
              currentState = !currentState;
              component.isOnline = currentState;
              fixture.detectChanges();

              const connectionIndicator = fixture.nativeElement.querySelector('.connection-indicator');
              const ariaLabel = connectionIndicator.getAttribute('aria-label');
              
              const expectedLabel = currentState
                ? 'Network status: Online'
                : 'Network status: Offline';
              
              expect(ariaLabel).toBe(expectedLabel);
              if (ariaLabel !== expectedLabel) {
                return false;
              }
            }
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Combined property tests for both wake lock and online status indicators.
   * These tests verify that both indicators work correctly together.
   */
  describe('Feature: ux-redesign, Combined Status Indicator Properties', () => {
    /**
     * Test that both indicators can be set independently and correctly.
     * Verifies that changing one indicator doesn't affect the other.
     */
    it('should allow independent control of wake lock and online indicators', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.boolean(),
          (wakeLockActive: boolean, isOnline: boolean) => {
            component.wakeLockActive = wakeLockActive;
            component.isOnline = isOnline;
            fixture.detectChanges();

            const wakeLockIndicator = fixture.nativeElement.querySelector('.wake-lock-indicator');
            const connectionIndicator = fixture.nativeElement.querySelector('.connection-indicator');
            
            const wakeLockLabel = wakeLockIndicator.getAttribute('aria-label');
            const connectionLabel = connectionIndicator.getAttribute('aria-label');
            
            const expectedWakeLockLabel = wakeLockActive
              ? 'Screen wake lock: Active - screen will stay on'
              : 'Screen wake lock: Inactive - screen may turn off';
            
            const expectedConnectionLabel = isOnline
              ? 'Network status: Online'
              : 'Network status: Offline';
            
            expect(wakeLockLabel).toBe(expectedWakeLockLabel);
            expect(connectionLabel).toBe(expectedConnectionLabel);
            
            return wakeLockLabel === expectedWakeLockLabel && 
                   connectionLabel === expectedConnectionLabel;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test all possible combinations of wake lock and online states.
     * There are 4 combinations: (true, true), (true, false), (false, true), (false, false)
     */
    it('should correctly display all combinations of wake lock and online states', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            { wakeLock: true, online: true },
            { wakeLock: true, online: false },
            { wakeLock: false, online: true },
            { wakeLock: false, online: false }
          ),
          (state: { wakeLock: boolean; online: boolean }) => {
            component.wakeLockActive = state.wakeLock;
            component.isOnline = state.online;
            fixture.detectChanges();

            const wakeLockIndicator = fixture.nativeElement.querySelector('.wake-lock-indicator');
            const connectionIndicator = fixture.nativeElement.querySelector('.connection-indicator');
            
            const wakeLockLabel = wakeLockIndicator.getAttribute('aria-label');
            const connectionLabel = connectionIndicator.getAttribute('aria-label');
            
            // Verify wake lock indicator
            if (state.wakeLock) {
              expect(wakeLockLabel).toBe('Screen wake lock: Active - screen will stay on');
            } else {
              expect(wakeLockLabel).toBe('Screen wake lock: Inactive - screen may turn off');
            }
            
            // Verify connection indicator
            if (state.online) {
              expect(connectionLabel).toBe('Network status: Online');
            } else {
              expect(connectionLabel).toBe('Network status: Offline');
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that changing one indicator doesn't affect the other.
     * This verifies state isolation between indicators.
     */
    it('should maintain state isolation between wake lock and online indicators', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.boolean(),
          fc.boolean(),
          (initialWakeLock: boolean, initialOnline: boolean, newWakeLock: boolean) => {
            // Set initial state
            component.wakeLockActive = initialWakeLock;
            component.isOnline = initialOnline;
            fixture.detectChanges();

            // Change only wake lock state
            component.wakeLockActive = newWakeLock;
            fixture.detectChanges();

            const connectionIndicator = fixture.nativeElement.querySelector('.connection-indicator');
            const connectionLabel = connectionIndicator.getAttribute('aria-label');
            
            // Online state should remain unchanged
            const expectedConnectionLabel = initialOnline
              ? 'Network status: Online'
              : 'Network status: Offline';
            
            expect(connectionLabel).toBe(expectedConnectionLabel);
            return connectionLabel === expectedConnectionLabel;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that the status indicators container always has proper accessibility.
     */
    it('should always have proper container accessibility attributes', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.boolean(),
          (wakeLockActive: boolean, isOnline: boolean) => {
            component.wakeLockActive = wakeLockActive;
            component.isOnline = isOnline;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.status-indicators');
            
            // Container should have role="status"
            expect(container.getAttribute('role')).toBe('status');
            
            // Container should have aria-label
            expect(container.getAttribute('aria-label')).toBe('Status indicators');
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

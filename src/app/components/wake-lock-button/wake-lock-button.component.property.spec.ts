import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as fc from 'fast-check';
import { WakeLockButtonComponent } from './wake-lock-button.component';

/**
 * Property-based tests for WakeLockButtonComponent
 * Feature: ux-redesign
 * 
 * These tests verify universal properties of the WakeLockButtonComponent across
 * randomly generated inputs using fast-check library.
 * 
 * **Validates: Requirements 15.1**
 */
describe('WakeLockButtonComponent Property Tests', () => {
  let component: WakeLockButtonComponent;
  let fixture: ComponentFixture<WakeLockButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WakeLockButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(WakeLockButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /**
   * Property 15: Touch Target Minimum Size
   * 
   * For any boolean isActive state, the wake lock button should always have
   * minimum dimensions of 44x44 pixels.
   * 
   * **Validates: Requirements 15.1**
   */
  describe('Feature: ux-redesign, Property 15: Touch Target Minimum Size', () => {
    /**
     * Minimum touch target size in pixels as per WCAG accessibility guidelines.
     * Requirement 15.1 specifies 44x44 pixels minimum.
     */
    const MIN_TOUCH_TARGET_SIZE = 44;

    /**
     * Test that the wake lock button always has minimum 44x44px touch target
     * regardless of the isActive state.
     * 
     * Validates: Requirement 15.1 - THE App SHALL ensure all interactive elements
     * have a minimum touch target size of 44x44 pixels
     */
    it('should have minimum 44x44px touch target for any isActive state', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (isActive: boolean) => {
            component.isActive = isActive;
            fixture.detectChanges();

            const button = fixture.nativeElement.querySelector('.wake-lock-button');
            const computedStyle = window.getComputedStyle(button);
            
            // Get the minimum width and height from computed styles
            const minWidth = parseFloat(computedStyle.minWidth);
            const minHeight = parseFloat(computedStyle.minHeight);
            
            expect(minWidth).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
            expect(minHeight).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
            
            return minWidth >= MIN_TOUCH_TARGET_SIZE && minHeight >= MIN_TOUCH_TARGET_SIZE;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that the actual rendered dimensions of the button meet the minimum
     * touch target size requirement.
     * 
     * Validates: Requirement 15.1
     */
    it('should render with actual dimensions of at least 44x44px', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (isActive: boolean) => {
            component.isActive = isActive;
            fixture.detectChanges();

            const button = fixture.nativeElement.querySelector('.wake-lock-button');
            const rect = button.getBoundingClientRect();
            
            // The actual rendered width and height should be at least 44px
            expect(rect.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
            expect(rect.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
            
            return rect.width >= MIN_TOUCH_TARGET_SIZE && rect.height >= MIN_TOUCH_TARGET_SIZE;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that the touch target size is maintained when toggling between
     * active and inactive states.
     * 
     * Validates: Requirement 15.1
     */
    it('should maintain minimum touch target size through state transitions', () => {
      fc.assert(
        fc.property(
          // Generate a sequence of boolean state changes
          fc.array(fc.boolean(), { minLength: 1, maxLength: 10 }),
          (stateSequence: boolean[]) => {
            for (const isActive of stateSequence) {
              component.isActive = isActive;
              fixture.detectChanges();

              const button = fixture.nativeElement.querySelector('.wake-lock-button');
              const computedStyle = window.getComputedStyle(button);
              
              const minWidth = parseFloat(computedStyle.minWidth);
              const minHeight = parseFloat(computedStyle.minHeight);
              
              expect(minWidth).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
              expect(minHeight).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
              
              if (minWidth < MIN_TOUCH_TARGET_SIZE || minHeight < MIN_TOUCH_TARGET_SIZE) {
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
     * Test that the touch target size is deterministic - the same state
     * should always produce the same minimum dimensions.
     * 
     * Validates: Requirement 15.1
     */
    it('should be deterministic - same state always produces same minimum dimensions', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (isActive: boolean) => {
            // Set state multiple times and verify consistency
            component.isActive = isActive;
            fixture.detectChanges();
            const button = fixture.nativeElement.querySelector('.wake-lock-button');
            const style1 = window.getComputedStyle(button);
            const minWidth1 = parseFloat(style1.minWidth);
            const minHeight1 = parseFloat(style1.minHeight);

            component.isActive = isActive;
            fixture.detectChanges();
            const style2 = window.getComputedStyle(button);
            const minWidth2 = parseFloat(style2.minWidth);
            const minHeight2 = parseFloat(style2.minHeight);

            component.isActive = isActive;
            fixture.detectChanges();
            const style3 = window.getComputedStyle(button);
            const minWidth3 = parseFloat(style3.minWidth);
            const minHeight3 = parseFloat(style3.minHeight);

            expect(minWidth1).toBe(minWidth2);
            expect(minWidth2).toBe(minWidth3);
            expect(minHeight1).toBe(minHeight2);
            expect(minHeight2).toBe(minHeight3);
            
            return minWidth1 === minWidth2 && minWidth2 === minWidth3 &&
                   minHeight1 === minHeight2 && minHeight2 === minHeight3;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that the button is an interactive element (button type) and
     * maintains the minimum touch target size.
     * 
     * Validates: Requirement 15.1
     */
    it('should be a button element with minimum touch target size', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (isActive: boolean) => {
            component.isActive = isActive;
            fixture.detectChanges();

            const button = fixture.nativeElement.querySelector('.wake-lock-button');
            
            // Verify it's a button element
            expect(button.tagName.toLowerCase()).toBe('button');
            expect(button.getAttribute('type')).toBe('button');
            
            // Verify minimum touch target size
            const computedStyle = window.getComputedStyle(button);
            const minWidth = parseFloat(computedStyle.minWidth);
            const minHeight = parseFloat(computedStyle.minHeight);
            
            expect(minWidth).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
            expect(minHeight).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
            
            return button.tagName.toLowerCase() === 'button' &&
                   minWidth >= MIN_TOUCH_TARGET_SIZE && 
                   minHeight >= MIN_TOUCH_TARGET_SIZE;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that the button maintains accessibility attributes while
     * meeting the minimum touch target size requirement.
     * 
     * Validates: Requirements 15.1, 17.1
     */
    it('should have proper accessibility attributes with minimum touch target size', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (isActive: boolean) => {
            component.isActive = isActive;
            fixture.detectChanges();

            const button = fixture.nativeElement.querySelector('.wake-lock-button');
            
            // Verify accessibility attributes
            const ariaLabel = button.getAttribute('aria-label');
            const ariaPressed = button.getAttribute('aria-pressed');
            
            expect(ariaLabel).toBeTruthy();
            expect(ariaLabel.length).toBeGreaterThan(0);
            expect(ariaPressed).toBe(isActive.toString());
            
            // Verify minimum touch target size
            const computedStyle = window.getComputedStyle(button);
            const minWidth = parseFloat(computedStyle.minWidth);
            const minHeight = parseFloat(computedStyle.minHeight);
            
            expect(minWidth).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
            expect(minHeight).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
            
            return ariaLabel && ariaLabel.length > 0 &&
                   ariaPressed === isActive.toString() &&
                   minWidth >= MIN_TOUCH_TARGET_SIZE && 
                   minHeight >= MIN_TOUCH_TARGET_SIZE;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as fc from 'fast-check';
import { LoadingStateComponent } from './loading-state.component';

/**
 * Property-based tests for LoadingStateComponent
 * Feature: ux-redesign
 * 
 * These tests verify universal properties of the LoadingStateComponent across
 * randomly generated inputs using fast-check library.
 * 
 * **Validates: Requirements 5.1, 5.3**
 */
describe('LoadingStateComponent Property Tests', () => {
  let component: LoadingStateComponent;
  let fixture: ComponentFixture<LoadingStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingStateComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /**
   * Property 7: GPS Loading State Transition
   * 
   * For any custom message string, the loading state component should display
   * the message correctly. The component should always display a loading indicator
   * and have proper accessibility attributes.
   * 
   * **Validates: Requirements 5.1, 5.3**
   */
  describe('Feature: ux-redesign, Property 7: GPS Loading State Transition', () => {
    /**
     * Test that the loading indicator is always displayed.
     * Validates: Requirement 5.1 - WHEN the app starts and GPS position is not yet available,
     * THE App SHALL display a loading indicator
     */
    it('should always display a loading indicator', () => {
      fc.assert(
        fc.property(
          // Generate random message strings
          fc.string({ minLength: 0, maxLength: 100 }),
          (customMessage: string) => {
            component.customMessage = customMessage || undefined;
            fixture.detectChanges();

            // Check that the spinner wrapper (loading indicator) is present
            const spinnerWrapper = fixture.nativeElement.querySelector('.spinner-wrapper');
            expect(spinnerWrapper).toBeTruthy();

            // Check that the pulse rings (animation elements) are present
            const pulseRings = fixture.nativeElement.querySelectorAll('.pulse-ring');
            expect(pulseRings.length).toBeGreaterThanOrEqual(1);

            // Check that the GPS icon is present
            const gpsIcon = fixture.nativeElement.querySelector('.gps-icon');
            expect(gpsIcon).toBeTruthy();

            return spinnerWrapper !== null && pulseRings.length >= 1 && gpsIcon !== null;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that custom messages are displayed correctly.
     * Validates: Requirement 5.1 - THE App SHALL display a message indicating it is waiting for GPS signal
     */
    it('should display custom message correctly for any non-empty string', () => {
      fc.assert(
        fc.property(
          // Generate non-empty message strings
          fc.string({ minLength: 1, maxLength: 200 }),
          (customMessage: string) => {
            component.customMessage = customMessage;
            fixture.detectChanges();

            const messageElement = fixture.nativeElement.querySelector('.loading-message');
            expect(messageElement).toBeTruthy();
            expect(messageElement.textContent).toBe(customMessage);

            return messageElement !== null && messageElement.textContent === customMessage;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that the default message is displayed when no custom message is provided.
     * Validates: Requirement 5.1 - Default message should indicate waiting for GPS
     */
    it('should display default message when no custom message is provided', () => {
      fc.assert(
        fc.property(
          // Generate undefined or empty values
          fc.constantFrom(undefined, ''),
          (customMessage: string | undefined) => {
            if (customMessage !== undefined) {
              component.customMessage = customMessage;
            }
            // Reset component to test default behavior
            fixture = TestBed.createComponent(LoadingStateComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();

            const messageElement = fixture.nativeElement.querySelector('.loading-message');
            expect(messageElement).toBeTruthy();
            expect(messageElement.textContent).toBe('Waiting for GPS signal...');

            return messageElement !== null && messageElement.textContent === 'Waiting for GPS signal...';
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that the loading container has proper accessibility attributes.
     * Validates: Requirement 5.1 - Loading state should be accessible
     */
    it('should always have proper accessibility attributes', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 100 }),
          (customMessage: string) => {
            component.customMessage = customMessage || undefined;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.loading-container');
            
            // Should have role="status" for accessibility
            expect(container.getAttribute('role')).toBe('status');
            
            // Should have aria-live="polite" for screen readers
            expect(container.getAttribute('aria-live')).toBe('polite');
            
            // Should have aria-label for screen readers
            const ariaLabel = container.getAttribute('aria-label');
            expect(ariaLabel).toBeTruthy();
            expect(ariaLabel.length).toBeGreaterThan(0);

            return container.getAttribute('role') === 'status' &&
                   container.getAttribute('aria-live') === 'polite' &&
                   ariaLabel !== null && ariaLabel.length > 0;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that the spinner is hidden from screen readers.
     * Validates: Requirement 5.1 - Visual elements should be properly hidden from assistive tech
     */
    it('should have spinner hidden from screen readers', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 100 }),
          (customMessage: string) => {
            component.customMessage = customMessage || undefined;
            fixture.detectChanges();

            const spinnerWrapper = fixture.nativeElement.querySelector('.spinner-wrapper');
            
            // Spinner should be hidden from screen readers
            expect(spinnerWrapper.getAttribute('aria-hidden')).toBe('true');

            return spinnerWrapper.getAttribute('aria-hidden') === 'true';
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that message display is deterministic - same message always produces same output.
     */
    it('should be deterministic - same message always produces same display', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          (customMessage: string) => {
            // Set message multiple times and verify consistency
            component.customMessage = customMessage;
            fixture.detectChanges();
            const text1 = fixture.nativeElement.querySelector('.loading-message').textContent;

            component.customMessage = customMessage;
            fixture.detectChanges();
            const text2 = fixture.nativeElement.querySelector('.loading-message').textContent;

            component.customMessage = customMessage;
            fixture.detectChanges();
            const text3 = fixture.nativeElement.querySelector('.loading-message').textContent;

            expect(text1).toBe(text2);
            expect(text2).toBe(text3);

            return text1 === text2 && text2 === text3;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that message changes are immediately reflected in the UI.
     */
    it('should immediately reflect message changes in the UI', () => {
      fc.assert(
        fc.property(
          // Generate a sequence of message strings
          fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 10 }),
          (messageSequence: string[]) => {
            for (const message of messageSequence) {
              component.customMessage = message;
              fixture.detectChanges();

              const messageElement = fixture.nativeElement.querySelector('.loading-message');
              expect(messageElement.textContent).toBe(message);
              
              if (messageElement.textContent !== message) {
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
     * Test that special characters in messages are displayed correctly.
     */
    it('should correctly display messages with special characters', () => {
      fc.assert(
        fc.property(
          // Generate strings with various special characters
          fc.string({ minLength: 1, maxLength: 100 }),
          (customMessage: string) => {
            component.customMessage = customMessage;
            fixture.detectChanges();

            const messageElement = fixture.nativeElement.querySelector('.loading-message');
            expect(messageElement).toBeTruthy();
            expect(messageElement.textContent).toBe(customMessage);

            return messageElement !== null && messageElement.textContent === customMessage;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that sub-messages are displayed correctly when provided.
     */
    it('should display sub-message correctly when provided', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.string({ minLength: 1, maxLength: 100 }),
          (customMessage: string, customSubMessage: string) => {
            component.customMessage = customMessage;
            component.customSubMessage = customSubMessage;
            fixture.detectChanges();

            const messageElement = fixture.nativeElement.querySelector('.loading-message');
            const subMessageElement = fixture.nativeElement.querySelector('.loading-sub-message');
            
            expect(messageElement.textContent).toBe(customMessage);
            expect(subMessageElement).toBeTruthy();
            expect(subMessageElement.textContent).toBe(customSubMessage);

            return messageElement.textContent === customMessage &&
                   subMessageElement !== null &&
                   subMessageElement.textContent === customSubMessage;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that sub-message is not displayed when not provided.
     */
    it('should not display sub-message when not provided', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          (customMessage: string) => {
            // Create fresh component without sub-message
            fixture = TestBed.createComponent(LoadingStateComponent);
            component = fixture.componentInstance;
            component.customMessage = customMessage;
            fixture.detectChanges();

            const subMessageElement = fixture.nativeElement.querySelector('.loading-sub-message');
            expect(subMessageElement).toBeFalsy();

            return subMessageElement === null;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that the loading container is always present regardless of message content.
     */
    it('should always have loading container present', () => {
      fc.assert(
        fc.property(
          fc.option(fc.string({ minLength: 0, maxLength: 100 }), { nil: undefined }),
          fc.option(fc.string({ minLength: 0, maxLength: 100 }), { nil: undefined }),
          (customMessage: string | undefined, customSubMessage: string | undefined) => {
            fixture = TestBed.createComponent(LoadingStateComponent);
            component = fixture.componentInstance;
            
            if (customMessage !== undefined) {
              component.customMessage = customMessage;
            }
            if (customSubMessage !== undefined) {
              component.customSubMessage = customSubMessage;
            }
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.loading-container');
            expect(container).toBeTruthy();

            return container !== null;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Test that the GPS icon SVG is always present in the loading indicator.
     */
    it('should always display GPS icon in the loading indicator', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 100 }),
          (customMessage: string) => {
            component.customMessage = customMessage || undefined;
            fixture.detectChanges();

            const gpsIcon = fixture.nativeElement.querySelector('.gps-icon');
            expect(gpsIcon).toBeTruthy();
            
            // Check that the SVG has the expected structure
            const svgPath = gpsIcon.querySelector('path');
            const svgCircle = gpsIcon.querySelector('circle');
            expect(svgPath).toBeTruthy();
            expect(svgCircle).toBeTruthy();

            return gpsIcon !== null && svgPath !== null && svgCircle !== null;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

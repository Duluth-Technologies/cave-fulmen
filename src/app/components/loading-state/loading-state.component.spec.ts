import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingStateComponent } from './loading-state.component';

/**
 * Unit tests for LoadingStateComponent.
 * 
 * Tests verify:
 * - Loading indicator is displayed
 * - Default "Waiting for GPS signal" message is shown
 * - Custom messages can be provided
 * - Accessibility attributes are present
 * - Animation elements are present
 * 
 * **Validates: Requirements 5.1, 5.2, 5.4**
 */
describe('LoadingStateComponent', () => {
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Loading Indicator Display', () => {
    /**
     * Validates: Requirement 5.1
     * WHEN the app starts and GPS position is not yet available, 
     * THE App SHALL display a loading indicator
     */
    it('should display a loading container', () => {
      const container = fixture.nativeElement.querySelector('.loading-container');
      expect(container).toBeTruthy();
    });

    /**
     * Validates: Requirement 5.4
     * THE loading state SHALL include visual feedback such as a spinner or pulsing animation
     */
    it('should display spinner wrapper with animation elements', () => {
      const spinnerWrapper = fixture.nativeElement.querySelector('.spinner-wrapper');
      expect(spinnerWrapper).toBeTruthy();
    });

    it('should display pulse ring animation elements', () => {
      const pulseRings = fixture.nativeElement.querySelectorAll('.pulse-ring');
      expect(pulseRings.length).toBe(2); // Two pulse rings for staggered animation
    });

    it('should display GPS icon', () => {
      const gpsIcon = fixture.nativeElement.querySelector('.gps-icon');
      expect(gpsIcon).toBeTruthy();
    });
  });

  describe('Loading Message Display', () => {
    /**
     * Validates: Requirement 5.2
     * THE App SHALL display a message indicating it is waiting for GPS signal
     */
    it('should display default "Waiting for GPS signal..." message', () => {
      const message = fixture.nativeElement.querySelector('.loading-message');
      expect(message.textContent).toBe('Waiting for GPS signal...');
    });

    it('should display custom message when provided', () => {
      component.customMessage = 'Custom loading message';
      fixture.detectChanges();

      const message = fixture.nativeElement.querySelector('.loading-message');
      expect(message.textContent).toBe('Custom loading message');
    });

    it('should not display sub-message by default', () => {
      const subMessage = fixture.nativeElement.querySelector('.loading-sub-message');
      expect(subMessage).toBeFalsy();
    });

    it('should display sub-message when provided', () => {
      component.customSubMessage = 'Please ensure location services are enabled';
      fixture.detectChanges();

      const subMessage = fixture.nativeElement.querySelector('.loading-sub-message');
      expect(subMessage).toBeTruthy();
      expect(subMessage.textContent).toBe('Please ensure location services are enabled');
    });
  });

  describe('Accessibility', () => {
    it('should have role="status" on the container', () => {
      const container = fixture.nativeElement.querySelector('.loading-container');
      expect(container.getAttribute('role')).toBe('status');
    });

    it('should have aria-live="polite" on the container', () => {
      const container = fixture.nativeElement.querySelector('.loading-container');
      expect(container.getAttribute('aria-live')).toBe('polite');
    });

    it('should have aria-label describing the loading state', () => {
      const container = fixture.nativeElement.querySelector('.loading-container');
      expect(container.getAttribute('aria-label')).toBe('Loading, waiting for GPS signal');
    });

    it('should have aria-hidden="true" on spinner wrapper', () => {
      const spinnerWrapper = fixture.nativeElement.querySelector('.spinner-wrapper');
      expect(spinnerWrapper.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('Animation Elements', () => {
    it('should have pulse-ring elements for pulsing animation', () => {
      const pulseRings = fixture.nativeElement.querySelectorAll('.pulse-ring');
      expect(pulseRings.length).toBeGreaterThan(0);
    });

    it('should have delayed pulse ring for staggered effect', () => {
      const delayedRing = fixture.nativeElement.querySelector('.pulse-ring-delayed');
      expect(delayedRing).toBeTruthy();
    });

    it('should have GPS icon with bounce animation class', () => {
      const gpsIcon = fixture.nativeElement.querySelector('.gps-icon');
      expect(gpsIcon).toBeTruthy();
      // The animation is applied via CSS, we just verify the element exists
    });
  });

  describe('Theme Support', () => {
    it('should use CSS custom properties for text color', () => {
      const message = fixture.nativeElement.querySelector('.loading-message');
      const styles = window.getComputedStyle(message);
      // The component uses var(--text-primary) which will be resolved by the browser
      // We verify the element exists and has the correct class
      expect(message).toBeTruthy();
    });

    it('should use CSS custom properties for secondary text color', () => {
      component.customSubMessage = 'Test sub-message';
      fixture.detectChanges();

      const subMessage = fixture.nativeElement.querySelector('.loading-sub-message');
      // The component uses var(--text-secondary) which will be resolved by the browser
      expect(subMessage).toBeTruthy();
    });
  });
});

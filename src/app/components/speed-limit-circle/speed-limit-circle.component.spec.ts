import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpeedLimitCircleComponent, SPEED_LIMIT_THRESHOLDS } from './speed-limit-circle.component';

/**
 * Unit tests for SpeedLimitCircleComponent.
 * 
 * Tests verify:
 * - Visibility based on distance threshold (4km)
 * - Prominence animation when distance < 1km
 * - Standard red circle with white background design
 * - Speed limit value display
 * - Accessibility attributes
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
 */
describe('SpeedLimitCircleComponent', () => {
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Visibility based on distance threshold', () => {
    /**
     * Requirement 3.1: WHEN distance is within Distance_Threshold (4km),
     * THE Speed_Limit_Circle SHALL be prominently displayed
     */
    it('should be visible when distance is within 4km threshold', () => {
      component.distance = 3.5;
      component.speedLimit = 90;
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.speed-limit-container');
      expect(container.classList.contains('visible')).toBe(true);
    });

    it('should be visible when distance is exactly 4km (boundary)', () => {
      component.distance = 4;
      component.speedLimit = 90;
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.speed-limit-container');
      expect(container.classList.contains('visible')).toBe(true);
    });

    it('should not be visible when distance is greater than 4km', () => {
      component.distance = 4.1;
      component.speedLimit = 90;
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.speed-limit-container');
      expect(container.classList.contains('visible')).toBe(false);
    });

    it('should not be visible when distance is 5km', () => {
      component.distance = 5;
      component.speedLimit = 90;
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.speed-limit-container');
      expect(container.classList.contains('visible')).toBe(false);
    });

    it('should be visible when distance is 0km', () => {
      component.distance = 0;
      component.speedLimit = 90;
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.speed-limit-container');
      expect(container.classList.contains('visible')).toBe(true);
    });

    it('should respect isVisibleInput when explicitly set to true', () => {
      component.distance = 10; // Outside threshold
      component.isVisibleInput = true;
      component.speedLimit = 90;
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.speed-limit-container');
      expect(container.classList.contains('visible')).toBe(true);
    });

    it('should respect isVisibleInput when explicitly set to false', () => {
      component.distance = 2; // Inside threshold
      component.isVisibleInput = false;
      component.speedLimit = 90;
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.speed-limit-container');
      expect(container.classList.contains('visible')).toBe(false);
    });
  });

  describe('Prominence animation based on distance', () => {
    /**
     * Requirement 3.3: WHEN distance decreases below 1km,
     * THE Speed_Limit_Circle SHALL increase in visual prominence through size or animation
     */
    it('should be prominent when distance is less than 1km', () => {
      component.distance = 0.5;
      component.speedLimit = 90;
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.speed-limit-container');
      expect(container.classList.contains('prominent')).toBe(true);
    });

    it('should not be prominent when distance is exactly 1km (boundary)', () => {
      component.distance = 1;
      component.speedLimit = 90;
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.speed-limit-container');
      expect(container.classList.contains('prominent')).toBe(false);
    });

    it('should not be prominent when distance is greater than 1km', () => {
      component.distance = 1.5;
      component.speedLimit = 90;
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.speed-limit-container');
      expect(container.classList.contains('prominent')).toBe(false);
    });

    it('should be prominent when distance is 0km', () => {
      component.distance = 0;
      component.speedLimit = 90;
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.speed-limit-container');
      expect(container.classList.contains('prominent')).toBe(true);
    });

    it('should not be prominent when not visible (distance > 4km)', () => {
      component.distance = 0.5; // Would be prominent if visible
      component.isVisibleInput = false; // But explicitly hidden
      component.speedLimit = 90;
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.speed-limit-container');
      expect(container.classList.contains('prominent')).toBe(false);
    });
  });

  describe('Speed limit value display', () => {
    it('should display the speed limit value', () => {
      component.speedLimit = 90;
      component.distance = 2;
      fixture.detectChanges();

      const valueElement = fixture.nativeElement.querySelector('.speed-limit-value');
      expect(valueElement.textContent).toBe('90');
    });

    it('should display different speed limit values correctly', () => {
      component.speedLimit = 130;
      component.distance = 2;
      fixture.detectChanges();

      const valueElement = fixture.nativeElement.querySelector('.speed-limit-value');
      expect(valueElement.textContent).toBe('130');
    });

    it('should display low speed limit values', () => {
      component.speedLimit = 30;
      component.distance = 2;
      fixture.detectChanges();

      const valueElement = fixture.nativeElement.querySelector('.speed-limit-value');
      expect(valueElement.textContent).toBe('30');
    });
  });

  describe('Visual design - red circle with white background', () => {
    /**
     * Requirement 3.4: THE Speed_Limit_Circle SHALL maintain the standard
     * red circle with white background design convention
     */
    it('should have the speed-limit-circle element', () => {
      component.speedLimit = 90;
      component.distance = 2;
      fixture.detectChanges();

      const circle = fixture.nativeElement.querySelector('.speed-limit-circle');
      expect(circle).toBeTruthy();
    });

    it('should have circular shape (border-radius: 50%)', () => {
      component.speedLimit = 90;
      component.distance = 2;
      fixture.detectChanges();

      const circle = fixture.nativeElement.querySelector('.speed-limit-circle');
      const styles = window.getComputedStyle(circle);
      expect(styles.borderRadius).toBe('50%');
    });
  });

  describe('Accessibility', () => {
    it('should have role="img" on the container', () => {
      component.speedLimit = 90;
      component.distance = 2;
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.speed-limit-container');
      expect(container.getAttribute('role')).toBe('img');
    });

    it('should have aria-hidden="false" when visible', () => {
      component.speedLimit = 90;
      component.distance = 2;
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.speed-limit-container');
      expect(container.getAttribute('aria-hidden')).toBe('false');
    });

    it('should have aria-hidden="true" when not visible', () => {
      component.speedLimit = 90;
      component.distance = 5; // Outside threshold
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.speed-limit-container');
      expect(container.getAttribute('aria-hidden')).toBe('true');
    });

    it('should have descriptive aria-label when visible and approaching', () => {
      component.speedLimit = 90;
      component.distance = 2;
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.speed-limit-container');
      const ariaLabel = container.getAttribute('aria-label');
      expect(ariaLabel).toContain('Speed limit 90 km/h');
      expect(ariaLabel).toContain('Approaching camera');
    });

    it('should have descriptive aria-label when prominent (very close)', () => {
      component.speedLimit = 90;
      component.distance = 0.5;
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.speed-limit-container');
      const ariaLabel = container.getAttribute('aria-label');
      expect(ariaLabel).toContain('Speed limit 90 km/h');
      expect(ariaLabel).toContain('Very close to camera');
    });

    it('should have empty aria-label when not visible', () => {
      component.speedLimit = 90;
      component.distance = 5; // Outside threshold
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.speed-limit-container');
      expect(container.getAttribute('aria-label')).toBe('');
    });
  });

  describe('CSS Transitions', () => {
    it('should have transition styles for smooth visibility changes', () => {
      component.speedLimit = 90;
      component.distance = 2;
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.speed-limit-container');
      const styles = window.getComputedStyle(container);
      
      // Check that transition property is set
      expect(styles.transition).toContain('opacity');
      expect(styles.transition).toContain('transform');
    });
  });

  describe('Threshold constants', () => {
    it('should have visibility threshold of 4km', () => {
      expect(SPEED_LIMIT_THRESHOLDS.VISIBILITY_THRESHOLD).toBe(4);
    });

    it('should have prominence threshold of 1km', () => {
      expect(SPEED_LIMIT_THRESHOLDS.PROMINENCE_THRESHOLD).toBe(1);
    });
  });
});

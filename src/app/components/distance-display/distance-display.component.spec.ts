import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DistanceDisplayComponent } from './distance-display.component';

/**
 * Unit tests for DistanceDisplayComponent.
 * 
 * Tests verify:
 * - Distance color display based on proximity (green/yellow/red)
 * - Distance formatting (decimal places)
 * - Aria-live region for accessibility
 * - Smooth color transitions via CSS classes
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 17.2**
 */
describe('DistanceDisplayComponent', () => {
  let component: DistanceDisplayComponent;
  let fixture: ComponentFixture<DistanceDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistanceDisplayComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DistanceDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Distance Color Display', () => {
    it('should show green color when distance > 2km', () => {
      component.distance = 3.5;
      fixture.detectChanges();

      const display = fixture.nativeElement.querySelector('.distance-display');
      expect(display.classList.contains('color-green')).toBe(true);
      expect(display.classList.contains('color-yellow')).toBe(false);
      expect(display.classList.contains('color-red')).toBe(false);
    });

    it('should show yellow color when distance is between 1km and 2km', () => {
      component.distance = 1.5;
      fixture.detectChanges();

      const display = fixture.nativeElement.querySelector('.distance-display');
      expect(display.classList.contains('color-green')).toBe(false);
      expect(display.classList.contains('color-yellow')).toBe(true);
      expect(display.classList.contains('color-red')).toBe(false);
    });

    it('should show red color when distance < 1km', () => {
      component.distance = 0.5;
      fixture.detectChanges();

      const display = fixture.nativeElement.querySelector('.distance-display');
      expect(display.classList.contains('color-green')).toBe(false);
      expect(display.classList.contains('color-yellow')).toBe(false);
      expect(display.classList.contains('color-red')).toBe(true);
    });

    // Boundary tests
    it('should show green color at exactly 2.01km (boundary test)', () => {
      component.distance = 2.01;
      fixture.detectChanges();

      const display = fixture.nativeElement.querySelector('.distance-display');
      expect(display.classList.contains('color-green')).toBe(true);
    });

    it('should show yellow color at exactly 2km (boundary test)', () => {
      component.distance = 2;
      fixture.detectChanges();

      const display = fixture.nativeElement.querySelector('.distance-display');
      expect(display.classList.contains('color-yellow')).toBe(true);
    });

    it('should show yellow color at exactly 1km (boundary test)', () => {
      component.distance = 1;
      fixture.detectChanges();

      const display = fixture.nativeElement.querySelector('.distance-display');
      expect(display.classList.contains('color-yellow')).toBe(true);
    });

    it('should show red color at exactly 0.99km (boundary test)', () => {
      component.distance = 0.99;
      fixture.detectChanges();

      const display = fixture.nativeElement.querySelector('.distance-display');
      expect(display.classList.contains('color-red')).toBe(true);
    });

    it('should show red color at 0km', () => {
      component.distance = 0;
      fixture.detectChanges();

      const display = fixture.nativeElement.querySelector('.distance-display');
      expect(display.classList.contains('color-red')).toBe(true);
    });
  });

  describe('Distance Formatting', () => {
    it('should format distance with one decimal place when under 10km', () => {
      component.distance = 3.567;
      fixture.detectChanges();

      const valueElement = fixture.nativeElement.querySelector('.distance-value');
      expect(valueElement.textContent).toBe('3.6');
    });

    it('should format distance as whole number when 10km or more', () => {
      component.distance = 15.7;
      fixture.detectChanges();

      const valueElement = fixture.nativeElement.querySelector('.distance-value');
      expect(valueElement.textContent).toBe('16');
    });

    it('should show 0.0 for zero distance', () => {
      component.distance = 0;
      fixture.detectChanges();

      const valueElement = fixture.nativeElement.querySelector('.distance-value');
      expect(valueElement.textContent).toBe('0.0');
    });

    it('should format exactly 10km as whole number', () => {
      component.distance = 10;
      fixture.detectChanges();

      const valueElement = fixture.nativeElement.querySelector('.distance-value');
      expect(valueElement.textContent).toBe('10');
    });

    it('should format 9.99km with one decimal place', () => {
      component.distance = 9.99;
      fixture.detectChanges();

      const valueElement = fixture.nativeElement.querySelector('.distance-value');
      expect(valueElement.textContent).toBe('10.0');
    });
  });

  describe('Unit Display', () => {
    it('should display km unit', () => {
      const unitElement = fixture.nativeElement.querySelector('.distance-unit');
      expect(unitElement.textContent).toBe('km');
    });
  });

  describe('Accessibility', () => {
    it('should have role="status" on the container', () => {
      const container = fixture.nativeElement.querySelector('.distance-display');
      expect(container.getAttribute('role')).toBe('status');
    });

    it('should have aria-live="polite" for screen reader announcements', () => {
      const container = fixture.nativeElement.querySelector('.distance-display');
      expect(container.getAttribute('aria-live')).toBe('polite');
    });

    it('should have descriptive aria-label for green distance', () => {
      component.distance = 3.5;
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.distance-display');
      expect(container.getAttribute('aria-label')).toBe('Distance to camera: 3.5 kilometers, safe distance');
    });

    it('should have descriptive aria-label for yellow distance', () => {
      component.distance = 1.5;
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.distance-display');
      expect(container.getAttribute('aria-label')).toBe('Distance to camera: 1.5 kilometers, approaching camera');
    });

    it('should have descriptive aria-label for red distance', () => {
      component.distance = 0.5;
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.distance-display');
      expect(container.getAttribute('aria-label')).toBe('Distance to camera: 0.5 kilometers, very close to camera');
    });
  });

  describe('CSS Transitions', () => {
    it('should have transition styles for smooth color changes', () => {
      const container = fixture.nativeElement.querySelector('.distance-display');
      const styles = window.getComputedStyle(container);
      
      // Check that transition property is set (includes 'color' in the transition)
      expect(styles.transition).toContain('color');
    });
  });

  describe('Dark Mode Support', () => {
    it('should accept isDarkMode input without errors', () => {
      expect(() => {
        component.isDarkMode = true;
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should accept isDarkMode = false without errors', () => {
      expect(() => {
        component.isDarkMode = false;
        fixture.detectChanges();
      }).not.toThrow();
    });
  });
});

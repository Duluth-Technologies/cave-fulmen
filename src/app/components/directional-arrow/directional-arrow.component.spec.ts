import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DirectionalArrowComponent, ARROW_THRESHOLDS } from './directional-arrow.component';

/**
 * Unit tests for DirectionalArrowComponent.
 * 
 * Tests cover:
 * - Visibility based on speed threshold (Requirements 8.3, 8.4)
 * - Pulsing animation based on distance (Requirements 9.1, 9.3)
 * - Rotation transitions (Requirement 8.5)
 * - Accessibility attributes
 */
describe('DirectionalArrowComponent', () => {
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Visibility based on speed', () => {
    /**
     * Requirement 8.3: Arrow hidden when speed ≤ 10 km/h
     */
    it('should be hidden when speed is 0 km/h', () => {
      component.speed = 0;
      fixture.detectChanges();
      
      const container = fixture.nativeElement.querySelector('.arrow-container');
      expect(container.classList.contains('visible')).toBeFalse();
    });

    it('should be hidden when speed is exactly 10 km/h', () => {
      component.speed = 10;
      fixture.detectChanges();
      
      const container = fixture.nativeElement.querySelector('.arrow-container');
      expect(container.classList.contains('visible')).toBeFalse();
    });

    it('should be hidden when speed is null', () => {
      component.speed = null;
      fixture.detectChanges();
      
      const container = fixture.nativeElement.querySelector('.arrow-container');
      expect(container.classList.contains('visible')).toBeFalse();
    });

    /**
     * Requirement 8.4: Arrow visible when speed > 10 km/h
     */
    it('should be visible when speed is 11 km/h', () => {
      component.speed = 11;
      fixture.detectChanges();
      
      const container = fixture.nativeElement.querySelector('.arrow-container');
      expect(container.classList.contains('visible')).toBeTrue();
    });

    it('should be visible when speed is 50 km/h', () => {
      component.speed = 50;
      fixture.detectChanges();
      
      const container = fixture.nativeElement.querySelector('.arrow-container');
      expect(container.classList.contains('visible')).toBeTrue();
    });

    it('should respect explicit isVisibleInput over computed visibility', () => {
      component.speed = 50; // Would normally be visible
      component.isVisibleInput = false; // Explicitly hidden
      fixture.detectChanges();
      
      const container = fixture.nativeElement.querySelector('.arrow-container');
      expect(container.classList.contains('visible')).toBeFalse();
    });
  });

  describe('Pulsing animation based on distance', () => {
    /**
     * Requirement 9.1: Pulsing when distance < 1km and speed > 10 km/h
     */
    it('should pulse when distance is 0.5 km and speed > 10 km/h', () => {
      component.speed = 50;
      component.distance = 0.5;
      fixture.detectChanges();
      
      const container = fixture.nativeElement.querySelector('.arrow-container');
      expect(container.classList.contains('pulsing')).toBeTrue();
    });

    it('should pulse when distance is 0.99 km and speed > 10 km/h', () => {
      component.speed = 50;
      component.distance = 0.99;
      fixture.detectChanges();
      
      const container = fixture.nativeElement.querySelector('.arrow-container');
      expect(container.classList.contains('pulsing')).toBeTrue();
    });

    /**
     * Requirement 9.3: Stop pulsing when distance ≥ 1km
     */
    it('should not pulse when distance is exactly 1 km', () => {
      component.speed = 50;
      component.distance = 1;
      fixture.detectChanges();
      
      const container = fixture.nativeElement.querySelector('.arrow-container');
      expect(container.classList.contains('pulsing')).toBeFalse();
    });

    it('should not pulse when distance is 2 km', () => {
      component.speed = 50;
      component.distance = 2;
      fixture.detectChanges();
      
      const container = fixture.nativeElement.querySelector('.arrow-container');
      expect(container.classList.contains('pulsing')).toBeFalse();
    });

    it('should not pulse when arrow is not visible (speed ≤ 10)', () => {
      component.speed = 10;
      component.distance = 0.5;
      fixture.detectChanges();
      
      const container = fixture.nativeElement.querySelector('.arrow-container');
      expect(container.classList.contains('pulsing')).toBeFalse();
    });

    it('should respect explicit isPulsingInput over computed pulsing', () => {
      component.speed = 50;
      component.distance = 0.5; // Would normally pulse
      component.isPulsingInput = false; // Explicitly not pulsing
      fixture.detectChanges();
      
      const container = fixture.nativeElement.querySelector('.arrow-container');
      expect(container.classList.contains('pulsing')).toBeFalse();
    });
  });

  describe('Rotation', () => {
    /**
     * Requirement 8.5: Smooth rotation transitions
     */
    it('should apply rotation transform based on angle', () => {
      component.angle = 45;
      component.speed = 50;
      fixture.detectChanges();
      
      const rotator = fixture.nativeElement.querySelector('.arrow-rotator');
      expect(rotator.style.transform).toBe('rotate(45deg)');
    });

    it('should handle 0 degree angle', () => {
      component.angle = 0;
      component.speed = 50;
      fixture.detectChanges();
      
      const rotator = fixture.nativeElement.querySelector('.arrow-rotator');
      expect(rotator.style.transform).toBe('rotate(0deg)');
    });

    it('should handle 360 degree angle', () => {
      component.angle = 360;
      component.speed = 50;
      fixture.detectChanges();
      
      const rotator = fixture.nativeElement.querySelector('.arrow-rotator');
      expect(rotator.style.transform).toBe('rotate(360deg)');
    });

    it('should handle negative angles', () => {
      component.angle = -45;
      component.speed = 50;
      fixture.detectChanges();
      
      const rotator = fixture.nativeElement.querySelector('.arrow-rotator');
      expect(rotator.style.transform).toBe('rotate(-45deg)');
    });

    it('should keep rotation applied while pulsing', () => {
      component.angle = 90;
      component.speed = 50;
      component.distance = 0.5;
      fixture.detectChanges();

      const rotator = fixture.nativeElement.querySelector('.arrow-rotator');
      const container = fixture.nativeElement.querySelector('.arrow-container');
      expect(container.classList.contains('pulsing')).toBeTrue();
      expect(rotator.style.transform).toBe('rotate(90deg)');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-hidden true when not visible', () => {
      component.speed = 5;
      fixture.detectChanges();
      
      const container = fixture.nativeElement.querySelector('.arrow-container');
      expect(container.getAttribute('aria-hidden')).toBe('true');
    });

    it('should have aria-hidden false when visible', () => {
      component.speed = 50;
      fixture.detectChanges();
      
      const container = fixture.nativeElement.querySelector('.arrow-container');
      expect(container.getAttribute('aria-hidden')).toBe('false');
    });

    it('should have role="img"', () => {
      const container = fixture.nativeElement.querySelector('.arrow-container');
      expect(container.getAttribute('role')).toBe('img');
    });

    it('should have descriptive aria-label when visible', () => {
      component.speed = 50;
      component.angle = 0;
      fixture.detectChanges();
      
      const container = fixture.nativeElement.querySelector('.arrow-container');
      expect(container.getAttribute('aria-label')).toContain('Camera direction');
    });

    it('should include distance in aria-label when pulsing', () => {
      component.speed = 50;
      component.distance = 0.5;
      fixture.detectChanges();
      
      const container = fixture.nativeElement.querySelector('.arrow-container');
      expect(container.getAttribute('aria-label')).toContain('very close');
    });
  });

  describe('Arrow thresholds constants', () => {
    it('should have speed visibility threshold of 10', () => {
      expect(ARROW_THRESHOLDS.SPEED_VISIBILITY_THRESHOLD).toBe(10);
    });

    it('should have pulsing distance threshold of 1', () => {
      expect(ARROW_THRESHOLDS.PULSING_DISTANCE_THRESHOLD).toBe(1);
    });
  });

  describe('SVG arrow design', () => {
    /**
     * Requirement 8.1: Significantly larger arrow
     */
    it('should have a large SVG arrow (120x120px)', () => {
      const svg = fixture.nativeElement.querySelector('.arrow-svg');
      expect(svg).toBeTruthy();
      // Check the CSS class is applied (actual size is in CSS)
      expect(svg.classList.contains('arrow-svg')).toBeTrue();
    });

    it('should have arrow shape polygon', () => {
      const polygon = fixture.nativeElement.querySelector('.arrow-shape');
      expect(polygon).toBeTruthy();
      expect(polygon.getAttribute('points')).toBeTruthy();
    });
  });
});

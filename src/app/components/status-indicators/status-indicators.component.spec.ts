import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusIndicatorsComponent } from './status-indicators.component';

/**
 * Unit tests for StatusIndicatorsComponent.
 * 
 * Tests verify:
 * - GPS signal level display based on accuracy
 * - Online/offline indicator display
 * - Wake lock indicator display
 * - Aria-labels for accessibility
 * 
 * **Validates: Requirements 4.1-4.5, 6.1, 6.2, 7.1-7.3, 17.1**
 */
describe('StatusIndicatorsComponent', () => {
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('GPS Signal Indicator', () => {
    it('should show 0 bars when gpsAccuracy is null', () => {
      component.gpsAccuracy = null;
      fixture.detectChanges();

      const activeBars = fixture.nativeElement.querySelectorAll('.signal-bar.active');
      expect(activeBars.length).toBe(0);
    });

    it('should show 3 bars when gpsAccuracy is less than 10m (strong signal)', () => {
      component.gpsAccuracy = 5;
      fixture.detectChanges();

      const activeBars = fixture.nativeElement.querySelectorAll('.signal-bar.active');
      expect(activeBars.length).toBe(3);
    });

    it('should show 2 bars when gpsAccuracy is between 10m and 30m (medium signal)', () => {
      component.gpsAccuracy = 20;
      fixture.detectChanges();

      const activeBars = fixture.nativeElement.querySelectorAll('.signal-bar.active');
      expect(activeBars.length).toBe(2);
    });

    it('should show 1 bar when gpsAccuracy is greater than 30m (weak signal)', () => {
      component.gpsAccuracy = 50;
      fixture.detectChanges();

      const activeBars = fixture.nativeElement.querySelectorAll('.signal-bar.active');
      expect(activeBars.length).toBe(1);
    });

    it('should show 3 bars at exactly 9.99m (boundary test)', () => {
      component.gpsAccuracy = 9.99;
      fixture.detectChanges();

      const activeBars = fixture.nativeElement.querySelectorAll('.signal-bar.active');
      expect(activeBars.length).toBe(3);
    });

    it('should show 2 bars at exactly 10m (boundary test)', () => {
      component.gpsAccuracy = 10;
      fixture.detectChanges();

      const activeBars = fixture.nativeElement.querySelectorAll('.signal-bar.active');
      expect(activeBars.length).toBe(2);
    });

    it('should show 2 bars at exactly 30m (boundary test)', () => {
      component.gpsAccuracy = 30;
      fixture.detectChanges();

      const activeBars = fixture.nativeElement.querySelectorAll('.signal-bar.active');
      expect(activeBars.length).toBe(2);
    });

    it('should show 1 bar at exactly 30.01m (boundary test)', () => {
      component.gpsAccuracy = 30.01;
      fixture.detectChanges();

      const activeBars = fixture.nativeElement.querySelectorAll('.signal-bar.active');
      expect(activeBars.length).toBe(1);
    });

    it('should have aria-label for GPS indicator with no signal', () => {
      component.gpsAccuracy = null;
      fixture.detectChanges();

      const gpsIndicator = fixture.nativeElement.querySelector('.gps-indicator');
      expect(gpsIndicator.getAttribute('aria-label')).toBe('GPS signal: No signal');
    });

    it('should have aria-label for GPS indicator with strong signal', () => {
      component.gpsAccuracy = 5;
      fixture.detectChanges();

      const gpsIndicator = fixture.nativeElement.querySelector('.gps-indicator');
      expect(gpsIndicator.getAttribute('aria-label')).toBe('GPS signal: Strong (accuracy 5m)');
    });

    it('should have aria-label for GPS indicator with medium signal', () => {
      component.gpsAccuracy = 20;
      fixture.detectChanges();

      const gpsIndicator = fixture.nativeElement.querySelector('.gps-indicator');
      expect(gpsIndicator.getAttribute('aria-label')).toBe('GPS signal: Medium (accuracy 20m)');
    });

    it('should have aria-label for GPS indicator with weak signal', () => {
      component.gpsAccuracy = 50;
      fixture.detectChanges();

      const gpsIndicator = fixture.nativeElement.querySelector('.gps-indicator');
      expect(gpsIndicator.getAttribute('aria-label')).toBe('GPS signal: Weak (accuracy 50m)');
    });
  });

  describe('Connection Status Indicator', () => {
    it('should show online indicator when isOnline is true', () => {
      component.isOnline = true;
      fixture.detectChanges();

      const connectionIndicator = fixture.nativeElement.querySelector('.connection-indicator');
      expect(connectionIndicator.getAttribute('aria-label')).toBe('Network status: Online');
    });

    it('should show offline indicator when isOnline is false', () => {
      component.isOnline = false;
      fixture.detectChanges();

      const connectionIndicator = fixture.nativeElement.querySelector('.connection-indicator');
      expect(connectionIndicator.getAttribute('aria-label')).toBe('Network status: Offline');
    });

    it('should default to online state', () => {
      // Create a fresh component without setting isOnline
      const freshFixture = TestBed.createComponent(StatusIndicatorsComponent);
      freshFixture.detectChanges();

      const connectionIndicator = freshFixture.nativeElement.querySelector('.connection-indicator');
      expect(connectionIndicator.getAttribute('aria-label')).toBe('Network status: Online');
    });
  });

  describe('Wake Lock Indicator', () => {
    it('should show active indicator when wakeLockActive is true', () => {
      component.wakeLockActive = true;
      fixture.detectChanges();

      const wakeLockIndicator = fixture.nativeElement.querySelector('.wake-lock-indicator');
      expect(wakeLockIndicator.getAttribute('aria-label')).toBe('Screen wake lock: Active - screen will stay on');
    });

    it('should show inactive indicator when wakeLockActive is false', () => {
      component.wakeLockActive = false;
      fixture.detectChanges();

      const wakeLockIndicator = fixture.nativeElement.querySelector('.wake-lock-indicator');
      expect(wakeLockIndicator.getAttribute('aria-label')).toBe('Screen wake lock: Inactive - screen may turn off');
    });

    it('should default to inactive state', () => {
      // Create a fresh component without setting wakeLockActive
      const freshFixture = TestBed.createComponent(StatusIndicatorsComponent);
      freshFixture.detectChanges();

      const wakeLockIndicator = freshFixture.nativeElement.querySelector('.wake-lock-indicator');
      expect(wakeLockIndicator.getAttribute('aria-label')).toBe('Screen wake lock: Inactive - screen may turn off');
    });
  });

  describe('Accessibility', () => {
    it('should have role="status" on the container', () => {
      const container = fixture.nativeElement.querySelector('.status-indicators');
      expect(container.getAttribute('role')).toBe('status');
    });

    it('should have aria-label on the container', () => {
      const container = fixture.nativeElement.querySelector('.status-indicators');
      expect(container.getAttribute('aria-label')).toBe('Status indicators');
    });

    it('should have role="img" on all status items', () => {
      const statusItems = fixture.nativeElement.querySelectorAll('.status-item');
      statusItems.forEach((item: Element) => {
        expect(item.getAttribute('role')).toBe('img');
      });
    });

    it('should have aria-hidden="true" on all SVG icons', () => {
      const svgIcons = fixture.nativeElement.querySelectorAll('.status-icon');
      svgIcons.forEach((icon: Element) => {
        expect(icon.getAttribute('aria-hidden')).toBe('true');
      });
    });

    it('should have aria-hidden="true" on signal bars container', () => {
      const signalBars = fixture.nativeElement.querySelector('.signal-bars');
      expect(signalBars.getAttribute('aria-hidden')).toBe('true');
    });
  });
});

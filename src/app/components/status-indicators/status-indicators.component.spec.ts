import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusIndicatorsComponent } from './status-indicators.component';

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

  describe('GPS Indicator Rendering', () => {
    it('should render only one status item', () => {
      const statusItems = fixture.nativeElement.querySelectorAll('.status-item');
      expect(statusItems.length).toBe(1);
    });

    it('should not render removed indicators', () => {
      expect(fixture.nativeElement.querySelector('.connection-indicator')).toBeNull();
      expect(fixture.nativeElement.querySelector('.wake-lock-indicator')).toBeNull();
      expect(fixture.nativeElement.querySelector('.signal-bars')).toBeNull();
    });

    it('should show "GPS No signal" and red color when gpsAccuracy is null', () => {
      component.gpsAccuracy = null;
      fixture.detectChanges();

      const gpsText = fixture.nativeElement.querySelector('.gps-text');
      const iconPath = fixture.nativeElement.querySelector('.gps-indicator .status-icon path');
      expect(gpsText.textContent.trim()).toBe('GPS No signal');
      expect(gpsText.style.color).toBe('var(--color-danger)');
      expect(iconPath.getAttribute('fill')).toBe('var(--color-danger)');
    });

    it('should show "GPS Weak" and warning color when gpsAccuracy is greater than 30m', () => {
      component.gpsAccuracy = 50;
      fixture.detectChanges();

      const gpsText = fixture.nativeElement.querySelector('.gps-text');
      expect(gpsText.textContent.trim()).toBe('GPS Weak');
      expect(gpsText.style.color).toBe('var(--color-warning)');
    });

    it('should show "GPS Medium" at 10m and 30m boundaries', () => {
      component.gpsAccuracy = 10;
      fixture.detectChanges();
      let gpsText = fixture.nativeElement.querySelector('.gps-text');
      expect(gpsText.textContent.trim()).toBe('GPS Medium');

      component.gpsAccuracy = 30;
      fixture.detectChanges();
      gpsText = fixture.nativeElement.querySelector('.gps-text');
      expect(gpsText.textContent.trim()).toBe('GPS Medium');
    });

    it('should show "GPS Strong" and safe color when gpsAccuracy is less than 10m', () => {
      component.gpsAccuracy = 5;
      fixture.detectChanges();

      const gpsText = fixture.nativeElement.querySelector('.gps-text');
      const iconPath = fixture.nativeElement.querySelector('.gps-indicator .status-icon path');
      expect(gpsText.textContent.trim()).toBe('GPS Strong');
      expect(gpsText.style.color).toBe('var(--color-safe)');
      expect(iconPath.getAttribute('fill')).toBe('var(--color-safe)');
    });
  });

  describe('Accessibility', () => {
    it('should have role="status" and aria-live="polite" on container', () => {
      const container = fixture.nativeElement.querySelector('.status-indicators');
      expect(container.getAttribute('role')).toBe('status');
      expect(container.getAttribute('aria-live')).toBe('polite');
      expect(container.getAttribute('aria-label')).toBe('Status indicators');
    });

    it('should have role="img" and descriptive aria-label on GPS indicator', () => {
      component.gpsAccuracy = 20;
      fixture.detectChanges();

      const gpsIndicator = fixture.nativeElement.querySelector('.gps-indicator');
      expect(gpsIndicator.getAttribute('role')).toBe('img');
      expect(gpsIndicator.getAttribute('aria-label')).toBe('GPS signal: Medium (accuracy 20m)');
    });

    it('should set aria-hidden="true" on the SVG icon', () => {
      const icon = fixture.nativeElement.querySelector('.gps-indicator .status-icon');
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    });
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as fc from 'fast-check';
import { StatusIndicatorsComponent } from './status-indicators.component';

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

  describe('GPS-only indicator properties', () => {
    it('should always keep exactly one status item rendered', () => {
      fc.assert(
        fc.property(
          fc.record({
            gpsAccuracy: fc.option(fc.float({ min: 0, max: 100, noNaN: true }), { nil: null }),
            isOnline: fc.boolean(),
            wakeLockActive: fc.boolean()
          }),
          ({ gpsAccuracy, isOnline, wakeLockActive }) => {
            component.gpsAccuracy = gpsAccuracy;
            component.isOnline = isOnline;
            component.wakeLockActive = wakeLockActive;
            fixture.detectChanges();

            const statusItems = fixture.nativeElement.querySelectorAll('.status-item');
            expect(statusItems.length).toBe(1);
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should never render connection or wake lock indicators', () => {
      fc.assert(
        fc.property(
          fc.record({
            gpsAccuracy: fc.option(fc.float({ min: 0, max: 100, noNaN: true }), { nil: null }),
            isOnline: fc.boolean(),
            wakeLockActive: fc.boolean()
          }),
          ({ gpsAccuracy, isOnline, wakeLockActive }) => {
            component.gpsAccuracy = gpsAccuracy;
            component.isOnline = isOnline;
            component.wakeLockActive = wakeLockActive;
            fixture.detectChanges();

            const connectionIndicator = fixture.nativeElement.querySelector('.connection-indicator');
            const wakeLockIndicator = fixture.nativeElement.querySelector('.wake-lock-indicator');
            const signalBars = fixture.nativeElement.querySelector('.signal-bars');

            expect(connectionIndicator).toBeNull();
            expect(wakeLockIndicator).toBeNull();
            expect(signalBars).toBeNull();
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always expose a non-empty GPS aria-label containing "GPS"', () => {
      fc.assert(
        fc.property(
          fc.option(fc.float({ min: 0, max: 100, noNaN: true }), { nil: null }),
          (gpsAccuracy: number | null) => {
            component.gpsAccuracy = gpsAccuracy;
            fixture.detectChanges();

            const gpsIndicator = fixture.nativeElement.querySelector('.gps-indicator');
            const ariaLabel = gpsIndicator?.getAttribute('aria-label');

            expect(Boolean(ariaLabel && ariaLabel.length > 0 && ariaLabel.toLowerCase().includes('gps'))).toBeTrue();
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should map gpsAccuracy to the expected text label deterministically', () => {
      fc.assert(
        fc.property(
          fc.option(fc.float({ min: 0, max: 100, noNaN: true }), { nil: null }),
          (gpsAccuracy: number | null) => {
            component.gpsAccuracy = gpsAccuracy;
            fixture.detectChanges();
            const label = fixture.nativeElement.querySelector('.gps-text')?.textContent.trim();

            let expected = 'GPS No signal';
            if (gpsAccuracy !== null && gpsAccuracy < 10) {
              expected = 'GPS Strong';
            } else if (gpsAccuracy !== null && gpsAccuracy <= 30) {
              expected = 'GPS Medium';
            } else if (gpsAccuracy !== null) {
              expected = 'GPS Weak';
            }

            expect(label).toBe(expected);
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should keep container accessibility attributes stable for any inputs', () => {
      fc.assert(
        fc.property(
          fc.record({
            gpsAccuracy: fc.option(fc.float({ min: 0, max: 100, noNaN: true }), { nil: null }),
            isOnline: fc.boolean(),
            wakeLockActive: fc.boolean()
          }),
          ({ gpsAccuracy, isOnline, wakeLockActive }) => {
            component.gpsAccuracy = gpsAccuracy;
            component.isOnline = isOnline;
            component.wakeLockActive = wakeLockActive;
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.status-indicators');
            expect(container.getAttribute('role')).toBe('status');
            expect(container.getAttribute('aria-live')).toBe('polite');
            expect(container.getAttribute('aria-label')).toBe('Status indicators');
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

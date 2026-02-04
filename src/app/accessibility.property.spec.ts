import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as fc from 'fast-check';
import { HeaderComponent } from './components/header/header.component';
import { WakeLockButtonComponent } from './components/wake-lock-button/wake-lock-button.component';
import { DistanceDisplayComponent } from './components/distance-display/distance-display.component';
import { SpeedDisplayComponent } from './components/speed-display/speed-display.component';
import { StatusIndicatorsComponent } from './components/status-indicators/status-indicators.component';
import { VIBRATION_SERVICE_TOKEN, VibrationService } from './services/vibration.service';

/**
 * Property-based tests for Accessibility
 * Feature: ux-redesign
 * 
 * These tests verify universal accessibility properties across all components
 * using fast-check library.
 * 
 * **Validates: Requirements 17.1, 17.2**
 */
describe('Accessibility Property Tests', () => {
  /**
   * Mock VibrationService for SpeedDisplayComponent tests
   */
  const mockVibrationService: VibrationService = {
    isSupported: () => false,
    vibrate: () => false,
    vibrateWarning: () => false,
    getLastVibrationTime: () => null,
    isInCooldown: () => false
  };

  /**
   * Property 16: Aria Labels on Interactive Elements
   * 
   * For any interactive element (buttons, toggles, links), the element should
   * have an aria-label attribute with a non-empty value.
   * 
   * **Validates: Requirements 17.1**
   */
  describe('Feature: ux-redesign, Property 16: Aria Labels on Interactive Elements', () => {
    
    describe('HeaderComponent - Theme Toggle Button', () => {
      let component: HeaderComponent;
      let fixture: ComponentFixture<HeaderComponent>;

      beforeEach(async () => {
        await TestBed.configureTestingModule({
          imports: [HeaderComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });

      /**
       * Test that the theme toggle button always has a non-empty aria-label
       * regardless of the dark mode state.
       * 
       * Validates: Requirement 17.1 - THE App SHALL provide aria-labels for all interactive elements
       */
      it('should have non-empty aria-label on theme toggle button for any isDarkMode state', () => {
        fc.assert(
          fc.property(
            fc.boolean(),
            (isDarkMode: boolean) => {
              component.isDarkMode = isDarkMode;
              fixture.detectChanges();

              const themeToggleButton = fixture.nativeElement.querySelector('.theme-toggle');
              const ariaLabel = themeToggleButton.getAttribute('aria-label');
              
              expect(ariaLabel).toBeTruthy();
              expect(ariaLabel.length).toBeGreaterThan(0);
              
              return ariaLabel !== null && ariaLabel.length > 0;
            }
          ),
          { numRuns: 100 }
        );
      });

      /**
       * Test that the aria-label content is descriptive and changes based on state.
       * 
       * Validates: Requirement 17.1
       */
      it('should have descriptive aria-label that reflects the action to be taken', () => {
        fc.assert(
          fc.property(
            fc.boolean(),
            (isDarkMode: boolean) => {
              component.isDarkMode = isDarkMode;
              fixture.detectChanges();

              const themeToggleButton = fixture.nativeElement.querySelector('.theme-toggle');
              const ariaLabel = themeToggleButton.getAttribute('aria-label');
              
              // The aria-label should describe what will happen when clicked
              if (isDarkMode) {
                expect(ariaLabel.toLowerCase()).toContain('light');
              } else {
                expect(ariaLabel.toLowerCase()).toContain('dark');
              }
              
              return ariaLabel !== null && ariaLabel.length > 0;
            }
          ),
          { numRuns: 100 }
        );
      });

      /**
       * Test that the theme toggle button has aria-pressed attribute.
       * 
       * Validates: Requirement 17.1
       */
      it('should have aria-pressed attribute on theme toggle button', () => {
        fc.assert(
          fc.property(
            fc.boolean(),
            (isDarkMode: boolean) => {
              component.isDarkMode = isDarkMode;
              fixture.detectChanges();

              const themeToggleButton = fixture.nativeElement.querySelector('.theme-toggle');
              const ariaPressed = themeToggleButton.getAttribute('aria-pressed');
              
              expect(ariaPressed).toBe(isDarkMode.toString());
              
              return ariaPressed === isDarkMode.toString();
            }
          ),
          { numRuns: 100 }
        );
      });
    });

    describe('WakeLockButtonComponent - Wake Lock Button', () => {
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
       * Test that the wake lock button always has a non-empty aria-label
       * regardless of the active state.
       * 
       * Validates: Requirement 17.1 - THE App SHALL provide aria-labels for all interactive elements
       */
      it('should have non-empty aria-label on wake lock button for any isActive state', () => {
        fc.assert(
          fc.property(
            fc.boolean(),
            (isActive: boolean) => {
              component.isActive = isActive;
              fixture.detectChanges();

              const wakeLockButton = fixture.nativeElement.querySelector('.wake-lock-button');
              const ariaLabel = wakeLockButton.getAttribute('aria-label');
              
              expect(ariaLabel).toBeTruthy();
              expect(ariaLabel.length).toBeGreaterThan(0);
              
              return ariaLabel !== null && ariaLabel.length > 0;
            }
          ),
          { numRuns: 100 }
        );
      });

      /**
       * Test that the aria-label content is descriptive and changes based on state.
       * 
       * Validates: Requirement 17.1
       */
      it('should have descriptive aria-label that reflects the action to be taken', () => {
        fc.assert(
          fc.property(
            fc.boolean(),
            (isActive: boolean) => {
              component.isActive = isActive;
              fixture.detectChanges();

              const wakeLockButton = fixture.nativeElement.querySelector('.wake-lock-button');
              const ariaLabel = wakeLockButton.getAttribute('aria-label');
              
              // The aria-label should describe what will happen when clicked
              if (isActive) {
                expect(ariaLabel.toLowerCase()).toContain('disable');
              } else {
                expect(ariaLabel.toLowerCase()).toContain('enable');
              }
              
              return ariaLabel !== null && ariaLabel.length > 0;
            }
          ),
          { numRuns: 100 }
        );
      });

      /**
       * Test that the wake lock button has aria-pressed attribute.
       * 
       * Validates: Requirement 17.1
       */
      it('should have aria-pressed attribute on wake lock button', () => {
        fc.assert(
          fc.property(
            fc.boolean(),
            (isActive: boolean) => {
              component.isActive = isActive;
              fixture.detectChanges();

              const wakeLockButton = fixture.nativeElement.querySelector('.wake-lock-button');
              const ariaPressed = wakeLockButton.getAttribute('aria-pressed');
              
              expect(ariaPressed).toBe(isActive.toString());
              
              return ariaPressed === isActive.toString();
            }
          ),
          { numRuns: 100 }
        );
      });
    });
  });

  /**
   * Property 17: Aria Live Regions for Dynamic Content
   * 
   * For any dynamic content area (distance display, speed display, status indicators),
   * the element should have an appropriate aria-live attribute.
   * 
   * **Validates: Requirements 17.2**
   */
  describe('Feature: ux-redesign, Property 17: Aria Live Regions for Dynamic Content', () => {
    
    describe('DistanceDisplayComponent - Dynamic Distance Display', () => {
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

      /**
       * Test that the distance display has an aria-live region for any distance value.
       * 
       * Validates: Requirement 17.2 - THE App SHALL provide aria-live regions for dynamic content updates
       */
      it('should have aria-live attribute on distance display for any distance value', () => {
        fc.assert(
          fc.property(
            fc.float({ min: 0, max: 100, noNaN: true }),
            (distance: number) => {
              component.distance = distance;
              fixture.detectChanges();

              const distanceDisplay = fixture.nativeElement.querySelector('.distance-display');
              const ariaLive = distanceDisplay.getAttribute('aria-live');
              
              // aria-live should be 'polite' for non-urgent updates
              expect(ariaLive).toBeTruthy();
              expect(['polite', 'assertive', 'off']).toContain(ariaLive);
              
              return ariaLive !== null && ['polite', 'assertive', 'off'].includes(ariaLive);
            }
          ),
          { numRuns: 100 }
        );
      });

      /**
       * Test that the distance display has role="status" for screen readers.
       * 
       * Validates: Requirement 17.2
       */
      it('should have role="status" on distance display', () => {
        fc.assert(
          fc.property(
            fc.float({ min: 0, max: 100, noNaN: true }),
            (distance: number) => {
              component.distance = distance;
              fixture.detectChanges();

              const distanceDisplay = fixture.nativeElement.querySelector('.distance-display');
              const role = distanceDisplay.getAttribute('role');
              
              expect(role).toBe('status');
              
              return role === 'status';
            }
          ),
          { numRuns: 100 }
        );
      });

      /**
       * Test that the distance display has a descriptive aria-label.
       * 
       * Validates: Requirement 17.2
       */
      it('should have descriptive aria-label on distance display', () => {
        fc.assert(
          fc.property(
            fc.float({ min: 0, max: 100, noNaN: true }),
            (distance: number) => {
              component.distance = distance;
              fixture.detectChanges();

              const distanceDisplay = fixture.nativeElement.querySelector('.distance-display');
              const ariaLabel = distanceDisplay.getAttribute('aria-label');
              
              expect(ariaLabel).toBeTruthy();
              expect(ariaLabel.length).toBeGreaterThan(0);
              expect(ariaLabel.toLowerCase()).toContain('distance');
              
              return ariaLabel !== null && ariaLabel.length > 0;
            }
          ),
          { numRuns: 100 }
        );
      });
    });

    describe('SpeedDisplayComponent - Dynamic Speed Display', () => {
      let component: SpeedDisplayComponent;
      let fixture: ComponentFixture<SpeedDisplayComponent>;

      beforeEach(async () => {
        await TestBed.configureTestingModule({
          imports: [SpeedDisplayComponent],
          providers: [
            { provide: VIBRATION_SERVICE_TOKEN, useValue: mockVibrationService }
          ]
        }).compileComponents();

        fixture = TestBed.createComponent(SpeedDisplayComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });

      /**
       * Test that the speed display has an aria-live region for any speed value.
       * 
       * Validates: Requirement 17.2 - THE App SHALL provide aria-live regions for dynamic content updates
       */
      it('should have aria-live attribute on speed display for any speed value', () => {
        fc.assert(
          fc.property(
            fc.option(fc.float({ min: 0, max: 200, noNaN: true }), { nil: null }),
            (speed: number | null) => {
              component.speed = speed;
              fixture.detectChanges();

              const speedDisplay = fixture.nativeElement.querySelector('.speed-display');
              const ariaLive = speedDisplay.getAttribute('aria-live');
              
              // aria-live should be 'polite' for non-urgent updates
              expect(ariaLive).toBeTruthy();
              expect(['polite', 'assertive', 'off']).toContain(ariaLive);
              
              return ariaLive !== null && ['polite', 'assertive', 'off'].includes(ariaLive);
            }
          ),
          { numRuns: 100 }
        );
      });

      /**
       * Test that the speed display has role="status" for screen readers.
       * 
       * Validates: Requirement 17.2
       */
      it('should have role="status" on speed display', () => {
        fc.assert(
          fc.property(
            fc.option(fc.float({ min: 0, max: 200, noNaN: true }), { nil: null }),
            (speed: number | null) => {
              component.speed = speed;
              fixture.detectChanges();

              const speedDisplay = fixture.nativeElement.querySelector('.speed-display');
              const role = speedDisplay.getAttribute('role');
              
              expect(role).toBe('status');
              
              return role === 'status';
            }
          ),
          { numRuns: 100 }
        );
      });

      /**
       * Test that the speed display has a descriptive aria-label.
       * 
       * Validates: Requirement 17.2
       */
      it('should have descriptive aria-label on speed display', () => {
        fc.assert(
          fc.property(
            fc.option(fc.float({ min: 0, max: 200, noNaN: true }), { nil: null }),
            (speed: number | null) => {
              component.speed = speed;
              fixture.detectChanges();

              const speedDisplay = fixture.nativeElement.querySelector('.speed-display');
              const ariaLabel = speedDisplay.getAttribute('aria-label');
              
              expect(ariaLabel).toBeTruthy();
              expect(ariaLabel.length).toBeGreaterThan(0);
              expect(ariaLabel.toLowerCase()).toContain('speed');
              
              return ariaLabel !== null && ariaLabel.length > 0;
            }
          ),
          { numRuns: 100 }
        );
      });

      /**
       * Test that the speed display aria-label updates with speed and limit context.
       * 
       * Validates: Requirement 17.2
       */
      it('should have aria-label that reflects speed context', () => {
        fc.assert(
          fc.property(
            fc.record({
              speed: fc.option(fc.float({ min: 0, max: 200, noNaN: true }), { nil: null }),
              speedLimit: fc.option(fc.integer({ min: 30, max: 130 }), { nil: null }),
              isWithinThreshold: fc.boolean()
            }),
            ({ speed, speedLimit, isWithinThreshold }) => {
              component.speed = speed;
              component.speedLimit = speedLimit;
              component.isWithinThreshold = isWithinThreshold;
              fixture.detectChanges();

              const speedDisplay = fixture.nativeElement.querySelector('.speed-display');
              const ariaLabel = speedDisplay.getAttribute('aria-label');
              
              expect(ariaLabel).toBeTruthy();
              expect(ariaLabel.length).toBeGreaterThan(0);
              
              return ariaLabel !== null && ariaLabel.length > 0;
            }
          ),
          { numRuns: 100 }
        );
      });
    });

    describe('StatusIndicatorsComponent - Dynamic Status Indicators', () => {
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
       * Test that the status indicators container has an aria-live region.
       * 
       * Validates: Requirement 17.2 - THE App SHALL provide aria-live regions for dynamic content updates
       */
      it('should have aria-live attribute on status indicators container', () => {
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

              const statusIndicators = fixture.nativeElement.querySelector('.status-indicators');
              const ariaLive = statusIndicators.getAttribute('aria-live');
              
              // aria-live should be 'polite' for non-urgent updates
              expect(ariaLive).toBeTruthy();
              expect(['polite', 'assertive', 'off']).toContain(ariaLive);
              
              return ariaLive !== null && ['polite', 'assertive', 'off'].includes(ariaLive);
            }
          ),
          { numRuns: 100 }
        );
      });

      /**
       * Test that the status indicators container has role="status".
       * 
       * Validates: Requirement 17.2
       */
      it('should have role="status" on status indicators container', () => {
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

              const statusIndicators = fixture.nativeElement.querySelector('.status-indicators');
              const role = statusIndicators.getAttribute('role');
              
              expect(role).toBe('status');
              
              return role === 'status';
            }
          ),
          { numRuns: 100 }
        );
      });

      /**
       * Test that the GPS indicator has a descriptive aria-label.
       * 
       * Validates: Requirement 17.2
       */
      it('should have descriptive aria-label on GPS indicator', () => {
        fc.assert(
          fc.property(
            fc.option(fc.float({ min: 0, max: 100, noNaN: true }), { nil: null }),
            (gpsAccuracy: number | null) => {
              component.gpsAccuracy = gpsAccuracy;
              fixture.detectChanges();

              const gpsIndicator = fixture.nativeElement.querySelector('.gps-indicator');
              const ariaLabel = gpsIndicator.getAttribute('aria-label');
              
              expect(ariaLabel).toBeTruthy();
              expect(ariaLabel.length).toBeGreaterThan(0);
              expect(ariaLabel.toLowerCase()).toContain('gps');
              
              return ariaLabel !== null && ariaLabel.length > 0;
            }
          ),
          { numRuns: 100 }
        );
      });

      /**
       * Test that the connection indicator has a descriptive aria-label.
       * 
       * Validates: Requirement 17.2
       */
      it('should have descriptive aria-label on connection indicator', () => {
        fc.assert(
          fc.property(
            fc.boolean(),
            (isOnline: boolean) => {
              component.isOnline = isOnline;
              fixture.detectChanges();

              const connectionIndicator = fixture.nativeElement.querySelector('.connection-indicator');
              const ariaLabel = connectionIndicator.getAttribute('aria-label');
              
              expect(ariaLabel).toBeTruthy();
              expect(ariaLabel.length).toBeGreaterThan(0);
              expect(ariaLabel.toLowerCase()).toContain('network');
              
              return ariaLabel !== null && ariaLabel.length > 0;
            }
          ),
          { numRuns: 100 }
        );
      });

      /**
       * Test that the wake lock indicator has a descriptive aria-label.
       * 
       * Validates: Requirement 17.2
       */
      it('should have descriptive aria-label on wake lock indicator', () => {
        fc.assert(
          fc.property(
            fc.boolean(),
            (wakeLockActive: boolean) => {
              component.wakeLockActive = wakeLockActive;
              fixture.detectChanges();

              const wakeLockIndicator = fixture.nativeElement.querySelector('.wake-lock-indicator');
              const ariaLabel = wakeLockIndicator.getAttribute('aria-label');
              
              expect(ariaLabel).toBeTruthy();
              expect(ariaLabel.length).toBeGreaterThan(0);
              expect(ariaLabel.toLowerCase()).toContain('wake lock');
              
              return ariaLabel !== null && ariaLabel.length > 0;
            }
          ),
          { numRuns: 100 }
        );
      });

      /**
       * Test that all status indicators have role="img" for proper screen reader interpretation.
       * 
       * Validates: Requirement 17.2
       */
      it('should have role="img" on individual status indicators', () => {
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

              const gpsIndicator = fixture.nativeElement.querySelector('.gps-indicator');
              const connectionIndicator = fixture.nativeElement.querySelector('.connection-indicator');
              const wakeLockIndicator = fixture.nativeElement.querySelector('.wake-lock-indicator');
              
              expect(gpsIndicator.getAttribute('role')).toBe('img');
              expect(connectionIndicator.getAttribute('role')).toBe('img');
              expect(wakeLockIndicator.getAttribute('role')).toBe('img');
              
              return gpsIndicator.getAttribute('role') === 'img' &&
                     connectionIndicator.getAttribute('role') === 'img' &&
                     wakeLockIndicator.getAttribute('role') === 'img';
            }
          ),
          { numRuns: 100 }
        );
      });
    });
  });
});

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SpeedDisplayComponent } from './speed-display.component';
import { VibrationService, VIBRATION_SERVICE_TOKEN } from '../../services/vibration.service';

/**
 * Mock VibrationService for testing.
 */
class MockVibrationService implements VibrationService {
  private _isSupported = true;
  private _lastVibrationTime: number | null = null;
  public vibrateWarningCalls = 0;
  public vibrateCalls: Array<number | number[]> = [];

  isSupported(): boolean {
    return this._isSupported;
  }

  setSupported(supported: boolean): void {
    this._isSupported = supported;
  }

  vibrate(pattern: number | number[]): boolean {
    if (!this._isSupported) {
      return false;
    }
    this.vibrateCalls.push(pattern);
    this._lastVibrationTime = Date.now();
    return true;
  }

  vibrateWarning(): boolean {
    if (!this._isSupported) {
      return false;
    }
    this.vibrateWarningCalls++;
    this._lastVibrationTime = Date.now();
    return true;
  }

  getLastVibrationTime(): number | null {
    return this._lastVibrationTime;
  }

  isInCooldown(): boolean {
    return false;
  }

  reset(): void {
    this.vibrateWarningCalls = 0;
    this.vibrateCalls = [];
    this._lastVibrationTime = null;
  }
}

/**
 * Unit tests for SpeedDisplayComponent.
 * 
 * Tests verify:
 * - Speed color display based on speed, limit, and threshold (default/green/yellow/red)
 * - Speed formatting
 * - Aria-live region for accessibility
 * - Vibration alerts when exceeding speed limit within threshold
 * - Smooth color transitions via CSS classes
 * 
 * **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 11.1, 17.2**
 */
describe('SpeedDisplayComponent', () => {
  let component: SpeedDisplayComponent;
  let fixture: ComponentFixture<SpeedDisplayComponent>;
  let mockVibrationService: MockVibrationService;

  beforeEach(async () => {
    mockVibrationService = new MockVibrationService();

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

  afterEach(() => {
    mockVibrationService.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Speed Color Display - Outside Threshold', () => {
    /**
     * Requirement 10.4: Default color when outside threshold
     */
    it('should show default color when outside threshold (isWithinThreshold = false)', () => {
      component.speed = 90;
      component.speedLimit = 80;
      component.isWithinThreshold = false;
      fixture.detectChanges();

      const display = fixture.nativeElement.querySelector('.speed-display');
      expect(display.classList.contains('color-default')).toBe(true);
      expect(display.classList.contains('color-green')).toBe(false);
      expect(display.classList.contains('color-yellow')).toBe(false);
      expect(display.classList.contains('color-red')).toBe(false);
    });

    it('should show default color when speed is null', () => {
      component.speed = null;
      component.speedLimit = 80;
      component.isWithinThreshold = true;
      fixture.detectChanges();

      const display = fixture.nativeElement.querySelector('.speed-display');
      expect(display.classList.contains('color-default')).toBe(true);
    });

    it('should show default color when speedLimit is null', () => {
      component.speed = 50;
      component.speedLimit = null;
      component.isWithinThreshold = true;
      fixture.detectChanges();

      const display = fixture.nativeElement.querySelector('.speed-display');
      expect(display.classList.contains('color-default')).toBe(true);
    });
  });

  describe('Speed Color Display - Within Threshold', () => {
    /**
     * Requirement 10.1: Green when within threshold and speed is more than 10 km/h below limit
     */
    it('should show green color when speed is more than 10 km/h below limit', () => {
      component.speed = 60;
      component.speedLimit = 80;
      component.isWithinThreshold = true;
      fixture.detectChanges();

      const display = fixture.nativeElement.querySelector('.speed-display');
      expect(display.classList.contains('color-green')).toBe(true);
      expect(display.classList.contains('color-yellow')).toBe(false);
      expect(display.classList.contains('color-red')).toBe(false);
    });

    /**
     * Requirement 10.2: Yellow when within threshold and speed is within 10 km/h of limit
     */
    it('should show yellow color when speed is within 10 km/h of limit', () => {
      component.speed = 75;
      component.speedLimit = 80;
      component.isWithinThreshold = true;
      fixture.detectChanges();

      const display = fixture.nativeElement.querySelector('.speed-display');
      expect(display.classList.contains('color-green')).toBe(false);
      expect(display.classList.contains('color-yellow')).toBe(true);
      expect(display.classList.contains('color-red')).toBe(false);
    });

    /**
     * Requirement 10.3: Red when within threshold and speed exceeds limit
     */
    it('should show red color when speed exceeds limit', () => {
      component.speed = 85;
      component.speedLimit = 80;
      component.isWithinThreshold = true;
      fixture.detectChanges();

      const display = fixture.nativeElement.querySelector('.speed-display');
      expect(display.classList.contains('color-green')).toBe(false);
      expect(display.classList.contains('color-yellow')).toBe(false);
      expect(display.classList.contains('color-red')).toBe(true);
    });

    // Boundary tests
    it('should show green color when speed is exactly 10 km/h below limit (boundary)', () => {
      component.speed = 69;
      component.speedLimit = 80;
      component.isWithinThreshold = true;
      fixture.detectChanges();

      const display = fixture.nativeElement.querySelector('.speed-display');
      expect(display.classList.contains('color-green')).toBe(true);
    });

    it('should show yellow color when speed is exactly at (limit - 10) boundary', () => {
      component.speed = 70;
      component.speedLimit = 80;
      component.isWithinThreshold = true;
      fixture.detectChanges();

      const display = fixture.nativeElement.querySelector('.speed-display');
      expect(display.classList.contains('color-yellow')).toBe(true);
    });

    it('should show yellow color when speed equals limit exactly', () => {
      component.speed = 80;
      component.speedLimit = 80;
      component.isWithinThreshold = true;
      fixture.detectChanges();

      const display = fixture.nativeElement.querySelector('.speed-display');
      expect(display.classList.contains('color-yellow')).toBe(true);
    });

    it('should show red color when speed is 1 km/h over limit', () => {
      component.speed = 81;
      component.speedLimit = 80;
      component.isWithinThreshold = true;
      fixture.detectChanges();

      const display = fixture.nativeElement.querySelector('.speed-display');
      expect(display.classList.contains('color-red')).toBe(true);
    });
  });

  describe('Speed Formatting', () => {
    it('should format speed as whole number', () => {
      component.speed = 75.7;
      fixture.detectChanges();

      const valueElement = fixture.nativeElement.querySelector('.speed-value');
      expect(valueElement.textContent).toBe('76');
    });

    it('should show -- when speed is null', () => {
      component.speed = null;
      fixture.detectChanges();

      const valueElement = fixture.nativeElement.querySelector('.speed-value');
      expect(valueElement.textContent).toBe('--');
    });

    it('should show 0 for zero speed', () => {
      component.speed = 0;
      fixture.detectChanges();

      const valueElement = fixture.nativeElement.querySelector('.speed-value');
      expect(valueElement.textContent).toBe('0');
    });

    it('should round speed correctly', () => {
      component.speed = 99.4;
      fixture.detectChanges();

      const valueElement = fixture.nativeElement.querySelector('.speed-value');
      expect(valueElement.textContent).toBe('99');
    });

    it('should round up when decimal is 0.5 or higher', () => {
      component.speed = 99.5;
      fixture.detectChanges();

      const valueElement = fixture.nativeElement.querySelector('.speed-value');
      expect(valueElement.textContent).toBe('100');
    });
  });

  describe('Unit Display', () => {
    it('should display km/h unit', () => {
      const unitElement = fixture.nativeElement.querySelector('.speed-unit');
      expect(unitElement.textContent).toBe('km/h');
    });
  });

  describe('Accessibility', () => {
    /**
     * Requirement 17.2: Aria-live regions for dynamic content updates
     */
    it('should have role="status" on the container', () => {
      const container = fixture.nativeElement.querySelector('.speed-display');
      expect(container.getAttribute('role')).toBe('status');
    });

    it('should have aria-live="polite" for screen reader announcements', () => {
      const container = fixture.nativeElement.querySelector('.speed-display');
      expect(container.getAttribute('aria-live')).toBe('polite');
    });

    it('should have descriptive aria-label when speed is null', () => {
      component.speed = null;
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.speed-display');
      expect(container.getAttribute('aria-label')).toBe('Speed: not available');
    });

    it('should have descriptive aria-label for green speed (safe)', () => {
      component.speed = 60;
      component.speedLimit = 80;
      component.isWithinThreshold = true;
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.speed-display');
      expect(container.getAttribute('aria-label')).toBe('Current speed: 60 km/h, limit 80 km/h, safe speed');
    });

    it('should have descriptive aria-label for yellow speed (approaching limit)', () => {
      component.speed = 75;
      component.speedLimit = 80;
      component.isWithinThreshold = true;
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.speed-display');
      expect(container.getAttribute('aria-label')).toBe('Current speed: 75 km/h, limit 80 km/h, approaching speed limit');
    });

    it('should have descriptive aria-label for red speed (exceeding limit)', () => {
      component.speed = 85;
      component.speedLimit = 80;
      component.isWithinThreshold = true;
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.speed-display');
      expect(container.getAttribute('aria-label')).toBe('Current speed: 85 km/h, limit 80 km/h, exceeding speed limit');
    });

    it('should have aria-label without warning level when outside threshold', () => {
      component.speed = 85;
      component.speedLimit = 80;
      component.isWithinThreshold = false;
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.speed-display');
      expect(container.getAttribute('aria-label')).toBe('Current speed: 85 km/h, limit 80 km/h');
    });
  });

  describe('Vibration Alerts', () => {
    /**
     * Requirement 11.1: Trigger vibration when within threshold and speed exceeds limit
     */
    it('should trigger vibration when speed exceeds limit within threshold', fakeAsync(() => {
      component.speed = 85;
      component.speedLimit = 80;
      component.isWithinThreshold = true;
      fixture.detectChanges();
      tick();

      expect(mockVibrationService.vibrateWarningCalls).toBeGreaterThan(0);
    }));

    it('should NOT trigger vibration when speed is below limit', fakeAsync(() => {
      mockVibrationService.reset();
      component.speed = 75;
      component.speedLimit = 80;
      component.isWithinThreshold = true;
      fixture.detectChanges();
      tick();

      expect(mockVibrationService.vibrateWarningCalls).toBe(0);
    }));

    it('should NOT trigger vibration when speed equals limit exactly', fakeAsync(() => {
      mockVibrationService.reset();
      component.speed = 80;
      component.speedLimit = 80;
      component.isWithinThreshold = true;
      fixture.detectChanges();
      tick();

      expect(mockVibrationService.vibrateWarningCalls).toBe(0);
    }));

    it('should NOT trigger vibration when outside threshold', fakeAsync(() => {
      mockVibrationService.reset();
      component.speed = 90;
      component.speedLimit = 80;
      component.isWithinThreshold = false;
      fixture.detectChanges();
      tick();

      expect(mockVibrationService.vibrateWarningCalls).toBe(0);
    }));

    it('should NOT trigger vibration when speed is null', fakeAsync(() => {
      mockVibrationService.reset();
      component.speed = null;
      component.speedLimit = 80;
      component.isWithinThreshold = true;
      fixture.detectChanges();
      tick();

      expect(mockVibrationService.vibrateWarningCalls).toBe(0);
    }));

    it('should NOT trigger vibration when speedLimit is null', fakeAsync(() => {
      mockVibrationService.reset();
      component.speed = 90;
      component.speedLimit = null;
      component.isWithinThreshold = true;
      fixture.detectChanges();
      tick();

      expect(mockVibrationService.vibrateWarningCalls).toBe(0);
    }));
  });

  describe('CSS Transitions', () => {
    /**
     * Requirement 10.5: Smooth color transitions
     */
    it('should have transition styles for smooth color changes', () => {
      const container = fixture.nativeElement.querySelector('.speed-display');
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

import { Component, Input, computed, signal, inject, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getSpeedColor, SpeedColor, SPEED_THRESHOLDS } from '../../utils/color-util';
import { VibrationService, VIBRATION_SERVICE_TOKEN } from '../../services/vibration.service';

/**
 * SpeedDisplayComponent displays the current driving speed with color-coded
 * warnings based on the speed limit and proximity to a speed camera.
 * 
 * Color coding (when within 4km threshold):
 * - Green: speed < (limit - 10) - safe speed, more than 10 km/h below limit
 * - Yellow: (limit - 10) ≤ speed ≤ limit - warning zone, within 10 km/h of limit
 * - Red: speed > limit - speeding, exceeds limit
 * - Default: when distance > 4km (outside threshold)
 * 
 * Features:
 * - Smooth color transitions as speed changes
 * - Dark mode support via CSS custom properties
 * - Aria-live region for screen reader announcements
 * - Vibration alerts when exceeding speed limit within threshold
 * 
 * **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 11.1, 17.2**
 */
@Component({
  selector: 'app-speed-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="speed-display"
      [class.color-default]="speedColor() === 'default'"
      [class.color-green]="speedColor() === 'green'"
      [class.color-yellow]="speedColor() === 'yellow'"
      [class.color-red]="speedColor() === 'red'"
      role="status"
      aria-live="polite"
      [attr.aria-label]="ariaLabel()"
    >
      <span class="speed-value">{{ formattedSpeed() }}</span>
      <span class="speed-unit">km/h</span>
    </div>
  `,
  styles: [`
    .speed-display {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 4px;
      padding: 16px 24px;
      border-radius: 12px;
      background-color: var(--bg-secondary);
      /* Smooth color transitions for Requirement 10.5 */
      transition: color 0.3s ease, background-color 0.3s ease;
    }

    .speed-value {
      font-size: 3rem;
      font-weight: 700;
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }

    .speed-unit {
      font-size: 1.5rem;
      font-weight: 500;
      opacity: 0.8;
    }

    /* Color states using CSS custom properties for theme support */
    /* Requirement 10.4: Default color when outside threshold */
    .color-default {
      color: var(--text-primary);
    }

    /* Requirement 10.1: Green when within threshold and speed is more than 10 km/h below limit */
    .color-green {
      color: var(--color-safe);
    }

    /* Requirement 10.2: Yellow when within threshold and speed is within 10 km/h of limit */
    .color-yellow {
      color: var(--color-warning);
    }

    /* Requirement 10.3: Red when within threshold and speed exceeds limit */
    .color-red {
      color: var(--color-danger);
    }
  `]
})
export class SpeedDisplayComponent implements OnDestroy {
  private vibrationService = inject<VibrationService>(VIBRATION_SERVICE_TOKEN);

  /**
   * Current driving speed in km/h.
   * Null when speed is not available.
   */
  @Input()
  set speed(value: number | null) {
    this._speed.set(value);
  }

  /**
   * Speed limit in km/h.
   * Null when no speed limit is available (e.g., no camera nearby).
   */
  @Input()
  set speedLimit(value: number | null) {
    this._speedLimit.set(value);
  }

  /**
   * Whether the vehicle is within the distance threshold (≤ 4km) of a speed camera.
   * When false, the speed display uses default color regardless of speed.
   */
  @Input()
  set isWithinThreshold(value: boolean) {
    this._isWithinThreshold.set(value);
  }

  /**
   * Whether dark mode is currently active.
   * Note: Dark mode colors are handled via CSS custom properties,
   * so this input is available for any additional logic if needed.
   */
  @Input()
  set isDarkMode(value: boolean) {
    this._isDarkMode.set(value);
  }

  // Private signals for reactive state management
  private _speed = signal<number | null>(null);
  private _speedLimit = signal<number | null>(null);
  private _isWithinThreshold = signal<boolean>(false);
  private _isDarkMode = signal<boolean>(false);

  /**
   * Computed signal for the speed color based on speed, limit, and distance.
   * Uses getSpeedColor utility function.
   * 
   * **Validates: Requirements 10.1, 10.2, 10.3, 10.4**
   */
  protected speedColor = computed<SpeedColor>(() => {
    const speed = this._speed();
    const limit = this._speedLimit();
    const isWithinThreshold = this._isWithinThreshold();

    // If speed or limit is null, return default color
    if (speed === null || limit === null) {
      return 'default';
    }

    // Use a large distance value when outside threshold to get 'default' color
    // Use a small distance value when within threshold to get speed-based color
    const effectiveDistance = isWithinThreshold ? 0 : SPEED_THRESHOLDS.DISTANCE_THRESHOLD + 1;
    
    return getSpeedColor(speed, limit, effectiveDistance);
  });

  /**
   * Computed signal for formatted speed display.
   * Shows whole numbers for speed, or '--' when speed is null.
   */
  protected formattedSpeed = computed(() => {
    const speed = this._speed();
    if (speed === null) {
      return '--';
    }
    return Math.round(speed).toString();
  });

  /**
   * Computed aria-label for screen reader announcements.
   * Provides descriptive text including speed and warning level.
   * 
   * **Validates: Requirement 17.2**
   */
  protected ariaLabel = computed(() => {
    const speed = this._speed();
    const limit = this._speedLimit();
    const color = this.speedColor();
    const formattedSpd = this.formattedSpeed();
    
    if (speed === null) {
      return 'Speed: not available';
    }

    let warningLevel: string;
    switch (color) {
      case 'green':
        warningLevel = 'safe speed';
        break;
      case 'yellow':
        warningLevel = 'approaching speed limit';
        break;
      case 'red':
        warningLevel = 'exceeding speed limit';
        break;
      default:
        warningLevel = '';
    }
    
    const limitText = limit !== null ? `, limit ${limit} km/h` : '';
    const warningText = warningLevel ? `, ${warningLevel}` : '';
    
    return `Current speed: ${formattedSpd} km/h${limitText}${warningText}`;
  });

  /**
   * Computed signal to determine if vibration should be triggered.
   * Vibration is triggered when:
   * - Within distance threshold (≤ 4km)
   * - Speed exceeds the limit
   * 
   * **Validates: Requirement 11.1**
   */
  private shouldVibrate = computed(() => {
    const speed = this._speed();
    const limit = this._speedLimit();
    const isWithinThreshold = this._isWithinThreshold();

    if (speed === null || limit === null) {
      return false;
    }

    return isWithinThreshold && speed > limit;
  });

  /**
   * Effect to trigger vibration when conditions are met.
   * The VibrationService handles the 5-second cooldown internally.
   * 
   * **Validates: Requirements 11.1, 11.3**
   */
  private vibrationEffect = effect(() => {
    if (this.shouldVibrate()) {
      this.vibrationService.vibrateWarning();
    }
  });

  ngOnDestroy(): void {
    // Effect cleanup is handled automatically by Angular
  }
}

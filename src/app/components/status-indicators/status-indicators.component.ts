import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getGpsSignalLevel, GpsSignalLevel } from '../../utils/color-util';

/**
 * StatusIndicatorsComponent displays a single, explicit GPS status indicator.
 *
 * The indicator color transitions from red to green according to GPS accuracy:
 * - Red: no signal
 * - Amber: weak
 * - Yellow-green: medium
 * - Green: strong
 */
@Component({
  selector: 'app-status-indicators',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="status-indicators" role="status" aria-live="polite" aria-label="Status indicators">
      <div
        class="status-item gps-indicator"
        [attr.aria-label]="gpsAriaLabel()"
        role="img"
      >
        <svg
          class="status-icon"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
            [attr.fill]="gpsColor()"
            [attr.opacity]="gpsSignalLevel() === 0 ? '0.75' : '1'"
          />
          <circle cx="12" cy="9" r="2.5" fill="var(--bg-primary)" />
        </svg>
        <span class="gps-text" [style.color]="gpsColor()">{{ gpsShortLabel() }}</span>
      </div>
    </div>
  `,
  styles: [`
    .status-indicators {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      background-color: var(--bg-secondary);
      border-radius: 8px;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .status-icon {
      width: 22px;
      height: 22px;
      transition: fill 0.25s ease, opacity 0.25s ease;
    }

    .gps-text {
      font-size: 0.875rem;
      font-weight: 600;
      line-height: 1;
      transition: color 0.25s ease;
      user-select: none;
    }
  `]
})
export class StatusIndicatorsComponent {
  /**
   * GPS accuracy in meters. Null if no GPS fix is available.
   */
  @Input()
  set gpsAccuracy(value: number | null) {
    this._gpsAccuracy.set(value);
  }

  /**
   * Kept for API compatibility with existing app bindings.
   */
  @Input()
  set isOnline(_value: boolean) {
    // Intentionally unused in simplified GPS-only status indicator.
  }

  /**
   * Kept for API compatibility with existing app bindings.
   */
  @Input()
  set wakeLockActive(_value: boolean) {
    // Intentionally unused in simplified GPS-only status indicator.
  }

  private _gpsAccuracy = signal<number | null>(null);

  protected gpsSignalLevel = computed<GpsSignalLevel>(() =>
    getGpsSignalLevel(this._gpsAccuracy())
  );

  protected gpsColor = computed(() => {
    switch (this.gpsSignalLevel()) {
      case 0:
        return 'var(--color-danger)';
      case 1:
        return 'var(--color-warning)';
      case 2:
        return '#84cc16';
      case 3:
        return 'var(--color-safe)';
      default:
        return 'var(--text-secondary)';
    }
  });

  protected gpsShortLabel = computed(() => {
    switch (this.gpsSignalLevel()) {
      case 0:
        return 'GPS No signal';
      case 1:
        return 'GPS Weak';
      case 2:
        return 'GPS Medium';
      case 3:
        return 'GPS Strong';
      default:
        return 'GPS Unknown';
    }
  });

  protected gpsAriaLabel = computed(() => {
    const level = this.gpsSignalLevel();
    const accuracy = this._gpsAccuracy();

    switch (level) {
      case 0:
        return 'GPS signal: No signal';
      case 1:
        return `GPS signal: Weak (accuracy ${accuracy}m)`;
      case 2:
        return `GPS signal: Medium (accuracy ${accuracy}m)`;
      case 3:
        return `GPS signal: Strong (accuracy ${accuracy}m)`;
      default:
        return 'GPS signal: Unknown';
    }
  });
}

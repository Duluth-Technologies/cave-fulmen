import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getGpsSignalLevel, GpsSignalLevel } from '../../utils/color-util';

/**
 * StatusIndicatorsComponent displays status information for GPS signal,
 * network connectivity, and wake lock state.
 * 
 * This component provides visual feedback for:
 * - GPS signal strength (0-3 bars based on accuracy)
 * - Online/offline network status
 * - Wake lock active/inactive state
 * 
 * All indicators include aria-labels for accessibility.
 * 
 * **Validates: Requirements 4.1-4.5, 6.1, 6.2, 7.1-7.3, 17.1**
 */
@Component({
  selector: 'app-status-indicators',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="status-indicators" role="status" aria-live="polite" aria-label="Status indicators">
      <!-- GPS Signal Indicator -->
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
          <!-- GPS/Location icon -->
          <path 
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" 
            [attr.fill]="gpsSignalLevel() > 0 ? 'var(--text-primary)' : 'var(--text-secondary)'"
            [attr.opacity]="gpsSignalLevel() > 0 ? '1' : '0.5'"
          />
          <circle 
            cx="12" 
            cy="9" 
            r="2.5" 
            fill="var(--bg-primary)"
          />
        </svg>
        <!-- Signal bars -->
        <div class="signal-bars" aria-hidden="true">
          <div 
            class="signal-bar bar-1" 
            [class.active]="gpsSignalLevel() >= 1"
          ></div>
          <div 
            class="signal-bar bar-2" 
            [class.active]="gpsSignalLevel() >= 2"
          ></div>
          <div 
            class="signal-bar bar-3" 
            [class.active]="gpsSignalLevel() >= 3"
          ></div>
        </div>
      </div>

      <!-- Online/Offline Indicator -->
      <div 
        class="status-item connection-indicator"
        [attr.aria-label]="connectionAriaLabel()"
        role="img"
      >
        <svg 
          class="status-icon" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          @if (isOnlineStatus()) {
            <!-- Online: WiFi/Cloud icon -->
            <path 
              d="M12 3C7.03 3 2.73 5.11 0 8.5l2.12 2.12C4.47 8.48 8.03 7 12 7s7.53 1.48 9.88 3.62L24 8.5C21.27 5.11 16.97 3 12 3z" 
              fill="var(--color-safe)"
            />
            <path 
              d="M12 7c-3.97 0-7.53 1.48-9.88 3.62l2.12 2.12C6.21 11.06 8.97 10 12 10s5.79 1.06 7.76 2.74l2.12-2.12C19.53 8.48 15.97 7 12 7z" 
              fill="var(--color-safe)"
            />
            <path 
              d="M12 10c-3.03 0-5.79 1.06-7.76 2.74l2.12 2.12C8.03 13.68 9.92 13 12 13s3.97.68 5.64 1.86l2.12-2.12C17.79 11.06 15.03 10 12 10z" 
              fill="var(--color-safe)"
            />
            <circle cx="12" cy="18" r="3" fill="var(--color-safe)"/>
          } @else {
            <!-- Offline: Crossed WiFi icon -->
            <path 
              d="M12 3C7.03 3 2.73 5.11 0 8.5l2.12 2.12C4.47 8.48 8.03 7 12 7s7.53 1.48 9.88 3.62L24 8.5C21.27 5.11 16.97 3 12 3z" 
              fill="var(--text-secondary)"
              opacity="0.5"
            />
            <path 
              d="M12 7c-3.97 0-7.53 1.48-9.88 3.62l2.12 2.12C6.21 11.06 8.97 10 12 10s5.79 1.06 7.76 2.74l2.12-2.12C19.53 8.48 15.97 7 12 7z" 
              fill="var(--text-secondary)"
              opacity="0.5"
            />
            <circle cx="12" cy="18" r="3" fill="var(--text-secondary)" opacity="0.5"/>
            <!-- Diagonal line through -->
            <line 
              x1="3" y1="3" x2="21" y2="21" 
              stroke="var(--color-danger)" 
              stroke-width="2" 
              stroke-linecap="round"
            />
          }
        </svg>
      </div>

      <!-- Wake Lock Indicator -->
      <div 
        class="status-item wake-lock-indicator"
        [attr.aria-label]="wakeLockAriaLabel()"
        role="img"
      >
        <svg 
          class="status-icon" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          @if (wakeLockActiveStatus()) {
            <!-- Wake lock active: Screen on icon -->
            <rect 
              x="4" y="3" width="16" height="18" rx="2" 
              stroke="var(--color-safe)" 
              stroke-width="2"
              fill="none"
            />
            <circle cx="12" cy="18" r="1" fill="var(--color-safe)"/>
            <!-- Sun rays indicating screen is on -->
            <circle cx="12" cy="10" r="2" fill="var(--color-safe)"/>
            <line x1="12" y1="5" x2="12" y2="6" stroke="var(--color-safe)" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="15" y1="7" x2="14.3" y2="7.7" stroke="var(--color-safe)" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="16" y1="10" x2="15" y2="10" stroke="var(--color-safe)" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="15" y1="13" x2="14.3" y2="12.3" stroke="var(--color-safe)" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="9" y1="7" x2="9.7" y2="7.7" stroke="var(--color-safe)" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="8" y1="10" x2="9" y2="10" stroke="var(--color-safe)" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="9" y1="13" x2="9.7" y2="12.3" stroke="var(--color-safe)" stroke-width="1.5" stroke-linecap="round"/>
          } @else {
            <!-- Wake lock inactive: Screen off icon -->
            <rect 
              x="4" y="3" width="16" height="18" rx="2" 
              stroke="var(--text-secondary)" 
              stroke-width="2"
              fill="none"
              opacity="0.5"
            />
            <circle cx="12" cy="18" r="1" fill="var(--text-secondary)" opacity="0.5"/>
            <!-- Moon icon indicating screen can turn off -->
            <path 
              d="M12 6c-2.21 0-4 1.79-4 4s1.79 4 4 4c.34 0 .67-.04.99-.12-.63-.98-1-2.13-1-3.38 0-1.25.37-2.4 1-3.38-.32-.08-.65-.12-.99-.12z" 
              fill="var(--text-secondary)"
              opacity="0.5"
            />
          }
        </svg>
      </div>
    </div>
  `,
  styles: [`
    .status-indicators {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      background-color: var(--bg-secondary);
      border-radius: 8px;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .status-icon {
      width: 20px;
      height: 20px;
    }

    /* GPS Signal Bars */
    .gps-indicator {
      display: flex;
      align-items: flex-end;
      gap: 4px;
    }

    .signal-bars {
      display: flex;
      align-items: flex-end;
      gap: 2px;
      height: 16px;
    }

    .signal-bar {
      width: 4px;
      background-color: var(--text-secondary);
      border-radius: 1px;
      opacity: 0.3;
      transition: opacity 0.3s ease, background-color 0.3s ease;
    }

    .signal-bar.bar-1 {
      height: 6px;
    }

    .signal-bar.bar-2 {
      height: 10px;
    }

    .signal-bar.bar-3 {
      height: 14px;
    }

    .signal-bar.active {
      background-color: var(--color-safe);
      opacity: 1;
    }

    /* Connection indicator styling */
    .connection-indicator .status-icon {
      width: 22px;
      height: 22px;
    }

    /* Wake lock indicator styling */
    .wake-lock-indicator .status-icon {
      width: 22px;
      height: 22px;
    }
  `]
})
export class StatusIndicatorsComponent {
  /**
   * GPS accuracy in meters. Null if no GPS fix is available.
   * Used to compute signal level (0-3 bars).
   */
  @Input() 
  set gpsAccuracy(value: number | null) {
    this._gpsAccuracy.set(value);
  }

  /**
   * Network connectivity status.
   * True if online, false if offline.
   */
  @Input()
  set isOnline(value: boolean) {
    this._isOnline.set(value);
  }

  /**
   * Wake lock active status.
   * True if wake lock is currently active, false otherwise.
   */
  @Input()
  set wakeLockActive(value: boolean) {
    this._wakeLockActive.set(value);
  }

  // Private signals for reactive state management
  private _gpsAccuracy = signal<number | null>(null);
  private _isOnline = signal<boolean>(true);
  private _wakeLockActive = signal<boolean>(false);

  // Computed signals for derived state
  protected gpsSignalLevel = computed<GpsSignalLevel>(() => 
    getGpsSignalLevel(this._gpsAccuracy())
  );

  protected isOnlineStatus = computed(() => this._isOnline());
  protected wakeLockActiveStatus = computed(() => this._wakeLockActive());

  /**
   * Computed aria-label for GPS indicator based on signal level.
   * Provides descriptive text for screen readers.
   */
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

  /**
   * Computed aria-label for connection indicator.
   * Provides descriptive text for screen readers.
   */
  protected connectionAriaLabel = computed(() => {
    return this._isOnline() 
      ? 'Network status: Online' 
      : 'Network status: Offline';
  });

  /**
   * Computed aria-label for wake lock indicator.
   * Provides descriptive text for screen readers.
   */
  protected wakeLockAriaLabel = computed(() => {
    return this._wakeLockActive()
      ? 'Screen wake lock: Active - screen will stay on'
      : 'Screen wake lock: Inactive - screen may turn off';
  });
}

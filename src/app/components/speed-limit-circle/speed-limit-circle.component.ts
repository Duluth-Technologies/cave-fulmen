import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Constants for speed limit circle visibility and prominence thresholds.
 */
export const SPEED_LIMIT_THRESHOLDS = {
  /** Distance threshold in km - circle is visible when distance ≤ this value */
  VISIBILITY_THRESHOLD: 4,
  /** Prominence threshold in km - circle becomes prominent when distance < this value */
  PROMINENCE_THRESHOLD: 1,
} as const;

/**
 * SpeedLimitCircleComponent displays the speed limit in a standard red circle
 * with white background when approaching a speed camera.
 * 
 * The component becomes visible when within 4km of a speed camera and
 * increases in visual prominence (scale animation) when distance < 1km.
 * 
 * Design follows the standard European speed limit sign convention:
 * - Red circular border
 * - White background
 * - Black speed limit number
 * 
 * Features:
 * - Visibility controlled by distance threshold (4km)
 * - Scale-up animation when distance < 1km for increased prominence
 * - Smooth transitions for visibility and prominence changes
 * - Accessible with aria-label for screen readers
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
 */
@Component({
  selector: 'app-speed-limit-circle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="speed-limit-container"
      [class.visible]="isVisible()"
      [class.prominent]="isProminent()"
      role="img"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-hidden]="!isVisible()"
    >
      <div class="speed-limit-circle">
        <span class="speed-limit-value">{{ speedLimitValue() }}</span>
      </div>
    </div>
  `,
  styles: [`
    .speed-limit-container {
      display: flex;
      align-items: center;
      justify-content: center;
      /* Hidden by default, shown when visible class is applied */
      opacity: 0;
      transform: scale(0.8);
      transition: opacity 0.3s ease, transform 0.3s ease;
      pointer-events: none;
    }

    /* Requirement 3.1: Prominently displayed when within threshold */
    .speed-limit-container.visible {
      opacity: 1;
      transform: scale(1);
      pointer-events: auto;
    }

    /* Requirement 3.3: Increased prominence when distance < 1km */
    .speed-limit-container.prominent {
      animation: prominence-pulse 1.5s ease-in-out infinite;
    }

    @keyframes prominence-pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.1);
      }
    }

    /* Requirement 3.4: Standard red circle with white background */
    .speed-limit-circle {
      /* Requirement 3.2: Size that makes it focal point */
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background-color: var(--speed-limit-bg, #ffffff);
      border: 8px solid var(--speed-limit-border, #ef4444);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .speed-limit-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1a1a1a;
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }
  `]
})
export class SpeedLimitCircleComponent {
  /**
   * The speed limit to display in km/h.
   */
  @Input()
  set speedLimit(value: number) {
    this._speedLimit.set(value);
  }

  /**
   * Distance to the speed camera in kilometers.
   * Used to determine visibility and prominence state.
   */
  @Input()
  set distance(value: number) {
    this._distance.set(value);
  }

  /**
   * Whether the speed limit circle should be visible.
   * Typically true when within the 4km distance threshold.
   * This can be controlled externally or computed from distance.
   */
  @Input()
  set isVisibleInput(value: boolean) {
    this._isVisibleInput.set(value);
  }

  // Private signals for reactive state management
  private _speedLimit = signal<number>(0);
  private _distance = signal<number>(Infinity);
  private _isVisibleInput = signal<boolean | null>(null);

  /**
   * Exposes the speed limit value for the template.
   */
  protected speedLimitValue = computed(() => this._speedLimit());

  /**
   * Computed signal for visibility state.
   * If isVisibleInput is explicitly set, use that value.
   * Otherwise, compute based on distance threshold.
   * 
   * **Validates: Requirement 3.1**
   */
  protected isVisible = computed(() => {
    const inputValue = this._isVisibleInput();
    if (inputValue !== null) {
      return inputValue;
    }
    return this._distance() <= SPEED_LIMIT_THRESHOLDS.VISIBILITY_THRESHOLD;
  });

  /**
   * Computed signal for prominence state.
   * Circle becomes prominent (animated) when distance < 1km.
   * Only applies when the circle is visible.
   * 
   * **Validates: Requirement 3.3**
   */
  protected isProminent = computed(() => {
    if (!this.isVisible()) {
      return false;
    }
    return this._distance() < SPEED_LIMIT_THRESHOLDS.PROMINENCE_THRESHOLD;
  });

  /**
   * Computed aria-label for screen reader announcements.
   * Provides descriptive text about the speed limit and proximity.
   */
  protected ariaLabel = computed(() => {
    const limit = this._speedLimit();
    const distance = this._distance();
    const isProminent = this.isProminent();
    
    if (!this.isVisible()) {
      return '';
    }

    const proximityText = isProminent 
      ? 'Very close to camera' 
      : 'Approaching camera';
    
    return `Speed limit ${limit} km/h. ${proximityText}, ${distance.toFixed(1)} kilometers away.`;
  });
}

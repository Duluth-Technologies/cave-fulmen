import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Constants for directional arrow visibility and pulsing thresholds.
 */
export const ARROW_THRESHOLDS = {
  /** Speed threshold in km/h - arrow is visible when speed > this value */
  SPEED_VISIBILITY_THRESHOLD: 10,
  /** Distance threshold in km - arrow pulses when distance < this value */
  PULSING_DISTANCE_THRESHOLD: 1,
} as const;

/**
 * DirectionalArrowComponent displays a large, high-contrast arrow pointing
 * toward the nearest speed camera.
 * 
 * The arrow is designed to be significantly larger than typical implementations
 * and uses high-contrast colors that work well in both light and dark modes.
 * 
 * Visibility rules:
 * - Hidden when speed ≤ 10 km/h (stationary or very slow)
 * - Visible when speed > 10 km/h
 * 
 * Animation features:
 * - Smooth rotation transitions when direction changes
 * - Pulsing animation when distance < 1km to provide additional visual warning
 * 
 * **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3**
 */
@Component({
  selector: 'app-directional-arrow',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="arrow-container"
      [class.visible]="isVisible()"
      [class.pulsing]="isPulsing()"
      [style.transform]="rotationTransform()"
      role="img"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-hidden]="!isVisible()"
    >
      <svg 
        class="arrow-svg"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- Large arrow design for Requirement 8.1 -->
        <polygon 
          class="arrow-shape"
          points="50,5 90,75 70,75 70,95 30,95 30,75 10,75"
        />
      </svg>
    </div>
  `,
  styles: [`
    .arrow-container {
      display: flex;
      align-items: center;
      justify-content: center;
      /* Hidden by default, shown when visible class is applied */
      opacity: 0;
      pointer-events: none;
      /* Requirement 8.5: Smooth rotation transitions */
      transition: opacity 0.3s ease, transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Requirements 8.3, 8.4: Visibility based on speed */
    .arrow-container.visible {
      opacity: 1;
      pointer-events: auto;
    }

    /* Requirements 9.1, 9.2: Pulsing animation when distance < 1km */
    .arrow-container.pulsing {
      animation: arrow-pulse 1.2s ease-in-out infinite;
    }

    /* Requirement 9.2: Noticeable but not distracting animation */
    @keyframes arrow-pulse {
      0%, 100% {
        transform: scale(1);
        filter: brightness(1);
      }
      50% {
        transform: scale(1.15);
        filter: brightness(1.2);
      }
    }

    /* Requirement 8.1: Significantly larger arrow */
    .arrow-svg {
      width: 120px;
      height: 120px;
    }

    /* Requirement 8.2: High-contrast colors for light and dark modes */
    .arrow-shape {
      fill: var(--arrow-color);
      stroke: var(--bg-primary);
      stroke-width: 2;
      /* Add subtle shadow for better visibility */
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
    }

    /* Ensure pulsing animation doesn't conflict with rotation */
    .arrow-container.pulsing.visible {
      animation: arrow-pulse 1.2s ease-in-out infinite;
    }
  `]
})
export class DirectionalArrowComponent {
  /**
   * Rotation angle in degrees for the arrow direction.
   * 0 degrees points up (north), 90 degrees points right (east), etc.
   */
  @Input()
  set angle(value: number) {
    this._angle.set(value);
  }

  /**
   * Whether the arrow should be visible.
   * Typically controlled by speed > 10 km/h condition.
   * Can be set externally or computed from speed input.
   */
  @Input()
  set isVisibleInput(value: boolean) {
    this._isVisibleInput.set(value);
  }

  /**
   * Whether the arrow should display a pulsing animation.
   * Typically true when distance < 1km and speed > 10 km/h.
   * Can be set externally or computed from distance input.
   */
  @Input()
  set isPulsingInput(value: boolean) {
    this._isPulsingInput.set(value);
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

  /**
   * Current speed in km/h.
   * Used to compute visibility when isVisibleInput is not explicitly set.
   * Arrow is visible when speed > 10 km/h.
   */
  @Input()
  set speed(value: number | null) {
    this._speed.set(value);
  }

  /**
   * Distance to the nearest speed camera in kilometers.
   * Used to compute pulsing state when isPulsingInput is not explicitly set.
   * Arrow pulses when distance < 1km.
   */
  @Input()
  set distance(value: number) {
    this._distance.set(value);
  }

  // Private signals for reactive state management
  private _angle = signal<number>(0);
  private _isVisibleInput = signal<boolean | null>(null);
  private _isPulsingInput = signal<boolean | null>(null);
  private _isDarkMode = signal<boolean>(false);
  private _speed = signal<number | null>(null);
  private _distance = signal<number>(Infinity);

  /**
   * Computed signal for visibility state.
   * If isVisibleInput is explicitly set, use that value.
   * Otherwise, compute based on speed > 10 km/h.
   * 
   * **Validates: Requirements 8.3, 8.4**
   */
  protected isVisible = computed(() => {
    const inputValue = this._isVisibleInput();
    if (inputValue !== null) {
      return inputValue;
    }
    
    const speed = this._speed();
    if (speed === null) {
      return false;
    }
    return speed > ARROW_THRESHOLDS.SPEED_VISIBILITY_THRESHOLD;
  });

  /**
   * Computed signal for pulsing state.
   * If isPulsingInput is explicitly set, use that value.
   * Otherwise, compute based on distance < 1km AND visibility.
   * 
   * **Validates: Requirements 9.1, 9.3**
   */
  protected isPulsing = computed(() => {
    const inputValue = this._isPulsingInput();
    if (inputValue !== null) {
      return inputValue;
    }
    
    // Only pulse when visible and distance < 1km
    if (!this.isVisible()) {
      return false;
    }
    return this._distance() < ARROW_THRESHOLDS.PULSING_DISTANCE_THRESHOLD;
  });

  /**
   * Computed signal for the CSS transform rotation.
   * Provides smooth rotation transitions via CSS transition property.
   * 
   * **Validates: Requirement 8.5**
   */
  protected rotationTransform = computed(() => {
    return `rotate(${this._angle()}deg)`;
  });

  /**
   * Computed aria-label for screen reader announcements.
   * Provides descriptive text about the arrow direction and state.
   */
  protected ariaLabel = computed(() => {
    if (!this.isVisible()) {
      return '';
    }

    const angle = this._angle();
    const direction = this.getDirectionFromAngle(angle);
    const distance = this._distance();
    const isPulsing = this.isPulsing();
    
    let label = `Camera direction: ${direction}`;
    
    if (isPulsing) {
      label += `, very close (${distance.toFixed(1)} km)`;
    }
    
    return label;
  });

  /**
   * Converts an angle in degrees to a cardinal/intercardinal direction name.
   * Used for accessibility labels.
   * 
   * @param angle - The angle in degrees (0 = north, 90 = east, etc.)
   * @returns A human-readable direction string
   */
  private getDirectionFromAngle(angle: number): string {
    // Normalize angle to 0-360 range
    const normalizedAngle = ((angle % 360) + 360) % 360;
    
    // Define direction ranges (each direction covers 45 degrees)
    if (normalizedAngle >= 337.5 || normalizedAngle < 22.5) {
      return 'ahead';
    } else if (normalizedAngle >= 22.5 && normalizedAngle < 67.5) {
      return 'ahead-right';
    } else if (normalizedAngle >= 67.5 && normalizedAngle < 112.5) {
      return 'right';
    } else if (normalizedAngle >= 112.5 && normalizedAngle < 157.5) {
      return 'behind-right';
    } else if (normalizedAngle >= 157.5 && normalizedAngle < 202.5) {
      return 'behind';
    } else if (normalizedAngle >= 202.5 && normalizedAngle < 247.5) {
      return 'behind-left';
    } else if (normalizedAngle >= 247.5 && normalizedAngle < 292.5) {
      return 'left';
    } else {
      return 'ahead-left';
    }
  }
}

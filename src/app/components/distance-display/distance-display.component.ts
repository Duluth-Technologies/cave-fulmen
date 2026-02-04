import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getDistanceColor, DistanceColor } from '../../utils/color-util';

/**
 * DistanceDisplayComponent displays the distance to the nearest speed camera
 * with color-coded warnings based on proximity.
 * 
 * Color coding:
 * - Green: distance > 2km (safe distance)
 * - Yellow: 1km ≤ distance ≤ 2km (approaching camera)
 * - Red: distance < 1km (very close to camera)
 * 
 * Features:
 * - Smooth color transitions as distance changes
 * - Dark mode support via CSS custom properties
 * - Aria-live region for screen reader announcements
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 17.2**
 */
@Component({
  selector: 'app-distance-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="distance-display"
      [class.color-green]="distanceColor() === 'green'"
      [class.color-yellow]="distanceColor() === 'yellow'"
      [class.color-red]="distanceColor() === 'red'"
      role="status"
      aria-live="polite"
      [attr.aria-label]="ariaLabel()"
    >
      <span class="distance-value">{{ formattedDistance() }}</span>
      <span class="distance-unit">km</span>
    </div>
  `,
  styles: [`
    .distance-display {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 4px;
      padding: 16px 24px;
      border-radius: 12px;
      background-color: var(--bg-secondary);
      /* Smooth color transitions for Requirements 2.4 */
      transition: color 0.3s ease, background-color 0.3s ease;
    }

    .distance-value {
      font-size: 3rem;
      font-weight: 700;
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }

    .distance-unit {
      font-size: 1.5rem;
      font-weight: 500;
      opacity: 0.8;
    }

    /* Color states using CSS custom properties for theme support */
    /* Requirements 2.1, 2.5: Green when distance > 2km */
    .color-green {
      color: var(--color-safe);
    }

    /* Requirements 2.2, 2.5: Yellow when 1km ≤ distance ≤ 2km */
    .color-yellow {
      color: var(--color-warning);
    }

    /* Requirements 2.3, 2.5: Red when distance < 1km */
    .color-red {
      color: var(--color-danger);
    }
  `]
})
export class DistanceDisplayComponent {
  /**
   * Distance to the nearest speed camera in kilometers.
   * Used to compute the display color and format the value.
   */
  @Input()
  set distance(value: number) {
    this._distance.set(value);
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
  private _distance = signal<number>(0);
  private _isDarkMode = signal<boolean>(false);

  /**
   * Computed signal for the distance color based on proximity.
   * Uses getDistanceColor utility function.
   * 
   * **Validates: Requirements 2.1, 2.2, 2.3**
   */
  protected distanceColor = computed<DistanceColor>(() => 
    getDistanceColor(this._distance())
  );

  /**
   * Computed signal for formatted distance display.
   * Shows one decimal place for distances under 10km,
   * whole numbers for larger distances.
   */
  protected formattedDistance = computed(() => {
    const dist = this._distance();
    if (dist < 10) {
      return dist.toFixed(1);
    }
    return Math.round(dist).toString();
  });

  /**
   * Computed aria-label for screen reader announcements.
   * Provides descriptive text including distance and warning level.
   * 
   * **Validates: Requirement 17.2**
   */
  protected ariaLabel = computed(() => {
    const dist = this._distance();
    const color = this.distanceColor();
    const formattedDist = this.formattedDistance();
    
    let warningLevel: string;
    switch (color) {
      case 'green':
        warningLevel = 'safe distance';
        break;
      case 'yellow':
        warningLevel = 'approaching camera';
        break;
      case 'red':
        warningLevel = 'very close to camera';
        break;
      default:
        warningLevel = '';
    }
    
    return `Distance to camera: ${formattedDist} kilometers, ${warningLevel}`;
  });
}

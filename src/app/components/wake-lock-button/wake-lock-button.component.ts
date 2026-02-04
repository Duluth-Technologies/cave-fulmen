import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * WakeLockButtonComponent provides a styled button to toggle the screen wake lock feature.
 * 
 * This component displays:
 * - A lock icon that changes based on active/inactive state
 * - Visual styling that indicates the current wake lock state
 * - Minimum 44x44px touch target for accessibility
 * 
 * **Validates: Requirements 6.1-6.4, 12.1-12.4, 15.1**
 */
@Component({
  selector: 'app-wake-lock-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      class="wake-lock-button"
      [class.active]="isActiveState()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-pressed]="isActiveState()"
      (click)="onToggleClick()"
    >
      <svg 
        class="lock-icon" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        @if (isActiveState()) {
          <!-- Lock closed icon - wake lock is active -->
          <rect 
            x="5" y="11" width="14" height="10" rx="2" 
            fill="currentColor"
          />
          <path 
            d="M8 11V7a4 4 0 1 1 8 0v4" 
            stroke="currentColor" 
            stroke-width="2" 
            stroke-linecap="round"
            fill="none"
          />
          <!-- Screen indicator inside lock -->
          <rect 
            x="10" y="14" width="4" height="4" rx="0.5" 
            fill="var(--button-bg-active)"
          />
        } @else {
          <!-- Lock open icon - wake lock is inactive -->
          <rect 
            x="5" y="11" width="14" height="10" rx="2" 
            fill="currentColor"
          />
          <path 
            d="M8 11V7a4 4 0 0 1 8 0" 
            stroke="currentColor" 
            stroke-width="2" 
            stroke-linecap="round"
            fill="none"
          />
          <!-- Screen indicator inside lock -->
          <rect 
            x="10" y="14" width="4" height="4" rx="0.5" 
            fill="var(--button-bg)"
          />
        }
      </svg>
      <span class="button-text">
        {{ isActiveState() ? 'Screen On' : 'Screen Off' }}
      </span>
    </button>
  `,
  styles: [`
    .wake-lock-button {
      /* Minimum 44x44px touch target for accessibility (Requirement 15.1) */
      min-width: 44px;
      min-height: 44px;
      padding: 8px 16px;
      
      /* Flexbox layout for icon and text */
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      
      /* Styling consistent with app design language (Requirement 12.1) */
      background-color: var(--button-bg);
      color: var(--button-text);
      border: 2px solid var(--border-color);
      border-radius: 8px;
      
      /* Typography */
      font-family: inherit;
      font-size: 14px;
      font-weight: 500;
      
      /* Cursor and transitions */
      cursor: pointer;
      transition: 
        background-color 0.2s ease,
        color 0.2s ease,
        border-color 0.2s ease,
        transform 0.1s ease;
      
      /* Remove default button styles */
      -webkit-tap-highlight-color: transparent;
    }

    .wake-lock-button:hover {
      background-color: var(--button-bg-hover);
    }

    .wake-lock-button:active {
      transform: scale(0.98);
    }

    /* Active state styling (Requirements 6.1, 12.4) */
    .wake-lock-button.active {
      background-color: var(--button-bg-active);
      color: var(--button-text-active);
      border-color: var(--button-bg-active);
    }

    .wake-lock-button.active:hover {
      /* Slightly darker on hover when active */
      filter: brightness(0.95);
    }

    /* Focus styles for accessibility */
    .wake-lock-button:focus-visible {
      outline: 2px solid var(--focus-ring-color);
      outline-offset: var(--focus-ring-offset);
    }

    /* Lock icon styling */
    .lock-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    /* Button text */
    .button-text {
      white-space: nowrap;
    }

    /* Responsive: hide text on very small screens, keep icon */
    @media (max-width: 320px) {
      .wake-lock-button {
        padding: 10px;
      }
      
      .button-text {
        display: none;
      }
    }
  `]
})
export class WakeLockButtonComponent {
  /**
   * Whether the wake lock is currently active.
   * Controls the visual state of the button (Requirement 6.1, 6.2).
   */
  @Input()
  set isActive(value: boolean) {
    this._isActive.set(value);
  }

  /**
   * Event emitted when the button is clicked to toggle wake lock.
   */
  @Output() toggle = new EventEmitter<void>();

  // Private signal for reactive state management
  private _isActive = signal<boolean>(false);

  // Computed signal for template binding
  protected isActiveState = computed(() => this._isActive());

  /**
   * Computed aria-label for the button based on current state.
   * Provides descriptive text for screen readers (Requirement 17.1).
   */
  protected ariaLabel = computed(() => {
    return this._isActive()
      ? 'Disable screen wake lock - screen may turn off'
      : 'Enable screen wake lock - keep screen on';
  });

  /**
   * Handle button click to emit toggle event.
   */
  protected onToggleClick(): void {
    this.toggle.emit();
  }
}

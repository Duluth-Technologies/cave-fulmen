import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * HeaderComponent displays a subtle header with app branding and theme toggle.
 * 
 * This component provides:
 * - App name/logo displayed subtly without distracting from main content
 * - Theme toggle button with sun/moon icon
 * - Adapts to light and dark themes appropriately
 * - Minimal screen space consumption
 * 
 * **Validates: Requirements 13.1, 13.2, 13.3, 13.4**
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="app-header" role="banner">
      <!-- App branding - subtle and non-distracting (Requirement 13.2) -->
      <div class="app-branding">
        <svg 
          class="app-logo" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <!-- Speed camera/radar icon -->
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
          <circle cx="12" cy="12" r="4" fill="currentColor"/>
          <line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="2" y1="12" x2="6" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="18" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span class="app-name">Cavefulmen</span>
      </div>

      <!-- Theme toggle button (Requirement 13.1, 1.4) -->
      <button
        type="button"
        class="theme-toggle"
        [attr.aria-label]="themeToggleAriaLabel()"
        [attr.aria-pressed]="isDarkModeState()"
        (click)="onThemeToggleClick()"
      >
        <svg 
          class="theme-icon" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          @if (isDarkModeState()) {
            <!-- Sun icon - click to switch to light mode -->
            <circle cx="12" cy="12" r="5" fill="currentColor"/>
            <line x1="12" y1="1" x2="12" y2="4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="12" y1="20" x2="12" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="1" y1="12" x2="4" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="20" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          } @else {
            <!-- Moon icon - click to switch to dark mode -->
            <path 
              d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" 
              fill="currentColor"
            />
          }
        </svg>
      </button>
    </header>
  `,
  styles: [`
    .app-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background-color: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      /* Requirement 13.4: Minimal screen space */
      max-height: 56px;
    }

    /* App branding - subtle styling (Requirement 13.2) */
    .app-branding {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-primary);
      opacity: 0.8;
    }

    .app-logo {
      width: 24px;
      height: 24px;
      color: var(--text-primary);
    }

    .app-name {
      font-size: 1rem;
      font-weight: 500;
      letter-spacing: 0.02em;
    }

    /* Theme toggle button */
    .theme-toggle {
      /* Minimum 44x44px touch target for accessibility */
      min-width: 44px;
      min-height: 44px;
      padding: 10px;
      
      display: flex;
      align-items: center;
      justify-content: center;
      
      background-color: transparent;
      color: var(--text-primary);
      border: none;
      border-radius: 8px;
      
      cursor: pointer;
      transition: background-color 0.2s ease, transform 0.1s ease;
      
      -webkit-tap-highlight-color: transparent;
    }

    .theme-toggle:hover {
      background-color: var(--button-bg);
    }

    .theme-toggle:active {
      transform: scale(0.95);
    }

    .theme-toggle:focus-visible {
      outline: 2px solid var(--focus-ring-color);
      outline-offset: var(--focus-ring-offset);
    }

    .theme-icon {
      width: 24px;
      height: 24px;
    }

    /* Responsive adjustments */
    @media (max-width: 320px) {
      .app-name {
        display: none;
      }
    }
  `]
})
export class HeaderComponent {
  /**
   * Whether dark mode is currently active.
   * Controls the icon displayed in the theme toggle button.
   */
  @Input()
  set isDarkMode(value: boolean) {
    this._isDarkMode.set(value);
  }

  /**
   * Event emitted when the theme toggle button is clicked.
   */
  @Output() onThemeToggle = new EventEmitter<void>();

  // Private signal for reactive state management
  private _isDarkMode = signal<boolean>(false);

  // Computed signal for template binding
  protected isDarkModeState = computed(() => this._isDarkMode());

  /**
   * Computed aria-label for the theme toggle button.
   * Provides descriptive text for screen readers.
   */
  protected themeToggleAriaLabel = computed(() => {
    return this._isDarkMode()
      ? 'Switch to light mode'
      : 'Switch to dark mode';
  });

  /**
   * Handle theme toggle button click.
   */
  protected onThemeToggleClick(): void {
    this.onThemeToggle.emit();
  }
}

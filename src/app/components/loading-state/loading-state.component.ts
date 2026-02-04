import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * LoadingStateComponent displays a loading indicator while waiting for GPS signal.
 * 
 * This component provides visual feedback when the app is starting up and
 * GPS position is not yet available. It includes:
 * - A pulsing/spinning animation for visual feedback
 * - A message indicating the app is waiting for GPS signal
 * - Proper accessibility attributes for screen readers
 * 
 * **Validates: Requirements 5.1, 5.2, 5.4**
 */
@Component({
  selector: 'app-loading-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="loading-container" 
      role="status" 
      aria-live="polite"
      aria-label="Loading, waiting for GPS signal"
    >
      <!-- Animated GPS/Location spinner -->
      <div class="spinner-wrapper" aria-hidden="true">
        <div class="pulse-ring"></div>
        <div class="pulse-ring pulse-ring-delayed"></div>
        <svg 
          class="gps-icon" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <!-- GPS/Location pin icon -->
          <path 
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" 
            fill="var(--text-primary)"
          />
          <circle 
            cx="12" 
            cy="9" 
            r="2.5" 
            fill="var(--bg-primary)"
          />
        </svg>
      </div>

      <!-- Loading message -->
      <p class="loading-message">{{ message() }}</p>
      
      <!-- Optional sub-message for additional context -->
      @if (subMessage()) {
        <p class="loading-sub-message">{{ subMessage() }}</p>
      }
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      padding: 32px;
      text-align: center;
    }

    .spinner-wrapper {
      position: relative;
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
    }

    /* Pulsing ring animation */
    .pulse-ring {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 3px solid var(--color-safe);
      opacity: 0;
      animation: pulse 2s ease-out infinite;
    }

    .pulse-ring-delayed {
      animation-delay: 1s;
    }

    @keyframes pulse {
      0% {
        transform: scale(0.5);
        opacity: 0.8;
      }
      100% {
        transform: scale(1.5);
        opacity: 0;
      }
    }

    /* GPS icon styling */
    .gps-icon {
      width: 48px;
      height: 48px;
      animation: bounce 1.5s ease-in-out infinite;
      z-index: 1;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-8px);
      }
    }

    /* Loading message styling */
    .loading-message {
      font-size: 1.25rem;
      font-weight: 500;
      color: var(--text-primary);
      margin: 0 0 8px 0;
      transition: color 0.3s ease;
    }

    .loading-sub-message {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin: 0;
      transition: color 0.3s ease;
    }
  `]
})
export class LoadingStateComponent {
  /**
   * Custom loading message to display.
   * Defaults to "Waiting for GPS signal..."
   */
  @Input()
  set customMessage(value: string | undefined) {
    if (value !== undefined) {
      this._customMessage.set(value);
    }
  }

  /**
   * Optional sub-message for additional context.
   */
  @Input()
  set customSubMessage(value: string | undefined) {
    this._customSubMessage.set(value);
  }

  // Private signals for reactive state management
  private _customMessage = signal<string | undefined>(undefined);
  private _customSubMessage = signal<string | undefined>(undefined);

  // Computed signals for derived state
  protected message = computed(() => 
    this._customMessage() ?? 'Waiting for GPS signal...'
  );

  protected subMessage = computed(() => this._customSubMessage());
}

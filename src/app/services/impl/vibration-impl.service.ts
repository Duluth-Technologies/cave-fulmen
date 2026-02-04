import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { VibrationService, VIBRATION_COOLDOWN, WARNING_VIBRATION_PATTERN } from '../vibration.service';

@Injectable({
  providedIn: 'root'
})
export class VibrationServiceImpl implements VibrationService {
  private readonly isBrowser: boolean;
  private lastVibrationTime: number | null = null;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Checks if the Vibration API is supported by the browser.
   * @returns true if vibration is supported, false otherwise
   */
  public isSupported(): boolean {
    if (!this.isBrowser) {
      return false;
    }

    try {
      return 'vibrate' in navigator && typeof navigator.vibrate === 'function';
    } catch (error) {
      // Handle any unexpected errors gracefully
      console.warn('Error checking Vibration API support:', error);
      return false;
    }
  }

  /**
   * Triggers a vibration with the specified pattern.
   * Respects the cooldown period between vibrations.
   * @param pattern A single duration in ms or an array of durations (vibrate, pause, vibrate, ...)
   * @returns true if vibration was triggered, false if not supported or in cooldown
   */
  public vibrate(pattern: number | number[]): boolean {
    // Check if vibration is supported
    if (!this.isSupported()) {
      return false;
    }

    // Check if we're in cooldown period
    if (this.isInCooldown()) {
      return false;
    }

    try {
      const result = navigator.vibrate(pattern);
      if (result) {
        this.lastVibrationTime = Date.now();
      }
      return result;
    } catch (error) {
      // Handle any unexpected errors gracefully (Requirement 11.4)
      console.warn('Error triggering vibration:', error);
      return false;
    }
  }

  /**
   * Triggers the warning vibration pattern (200ms, 100ms pause, 200ms).
   * Respects the cooldown period between vibrations.
   * @returns true if vibration was triggered, false if not supported or in cooldown
   */
  public vibrateWarning(): boolean {
    return this.vibrate(WARNING_VIBRATION_PATTERN);
  }

  /**
   * Gets the timestamp of the last vibration.
   * @returns The timestamp in milliseconds, or null if no vibration has occurred
   */
  public getLastVibrationTime(): number | null {
    return this.lastVibrationTime;
  }

  /**
   * Checks if the service is currently in cooldown period.
   * @returns true if in cooldown, false otherwise
   */
  public isInCooldown(): boolean {
    if (this.lastVibrationTime === null) {
      return false;
    }

    const timeSinceLastVibration = Date.now() - this.lastVibrationTime;
    return timeSinceLastVibration < VIBRATION_COOLDOWN;
  }

  /**
   * Resets the last vibration time. Useful for testing.
   * @internal
   */
  public _resetLastVibrationTime(): void {
    this.lastVibrationTime = null;
  }

  /**
   * Sets the last vibration time. Useful for testing.
   * @internal
   */
  public _setLastVibrationTime(time: number | null): void {
    this.lastVibrationTime = time;
  }
}

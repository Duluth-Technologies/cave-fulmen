import { InjectionToken } from '@angular/core';

export const VIBRATION_SERVICE_TOKEN = new InjectionToken<VibrationService>('VibrationService');

/**
 * Vibration cooldown period in milliseconds.
 * Minimum 5 seconds between vibration sequences.
 */
export const VIBRATION_COOLDOWN = 5000;

/**
 * Warning vibration pattern: 200ms vibrate, 100ms pause, 200ms vibrate.
 */
export const WARNING_VIBRATION_PATTERN = [200, 100, 200];

export interface VibrationService {
  /**
   * Checks if the Vibration API is supported by the browser.
   * @returns true if vibration is supported, false otherwise
   */
  isSupported(): boolean;

  /**
   * Triggers a vibration with the specified pattern.
   * Respects the cooldown period between vibrations.
   * @param pattern A single duration in ms or an array of durations (vibrate, pause, vibrate, ...)
   * @returns true if vibration was triggered, false if not supported or in cooldown
   */
  vibrate(pattern: number | number[]): boolean;

  /**
   * Triggers the warning vibration pattern (200ms, 100ms pause, 200ms).
   * Respects the cooldown period between vibrations.
   * @returns true if vibration was triggered, false if not supported or in cooldown
   */
  vibrateWarning(): boolean;

  /**
   * Gets the timestamp of the last vibration.
   * @returns The timestamp in milliseconds, or null if no vibration has occurred
   */
  getLastVibrationTime(): number | null;

  /**
   * Checks if the service is currently in cooldown period.
   * @returns true if in cooldown, false otherwise
   */
  isInCooldown(): boolean;
}

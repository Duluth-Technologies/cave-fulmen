import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

export const THEME_SERVICE_TOKEN = new InjectionToken<ThemeService>('ThemeService');

export interface ThemeService {
  /**
   * Observable that emits the current theme value.
   */
  currentTheme$: Observable<Theme>;

  /**
   * Toggles between light and dark themes.
   */
  toggleTheme(): void;

  /**
   * Sets the theme to a specific value.
   * @param theme The theme to set ('light' or 'dark')
   */
  setTheme(theme: Theme): void;
}

import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { Theme, ThemeService } from '../theme.service';

const THEME_STORAGE_KEY = 'cavefulmen-theme';
const DARK_THEME_CLASS = 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeServiceImpl implements ThemeService {
  private readonly themeSubject: BehaviorSubject<Theme>;
  private readonly isBrowser: boolean;

  /**
   * Observable that emits the current theme value.
   */
  public readonly currentTheme$: Observable<Theme>;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Load saved theme or default to 'light'
    const savedTheme = this.loadThemeFromStorage();
    this.themeSubject = new BehaviorSubject<Theme>(savedTheme);
    this.currentTheme$ = this.themeSubject.asObservable();

    // Apply the initial theme to the document body
    this.applyThemeToDocument(savedTheme);
  }

  /**
   * Toggles between light and dark themes.
   */
  public toggleTheme(): void {
    const currentTheme = this.themeSubject.getValue();
    const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Sets the theme to a specific value.
   * @param theme The theme to set ('light' or 'dark')
   */
  public setTheme(theme: Theme): void {
    // Validate theme value
    if (theme !== 'light' && theme !== 'dark') {
      console.warn(`Invalid theme value: ${theme}. Defaulting to 'light'.`);
      theme = 'light';
    }

    this.themeSubject.next(theme);
    this.saveThemeToStorage(theme);
    this.applyThemeToDocument(theme);
  }

  /**
   * Loads the theme preference from localStorage.
   * Returns 'light' if no preference is saved or if localStorage is unavailable.
   */
  private loadThemeFromStorage(): Theme {
    if (!this.isBrowser) {
      return 'light';
    }

    try {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (storedTheme === 'light' || storedTheme === 'dark') {
        return storedTheme;
      }
    } catch (error) {
      console.warn('Unable to access localStorage for theme preference:', error);
    }

    return 'light';
  }

  /**
   * Saves the theme preference to localStorage.
   */
  private saveThemeToStorage(theme: Theme): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.warn('Unable to save theme preference to localStorage:', error);
    }
  }

  /**
   * Applies the theme class to the document body.
   * Adds 'dark' class for dark theme, removes it for light theme.
   */
  private applyThemeToDocument(theme: Theme): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      if (theme === 'dark') {
        document.documentElement.classList.add(DARK_THEME_CLASS);
      } else {
        document.documentElement.classList.remove(DARK_THEME_CLASS);
      }
    } catch (error) {
      console.warn('Unable to apply theme class to document:', error);
    }
  }
}

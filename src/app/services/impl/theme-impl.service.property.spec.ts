import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import * as fc from 'fast-check';
import { ThemeServiceImpl } from './theme-impl.service';
import { Theme } from '../theme.service';
import { firstValueFrom } from 'rxjs';

/**
 * Property-based tests for ThemeService
 * Feature: ux-redesign
 * 
 * These tests verify universal properties of the ThemeService across
 * randomly generated inputs using fast-check library.
 */
describe('ThemeServiceImpl Property Tests', () => {
  const THEME_STORAGE_KEY = 'cavefulmen-theme';

  // Custom arbitrary for generating valid theme values
  const themeArbitrary: fc.Arbitrary<Theme> = fc.constantFrom('light', 'dark');

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Remove dark class from document
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  /**
   * Property 1: Theme Persistence Round-Trip
   * 
   * For any theme value ('light' or 'dark'), setting the theme and then
   * reloading the app should result in the same theme being applied.
   * 
   * **Validates: Requirements 1.2, 1.3**
   */
  describe('Feature: ux-redesign, Property 1: Theme Persistence Round-Trip', () => {
    it('should persist and restore any theme value correctly', async () => {
      await fc.assert(
        fc.asyncProperty(themeArbitrary, async (theme: Theme) => {
          // Clean state for each iteration
          localStorage.clear();
          document.documentElement.classList.remove('dark');
          TestBed.resetTestingModule();

          // Step 1: Create service and set theme
          TestBed.configureTestingModule({
            providers: [
              ThemeServiceImpl,
              { provide: PLATFORM_ID, useValue: 'browser' }
            ]
          });
          const service1 = TestBed.inject(ThemeServiceImpl);
          service1.setTheme(theme);

          // Verify theme was set
          const themeAfterSet = await firstValueFrom(service1.currentTheme$);
          expect(themeAfterSet).toBe(theme);

          // Verify theme was persisted to localStorage
          const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
          expect(storedTheme).toBe(theme);

          // Step 2: Simulate app reload by creating a new service instance
          TestBed.resetTestingModule();
          TestBed.configureTestingModule({
            providers: [
              ThemeServiceImpl,
              { provide: PLATFORM_ID, useValue: 'browser' }
            ]
          });
          const service2 = TestBed.inject(ThemeServiceImpl);

          // Step 3: Verify the theme is restored correctly
          const restoredTheme = await firstValueFrom(service2.currentTheme$);
          expect(restoredTheme).toBe(theme);

          // Verify document class is applied correctly
          if (theme === 'dark') {
            expect(document.documentElement.classList.contains('dark')).toBe(true);
          } else {
            expect(document.documentElement.classList.contains('dark')).toBe(false);
          }

          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should maintain theme consistency across multiple set operations', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(themeArbitrary, { minLength: 1, maxLength: 10 }),
          async (themes: Theme[]) => {
            // Clean state
            localStorage.clear();
            document.documentElement.classList.remove('dark');
            TestBed.resetTestingModule();

            TestBed.configureTestingModule({
              providers: [
                ThemeServiceImpl,
                { provide: PLATFORM_ID, useValue: 'browser' }
              ]
            });
            const service = TestBed.inject(ThemeServiceImpl);

            // Apply all themes in sequence
            for (const theme of themes) {
              service.setTheme(theme);
            }

            // The final theme should be the last one in the array
            const expectedTheme = themes[themes.length - 1];
            const currentTheme = await firstValueFrom(service.currentTheme$);
            expect(currentTheme).toBe(expectedTheme);

            // Verify persistence
            const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
            expect(storedTheme).toBe(expectedTheme);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 2: Theme Toggle State Flip
   * 
   * For any current theme state, calling toggleTheme() should result
   * in the opposite theme being active.
   * 
   * **Validates: Requirements 1.4**
   */
  describe('Feature: ux-redesign, Property 2: Theme Toggle State Flip', () => {
    it('should always flip to the opposite theme when toggled', async () => {
      await fc.assert(
        fc.asyncProperty(themeArbitrary, async (initialTheme: Theme) => {
          // Clean state
          localStorage.clear();
          document.documentElement.classList.remove('dark');
          TestBed.resetTestingModule();

          // Set up initial theme in localStorage before creating service
          localStorage.setItem(THEME_STORAGE_KEY, initialTheme);

          TestBed.configureTestingModule({
            providers: [
              ThemeServiceImpl,
              { provide: PLATFORM_ID, useValue: 'browser' }
            ]
          });
          const service = TestBed.inject(ThemeServiceImpl);

          // Verify initial theme
          const themeBeforeToggle = await firstValueFrom(service.currentTheme$);
          expect(themeBeforeToggle).toBe(initialTheme);

          // Toggle the theme
          service.toggleTheme();

          // Verify the theme flipped to the opposite
          const themeAfterToggle = await firstValueFrom(service.currentTheme$);
          const expectedTheme: Theme = initialTheme === 'light' ? 'dark' : 'light';
          expect(themeAfterToggle).toBe(expectedTheme);

          // Verify document class is updated correctly
          if (expectedTheme === 'dark') {
            expect(document.documentElement.classList.contains('dark')).toBe(true);
          } else {
            expect(document.documentElement.classList.contains('dark')).toBe(false);
          }

          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should return to original theme after double toggle', async () => {
      await fc.assert(
        fc.asyncProperty(themeArbitrary, async (initialTheme: Theme) => {
          // Clean state
          localStorage.clear();
          document.documentElement.classList.remove('dark');
          TestBed.resetTestingModule();

          // Set up initial theme
          localStorage.setItem(THEME_STORAGE_KEY, initialTheme);

          TestBed.configureTestingModule({
            providers: [
              ThemeServiceImpl,
              { provide: PLATFORM_ID, useValue: 'browser' }
            ]
          });
          const service = TestBed.inject(ThemeServiceImpl);

          // Toggle twice
          service.toggleTheme();
          service.toggleTheme();

          // Should be back to original theme
          const finalTheme = await firstValueFrom(service.currentTheme$);
          expect(finalTheme).toBe(initialTheme);

          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should correctly flip theme for any number of toggles', async () => {
      await fc.assert(
        fc.asyncProperty(
          themeArbitrary,
          fc.integer({ min: 1, max: 20 }),
          async (initialTheme: Theme, toggleCount: number) => {
            // Clean state
            localStorage.clear();
            document.documentElement.classList.remove('dark');
            TestBed.resetTestingModule();

            // Set up initial theme
            localStorage.setItem(THEME_STORAGE_KEY, initialTheme);

            TestBed.configureTestingModule({
              providers: [
                ThemeServiceImpl,
                { provide: PLATFORM_ID, useValue: 'browser' }
              ]
            });
            const service = TestBed.inject(ThemeServiceImpl);

            // Toggle the specified number of times
            for (let i = 0; i < toggleCount; i++) {
              service.toggleTheme();
            }

            // Calculate expected theme based on toggle count
            // Odd number of toggles = opposite theme
            // Even number of toggles = same theme
            const expectedTheme: Theme = toggleCount % 2 === 0 
              ? initialTheme 
              : (initialTheme === 'light' ? 'dark' : 'light');

            const finalTheme = await firstValueFrom(service.currentTheme$);
            expect(finalTheme).toBe(expectedTheme);

            // Verify persistence
            const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
            expect(storedTheme).toBe(expectedTheme);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

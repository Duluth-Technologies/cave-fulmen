import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { ThemeServiceImpl } from './theme-impl.service';
import { Theme } from '../theme.service';

describe('ThemeServiceImpl', () => {
  let service: ThemeServiceImpl;
  const THEME_STORAGE_KEY = 'cavefulmen-theme';

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

  describe('initialization', () => {
    it('should be created', () => {
      TestBed.configureTestingModule({
        providers: [
          ThemeServiceImpl,
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });
      service = TestBed.inject(ThemeServiceImpl);
      expect(service).toBeTruthy();
    });

    it('should default to light theme when no preference is stored', (done) => {
      TestBed.configureTestingModule({
        providers: [
          ThemeServiceImpl,
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });
      service = TestBed.inject(ThemeServiceImpl);

      service.currentTheme$.subscribe(theme => {
        expect(theme).toBe('light');
        done();
      });
    });

    it('should load saved dark theme from localStorage', (done) => {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');

      TestBed.configureTestingModule({
        providers: [
          ThemeServiceImpl,
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });
      service = TestBed.inject(ThemeServiceImpl);

      service.currentTheme$.subscribe(theme => {
        expect(theme).toBe('dark');
        done();
      });
    });

    it('should load saved light theme from localStorage', (done) => {
      localStorage.setItem(THEME_STORAGE_KEY, 'light');

      TestBed.configureTestingModule({
        providers: [
          ThemeServiceImpl,
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });
      service = TestBed.inject(ThemeServiceImpl);

      service.currentTheme$.subscribe(theme => {
        expect(theme).toBe('light');
        done();
      });
    });

    it('should default to light theme when invalid value is stored', (done) => {
      localStorage.setItem(THEME_STORAGE_KEY, 'invalid');

      TestBed.configureTestingModule({
        providers: [
          ThemeServiceImpl,
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });
      service = TestBed.inject(ThemeServiceImpl);

      service.currentTheme$.subscribe(theme => {
        expect(theme).toBe('light');
        done();
      });
    });

    it('should apply dark class to document on initialization when dark theme is saved', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');

      TestBed.configureTestingModule({
        providers: [
          ThemeServiceImpl,
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });
      service = TestBed.inject(ThemeServiceImpl);

      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should not have dark class on document when light theme is saved', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'light');

      TestBed.configureTestingModule({
        providers: [
          ThemeServiceImpl,
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });
      service = TestBed.inject(ThemeServiceImpl);

      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('toggleTheme', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          ThemeServiceImpl,
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });
      service = TestBed.inject(ThemeServiceImpl);
    });

    it('should toggle from light to dark', (done) => {
      // Start with light theme (default)
      service.toggleTheme();

      service.currentTheme$.subscribe(theme => {
        expect(theme).toBe('dark');
        done();
      });
    });

    it('should toggle from dark to light', (done) => {
      // Set to dark first
      service.setTheme('dark');
      // Then toggle
      service.toggleTheme();

      service.currentTheme$.subscribe(theme => {
        expect(theme).toBe('light');
        done();
      });
    });

    it('should persist toggled theme to localStorage', () => {
      service.toggleTheme();
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');

      service.toggleTheme();
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    });

    it('should apply dark class to document when toggling to dark', () => {
      service.toggleTheme();
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should remove dark class from document when toggling to light', () => {
      service.setTheme('dark');
      service.toggleTheme();
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('setTheme', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          ThemeServiceImpl,
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });
      service = TestBed.inject(ThemeServiceImpl);
    });

    it('should set theme to dark', (done) => {
      service.setTheme('dark');

      service.currentTheme$.subscribe(theme => {
        expect(theme).toBe('dark');
        done();
      });
    });

    it('should set theme to light', (done) => {
      service.setTheme('dark');
      service.setTheme('light');

      service.currentTheme$.subscribe(theme => {
        expect(theme).toBe('light');
        done();
      });
    });

    it('should persist theme to localStorage when setting dark', () => {
      service.setTheme('dark');
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    });

    it('should persist theme to localStorage when setting light', () => {
      service.setTheme('light');
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    });

    it('should apply dark class to document when setting dark theme', () => {
      service.setTheme('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should remove dark class from document when setting light theme', () => {
      service.setTheme('dark');
      service.setTheme('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should handle invalid theme value by defaulting to light', (done) => {
      // TypeScript would normally prevent this, but testing runtime behavior
      service.setTheme('invalid' as Theme);

      service.currentTheme$.subscribe(theme => {
        expect(theme).toBe('light');
        done();
      });
    });
  });

  describe('currentTheme$ observable', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          ThemeServiceImpl,
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });
      service = TestBed.inject(ThemeServiceImpl);
    });

    it('should emit initial value immediately', (done) => {
      let emissionCount = 0;
      service.currentTheme$.subscribe(theme => {
        emissionCount++;
        if (emissionCount === 1) {
          expect(theme).toBe('light');
          done();
        }
      });
    });

    it('should emit new value when theme changes', (done) => {
      const emittedValues: Theme[] = [];

      service.currentTheme$.subscribe(theme => {
        emittedValues.push(theme);
        if (emittedValues.length === 2) {
          expect(emittedValues).toEqual(['light', 'dark']);
          done();
        }
      });

      service.setTheme('dark');
    });
  });
});

import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { VibrationServiceImpl } from './vibration-impl.service';
import { VIBRATION_COOLDOWN, WARNING_VIBRATION_PATTERN } from '../vibration.service';

describe('VibrationServiceImpl', () => {
  let service: VibrationServiceImpl;
  let originalVibrate: typeof navigator.vibrate;
  let mockVibrate: jasmine.Spy;

  beforeEach(() => {
    // Store original vibrate function
    originalVibrate = navigator.vibrate;
    
    // Create mock vibrate function
    mockVibrate = jasmine.createSpy('vibrate').and.returnValue(true);
  });

  afterEach(() => {
    // Restore original vibrate function
    if (originalVibrate !== undefined) {
      (navigator as any).vibrate = originalVibrate;
    } else {
      delete (navigator as any).vibrate;
    }
  });

  describe('when Vibration API is supported', () => {
    beforeEach(() => {
      // Mock navigator with vibrate support
      (navigator as any).vibrate = mockVibrate;

      TestBed.configureTestingModule({
        providers: [
          VibrationServiceImpl,
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });
      service = TestBed.inject(VibrationServiceImpl);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should report vibration as supported', () => {
      expect(service.isSupported()).toBe(true);
    });

    it('should trigger vibration with a single duration', () => {
      const result = service.vibrate(200);
      expect(result).toBe(true);
      expect(mockVibrate).toHaveBeenCalledWith(200);
    });

    it('should trigger vibration with a pattern array', () => {
      const pattern = [200, 100, 200];
      const result = service.vibrate(pattern);
      expect(result).toBe(true);
      expect(mockVibrate).toHaveBeenCalledWith(pattern);
    });

    it('should trigger warning vibration with correct pattern', () => {
      const result = service.vibrateWarning();
      expect(result).toBe(true);
      expect(mockVibrate).toHaveBeenCalledWith(WARNING_VIBRATION_PATTERN);
    });

    it('should update lastVibrationTime after successful vibration', () => {
      expect(service.getLastVibrationTime()).toBeNull();
      
      const beforeTime = Date.now();
      service.vibrate(200);
      const afterTime = Date.now();
      
      const lastTime = service.getLastVibrationTime();
      expect(lastTime).not.toBeNull();
      expect(lastTime!).toBeGreaterThanOrEqual(beforeTime);
      expect(lastTime!).toBeLessThanOrEqual(afterTime);
    });

    it('should not be in cooldown initially', () => {
      expect(service.isInCooldown()).toBe(false);
    });

    it('should be in cooldown immediately after vibration', () => {
      service.vibrate(200);
      expect(service.isInCooldown()).toBe(true);
    });

    it('should block vibration during cooldown period', () => {
      // First vibration should succeed
      expect(service.vibrate(200)).toBe(true);
      expect(mockVibrate).toHaveBeenCalledTimes(1);
      
      // Second vibration should be blocked
      expect(service.vibrate(200)).toBe(false);
      expect(mockVibrate).toHaveBeenCalledTimes(1);
    });

    it('should allow vibration after cooldown period expires', () => {
      // First vibration
      service.vibrate(200);
      expect(mockVibrate).toHaveBeenCalledTimes(1);
      
      // Simulate time passing beyond cooldown
      const pastTime = Date.now() - VIBRATION_COOLDOWN - 100;
      service._setLastVibrationTime(pastTime);
      
      // Second vibration should succeed
      expect(service.vibrate(200)).toBe(true);
      expect(mockVibrate).toHaveBeenCalledTimes(2);
    });

    it('should not update lastVibrationTime when vibration fails', () => {
      mockVibrate.and.returnValue(false);
      
      service.vibrate(200);
      expect(service.getLastVibrationTime()).toBeNull();
    });

    it('should reset lastVibrationTime correctly', () => {
      service.vibrate(200);
      expect(service.getLastVibrationTime()).not.toBeNull();
      
      service._resetLastVibrationTime();
      expect(service.getLastVibrationTime()).toBeNull();
    });
  });

  describe('when Vibration API is not supported', () => {
    beforeEach(() => {
      // Set vibrate to undefined to simulate unsupported API
      (navigator as any).vibrate = undefined;

      TestBed.configureTestingModule({
        providers: [
          VibrationServiceImpl,
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });
      service = TestBed.inject(VibrationServiceImpl);
    });

    it('should report vibration as not supported', () => {
      expect(service.isSupported()).toBe(false);
    });

    it('should return false when trying to vibrate', () => {
      expect(service.vibrate(200)).toBe(false);
    });

    it('should return false when trying to vibrateWarning', () => {
      expect(service.vibrateWarning()).toBe(false);
    });

    it('should not update lastVibrationTime', () => {
      service.vibrate(200);
      expect(service.getLastVibrationTime()).toBeNull();
    });
  });

  describe('when running on server (SSR)', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          VibrationServiceImpl,
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });
      service = TestBed.inject(VibrationServiceImpl);
    });

    it('should report vibration as not supported', () => {
      expect(service.isSupported()).toBe(false);
    });

    it('should return false when trying to vibrate', () => {
      expect(service.vibrate(200)).toBe(false);
    });

    it('should return false when trying to vibrateWarning', () => {
      expect(service.vibrateWarning()).toBe(false);
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      // Mock navigator with vibrate that throws
      mockVibrate = jasmine.createSpy('vibrate').and.throwError('Vibration failed');
      (navigator as any).vibrate = mockVibrate;

      TestBed.configureTestingModule({
        providers: [
          VibrationServiceImpl,
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });
      service = TestBed.inject(VibrationServiceImpl);
    });

    it('should handle vibration errors gracefully', () => {
      spyOn(console, 'warn');
      
      const result = service.vibrate(200);
      
      expect(result).toBe(false);
      expect(console.warn).toHaveBeenCalled();
    });

    it('should not update lastVibrationTime when vibration throws', () => {
      spyOn(console, 'warn');
      
      service.vibrate(200);
      expect(service.getLastVibrationTime()).toBeNull();
    });
  });
});

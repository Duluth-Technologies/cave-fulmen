import { InjectionToken } from "@angular/core";

export const WAKE_LOCK_SERVICE_TOKEN = new InjectionToken<WakeLockService>('WakeLockService');

export interface WakeLockService {

    requestWakeLock(): Promise<void>;
    
    releaseWakeLock(): void;
  
  }
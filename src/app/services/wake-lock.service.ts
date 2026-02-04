import { InjectionToken } from "@angular/core";
import { Observable } from "rxjs";

export const WAKE_LOCK_SERVICE_TOKEN = new InjectionToken<WakeLockService>('WakeLockService');

export interface WakeLockService {
    /**
     * Observable that emits the current wake lock state.
     * Emits true when wake lock is successfully acquired.
     * Emits false when wake lock is released.
     * Requirements: 6.1, 6.2
     */
    isActive$: Observable<boolean>;

    requestWakeLock(): Promise<void>;
    
    releaseWakeLock(): void;
  
  }
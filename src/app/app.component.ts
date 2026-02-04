import { Component, Inject, OnDestroy, OnInit, NgZone } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CAMERA_SERVICE_TOKEN } from './services/camera.service';
import { CameraServiceImpl } from './services/impl/camera-impl.service';
import { concatMap, map } from 'rxjs/operators';
import { RADAR_SERVICE_TOKEN } from './services/radar.service';
import { RadarServiceImpl } from './services/impl/radar-impl.service';
import { CommonModule } from '@angular/common';
import { interval, Observable, of, Subscription } from 'rxjs';
import { WAKE_LOCK_SERVICE_TOKEN } from './services/wake-lock.service';
import { WakeLockServiceImpl } from './services/impl/wake-lock-impl.service';
import { THEME_SERVICE_TOKEN, ThemeService } from './services/theme.service';
import { ThemeServiceImpl } from './services/impl/theme-impl.service';
import { VIBRATION_SERVICE_TOKEN } from './services/vibration.service';
import { VibrationServiceImpl } from './services/impl/vibration-impl.service';
import { angleInDegreesBetweenVectorAndTowPoints, computeEastWestOffsetInMeters, computeNorthSouthOffsetInMeters } from './utils/math-util';

// Import all new standalone components
import { HeaderComponent } from './components/header/header.component';
import { StatusIndicatorsComponent } from './components/status-indicators/status-indicators.component';
import { DistanceDisplayComponent } from './components/distance-display/distance-display.component';
import { SpeedDisplayComponent } from './components/speed-display/speed-display.component';
import { SpeedLimitCircleComponent } from './components/speed-limit-circle/speed-limit-circle.component';
import { DirectionalArrowComponent } from './components/directional-arrow/directional-arrow.component';
import { WakeLockButtonComponent } from './components/wake-lock-button/wake-lock-button.component';
import { LoadingStateComponent } from './components/loading-state/loading-state.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    // New standalone components
    HeaderComponent,
    StatusIndicatorsComponent,
    DistanceDisplayComponent,
    SpeedDisplayComponent,
    SpeedLimitCircleComponent,
    DirectionalArrowComponent,
    WakeLockButtonComponent,
    LoadingStateComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [
    { provide: CAMERA_SERVICE_TOKEN, useClass: CameraServiceImpl },
    { provide: RADAR_SERVICE_TOKEN, useClass: RadarServiceImpl },
    { provide: WAKE_LOCK_SERVICE_TOKEN, useClass: WakeLockServiceImpl },
    { provide: THEME_SERVICE_TOKEN, useClass: ThemeServiceImpl },
    { provide: VIBRATION_SERVICE_TOKEN, useClass: VibrationServiceImpl },
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  
  wakeLock: any = null;
  speedLimitThreshold = 4;
  cameraInfo$: Observable<{ maxSpeed: number, distance: number; lat: number, lon: number } | null> = of(null);

  lat: number | null = null;
  lon: number | null = null;
  accuracy: number | null = null;
  timestamp: number | null = null;
  vx: number | null = null;
  vy: number | null = null;

  speed: number | null = null;
  speedString: string | null = null;

  watchId: number | null = null;

  // Theme state (Requirement 1.1-1.5)
  isDarkMode: boolean = false;
  private themeSubscription: Subscription | null = null;

  // Online/offline status (Requirement 7.1-7.3)
  isOnline: boolean = true;
  private onlineHandler: (() => void) | null = null;
  private offlineHandler: (() => void) | null = null;

  // Wake lock active state (Requirement 6.1, 6.2)
  wakeLockActive: boolean = false;

  constructor(
    @Inject(CAMERA_SERVICE_TOKEN) private cameraService: CameraServiceImpl,
    @Inject(WAKE_LOCK_SERVICE_TOKEN) private wakeLockService: WakeLockServiceImpl,
    @Inject(THEME_SERVICE_TOKEN) private themeService: ThemeService,
    private ngZone: NgZone
  ) {
  }

  async ngOnInit() {
    this.watchPosition();
    this.setupOnlineStatusListener();
    this.subscribeToTheme();
    
    this.cameraInfo$ = interval(5000).pipe(
      concatMap(() => {
        if (this.lat == null || this.lon == null) {
          // Return an empty observable or a default value if lat or lon is null
          return of(null); // Or use skip() to ignore this emission
        }
        return this.cameraService.getClosestCamera(this.lat, this.lon).pipe(
          map(({ camera, distance }) => ({    
            maxSpeed: camera.maxSpeed,
            distance: distance,
            lat: camera.lat,
            lon: camera.lon
          }))
        );
      })
    );
  }

  /**
   * Subscribe to theme changes from ThemeService.
   */
  private subscribeToTheme(): void {
    this.themeSubscription = this.themeService.currentTheme$.subscribe(theme => {
      this.isDarkMode = theme === 'dark';
    });
  }

  /**
   * Toggle between light and dark themes.
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  /**
   * Set up online/offline status listener.
   * Uses NgZone to ensure Angular change detection is triggered
   * when browser events fire outside Angular's zone.
   * 
   * Validates: Requirements 7.1, 7.2, 7.3
   */
  private setupOnlineStatusListener(): void {
    // Set initial online status
    this.isOnline = navigator.onLine;

    // Create bound handlers that run inside Angular's zone
    this.onlineHandler = () => {
      this.ngZone.run(() => {
        this.isOnline = true;
      });
    };

    this.offlineHandler = () => {
      this.ngZone.run(() => {
        this.isOnline = false;
      });
    };

    // Listen for online/offline events
    window.addEventListener('online', this.onlineHandler);
    window.addEventListener('offline', this.offlineHandler);
  }

  /**
   * Clean up online/offline event listeners.
   */
  private cleanupOnlineStatusListener(): void {
    if (this.onlineHandler) {
      window.removeEventListener('online', this.onlineHandler);
      this.onlineHandler = null;
    }
    if (this.offlineHandler) {
      window.removeEventListener('offline', this.offlineHandler);
      this.offlineHandler = null;
    }
  }

  /**
   * Toggle wake lock on/off.
   * Handles async operations and updates state accordingly.
   * 
   * Validates: Requirements 6.1, 6.2
   */
  async toggleWakeLock(): Promise<void> {
    if (this.wakeLockActive) {
      this.wakeLockService.releaseWakeLock();
      this.wakeLockActive = false;
    } else {
      try {
        await this.wakeLockService.requestWakeLock();
        this.wakeLockActive = true;
      } catch (error) {
        console.error('Failed to enable wake lock:', error);
        this.wakeLockActive = false;
      }
    }
  }

  /**
   * Enable wake lock (used for initial activation).
   * 
   * Validates: Requirements 6.1, 6.2
   */
  async enableWakeLock(): Promise<void> {
    try {
      await this.wakeLockService.requestWakeLock();
      this.wakeLockActive = true;
    } catch (error) {
      console.error('Failed to enable wake lock:', error);
      this.wakeLockActive = false;
    }
  }

  ngOnDestroy(): void {
    this.unwatchPosition();
    this.wakeLockService.releaseWakeLock();
    this.cleanupOnlineStatusListener();
    
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  computeDistanceString(distanceInKilometers: number): string {
    if (distanceInKilometers >= 1) {
      // If the distance is 1 km or more, round to the nearest km
      return `${Math.round(distanceInKilometers)} km`;
    } else {
      // If the distance is less than 1 km, convert to meters and round to the nearest 100 meters
      const distanceInMeters = Math.floor(distanceInKilometers * 1000);
      return `${distanceInMeters} m`;
    }
  }

  computeAngle(lat: number, lon: number): number {
    if (this.lat == null || this.lon == null || this.vx == null || this.vy == null) {
      return 0;
    }     
    return - angleInDegreesBetweenVectorAndTowPoints([this.vx!, this.vy!] , this.lat, this.lon, lat, lon);
  }

  setSpeed(): void {
    if (this.vx == null || this.vy == null) {
      this.speedString = null;
      return;
    }
    // Compute the speed in km/h
    this.speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy) * 3.6;
    this.speedString = `${this.speed.toFixed(0)} km/h`;
  }

  watchPosition(): void {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        position => {
          console.log('Position:', position.coords);
          const now = Math.floor(Date.now() / 1000);
          if (this.lat != null && this.lon != null && this.timestamp != null) {
            // Compute the speed in m/s
            const dt = now - this.timestamp;
            console.log('dt:', dt);
            const dx = computeEastWestOffsetInMeters(this.lat, this.lon, position.coords.longitude);
            console.log('dx:', dx);
            this.vx = dx / dt;
            console.log('vx:', this.vx);
            const dy = computeNorthSouthOffsetInMeters(this.lat, position.coords.latitude);
            console.log('dy:', dy);
            this.vy = dy / dt;
            console.log('vy:', this.vy);
            this.setSpeed();
          }

          this.lat = position.coords.latitude;
          this.lon = position.coords.longitude;
          this.accuracy = position.coords.accuracy; 
          this.timestamp = now;
        },
        error => {
          console.error('Error:', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 30000
        }
      );
    }
  }

  unwatchPosition(): void {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

}

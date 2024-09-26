import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CAMERA_SERVICE_TOKEN } from './services/camera.service';
import { CameraServiceImpl } from './services/impl/camera-impl.service';
import { concatMap, distinctUntilChanged, exhaustMap, map, switchMap } from 'rxjs/operators';
import { Camera } from './models/camera.model';
import { RADAR_SERVICE_TOKEN } from './services/radar.service';
import { RadarServiceImpl } from './services/impl/radar-impl.service';
import { provideHttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { interval, Observable, of } from 'rxjs';
import { WAKE_LOCK_SERVICE_TOKEN } from './services/wake-lock.service';
import { WakeLockServiceImpl } from './services/impl/wake-lock-impl.service';
import { angleBetweenVectorAndTowPoints, computeEastWestOffsetInMeters, computeNorthSouthOffsetInMeters } from './utils/math-util';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [
    { provide: CAMERA_SERVICE_TOKEN, useClass: CameraServiceImpl },
    { provide: RADAR_SERVICE_TOKEN, useClass: RadarServiceImpl },
    { provide: WAKE_LOCK_SERVICE_TOKEN, useClass: WakeLockServiceImpl },
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  
  wakeLock: any = null;
  speedLimitThreshold = 4;
  cameraInfo$: Observable<{ maxSpeed: number, distance: number; lat: number, lon: number } | null> = of(null);

  lat: number | null = null;
  lon: number | null = null;
  precision: number | null = null;
  timestamp: number | null = null;
  vx: number | null = null;
  vy: number | null = null;

  speed: number | null = null;
  speedString: string | null = null;

  watchId: number | null = null;


  constructor(@Inject(CAMERA_SERVICE_TOKEN) private cameraService: CameraServiceImpl, @Inject(WAKE_LOCK_SERVICE_TOKEN) private wakeLockService: WakeLockServiceImpl) {
  }

  async ngOnInit() {
    this.watchPosition();
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

  enableWakeLock(): void {
    this.wakeLockService.requestWakeLock();

  }

  ngOnDestroy(): void {
    this.unwatchPosition();
    this.wakeLockService.releaseWakeLock();
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

  computeAngle(lat: number, lon: number) {
    if (this.lat == null || this.lon == null || this.vx == null || this.vy == null) {
      return null;
    }    
    return angleBetweenVectorAndTowPoints([this.vx!, this.vy!] , this.lat, this.lon, lat, lon);
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
          this.precision = position.coords.accuracy; 
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

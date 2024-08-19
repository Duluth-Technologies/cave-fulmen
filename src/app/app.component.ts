import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CAMERA_SERVICE_TOKEN } from './services/camera.service';
import { CameraServiceImpl } from './services/impl/camera-impl.service';
import { concatMap, distinctUntilChanged, exhaustMap, map, switchMap } from 'rxjs/operators';
import { Camera } from './model/camera.model';
import { OSM_SERVICE_TOKEN } from './services/osm.service';
import { OsmServiceLocalImpl } from './services/impl/osm-local-impl.service';
import { provideHttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { interval, Observable, of } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [
    { provide: CAMERA_SERVICE_TOKEN, useClass: CameraServiceImpl },
    { provide: OSM_SERVICE_TOKEN, useClass: OsmServiceLocalImpl }
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  wakeLock: any = null;
  speedLimitThreshold = 4;
  cameraInfo$: Observable<{ maxSpeed: number, distance: number } | null> = of(null) ;
  lat: number | null = 0;
  lon: number | null = 0;
  watchId: number | null = null;


  constructor(@Inject(CAMERA_SERVICE_TOKEN) private cameraService: CameraServiceImpl) {
  }

  async ngOnInit() {
    await this.requestWakeLock();
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
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
            distance: distance
          }))
        );
      })
    );
  }

  ngOnDestroy(): void {
    this.unwatchPosition();
    this.releaseWakeLock(); 
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
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

  watchPosition(): void {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        position => {
          console.log('Position:', position.coords);
          this.lat = position.coords.latitude;
          this.lon = position.coords.longitude;
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

  async requestWakeLock() {
    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
      console.log('Screen Wake Lock active');
    } catch (err) {
      if (err instanceof Error) {
        console.error(`${err.name}, ${err.message}`);
      } else {
        console.error('Unknown error', err);
      }
    }
  }

  async releaseWakeLock() {
    if (this.wakeLock !== null) {
      try {
        await this.wakeLock.release();
        this.wakeLock = null;
        console.log('Screen Wake Lock released');
      } catch (err) {
        if (err instanceof Error) {
          console.error(`${err.name}, ${err.message}`);
        } else {
          console.error('Unknown error', err);
        }
      }
    }
  }

  async handleVisibilityChange() {
    if (this.wakeLock !== null && document.visibilityState === 'visible') {
      console.log('Re-requesting wake lock');
      await this.requestWakeLock();
    }
  }

}

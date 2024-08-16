import { Component, Inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CAMERA_SERVICE_TOKEN } from './services/camera.service';
import { CameraServiceImpl } from './services/impl/camera-impl.service';
import { distinctUntilChanged, exhaustMap, interval, map, Observable, switchMap } from 'rxjs';
import { Camera } from './model/camera.model';
import { OSM_SERVICE_TOKEN } from './services/osm.service';
import { OsmServiceLocalImpl } from './services/impl/osm-local-impl.service';
import {provideHttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

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
export class AppComponent {
  title = 'cavefulmen';
  speedLimitThreshold = 4;
  cameraInfo$!: Observable<{maxSpeed: number, distance: number}>;


  constructor(@Inject(CAMERA_SERVICE_TOKEN) private cameraService: CameraServiceImpl) {    
  }

  ngOnInit(): void {
    this.cameraInfo$ = this.getCurrentPosition().pipe(
      distinctUntilChanged((prev, curr) => prev.latitude === curr.latitude && prev.longitude === curr.longitude),
      exhaustMap(coords => 
        this.cameraService.getClosestCamera(coords.latitude, coords.longitude).pipe(
          map(({ camera, distance }) => ({
            maxSpeed: camera.maxSpeed,
            distance: distance
          }))
        )
      )
    );
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

  getCurrentPosition(): Observable<GeolocationCoordinates> {
    return new Observable<GeolocationCoordinates>(observer => {
        if (navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
                position => {
                  console.log('Position:', position.coords);
                  observer.next(position.coords);
                },
                error => observer.error(error),
                { enableHighAccuracy: true,
                  maximumAge: 0,
                  timeout: 30000
                 }
            );

            // Cleanup when the observable is unsubscribed
            return () => navigator.geolocation.clearWatch(watchId);
        } else {
            observer.error('Geolocation not available');
            
            // Even though this code path is an error, we must return a cleanup function.
            return () => {}; // No-op cleanup function
        }
    });
}
}

import { Inject, Injectable } from '@angular/core';
import { CAMERA_SERVICE_TOKEN, CameraService } from '../camera.service';
import { RADAR_SERVICE_TOKEN, RadarService } from '../radar.service';
import { map, Observable } from 'rxjs';
import { Radar } from '../../models/radar.model';
import { Camera } from '../../models/camera.model';
import { computeDistance } from '../../utils/distance-util';

@Injectable({
  providedIn: 'root'
})
export class CameraServiceImpl implements CameraService {

  constructor(@Inject(RADAR_SERVICE_TOKEN) private radarService: RadarService) { }

  public getClosestCamera(lat: number, lon: number): Observable<{ camera: Camera, distance: number }> {
    console.log('Getting closest camera to', lat, lon);
    return this.radarService.getRadars().pipe(
      map((radars: Radar[]) => {
        let minDistance = Number.MAX_VALUE;
        let closestCamera: Camera | null = null;
        for (let radar of radars) {
          let distance = computeDistance(lat, lon, radar.latitude, radar.longitude);
          if (distance < minDistance) {
            minDistance = distance;
            closestCamera = new Camera(radar.latitude, radar.longitude, radar.speed_limit ?? 0);
            console.log('New closest camera', closestCamera);
          }
        }
        return { camera: closestCamera!, distance: minDistance };
      })
    );
  }


}

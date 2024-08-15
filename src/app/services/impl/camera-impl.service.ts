import { Inject, Injectable } from '@angular/core';
import { CAMERA_SERVICE_TOKEN, CameraService } from '../camera.service';
import { OSM_SERVICE_TOKEN, OsmService } from '../osm.service';
import { map, Observable } from 'rxjs';
import { OsmData } from '../../model/osmData.model';
import { Camera } from '../../model/camera.model';

@Injectable({
  providedIn: 'root'
})
export class CameraServiceImpl implements CameraService {

  constructor(@Inject(OSM_SERVICE_TOKEN) private osmService: OsmService) { }

  public getClosetCamera(lat: number, lon: number): Observable<{camera: Camera, distance: number}> {
    console.log('Getting closest camera to', lat, lon);
    return this.osmService.getOsmData().pipe(
      map((osmData: OsmData) => {
        let minDistance = Number.MAX_VALUE;
        let closestCamera: Camera | null = null;
        for (let element of osmData.elements) {
          if (!element.tags.maxspeed) {
            continue;
          }
          let distance = this.computeDistance(lat, lon, element.lat, element.lon);
          if (distance < minDistance) {
            console.log('Found closer element', element);
            minDistance = distance;
            closestCamera = new Camera(element.lat, element.lon, +element.tags.maxspeed);
          }
        }
        return {camera: closestCamera!, distance: minDistance};
      })
    );
  }

  private computeDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRadians = (degrees: number) => degrees * Math.PI / 180;

    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const rLat1 = toRadians(lat1);
    const rLat2 = toRadians(lat2);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(rLat1) * Math.cos(rLat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

}

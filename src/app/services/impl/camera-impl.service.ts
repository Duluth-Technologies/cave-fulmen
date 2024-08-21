import { Inject, Injectable } from '@angular/core';
import { CAMERA_SERVICE_TOKEN, CameraService } from '../camera.service';
import { OSM_SERVICE_TOKEN, OsmService } from '../osm.service';
import { map, Observable } from 'rxjs';
import { OsmData } from '../../models/osmData.model';
import { Camera } from '../../models/camera.model';
import { computeDistance } from '../../utils/distance-util';

@Injectable({
  providedIn: 'root'
})
export class CameraServiceImpl implements CameraService {

  constructor(@Inject(OSM_SERVICE_TOKEN) private osmService: OsmService) { }

  public getClosestCamera(lat: number, lon: number): Observable<{ camera: Camera, distance: number }> {
    console.log('Getting closest camera to', lat, lon);
    return this.osmService.getOsmData().pipe(
      map((osmData: OsmData) => {
        let minDistance = Number.MAX_VALUE;
        let closestCamera: Camera | null = null;
        for (let element of osmData.elements) {
          if (!('maxspeed' in element.tags)) {
            continue;
          }
          let distance = computeDistance(lat, lon, element.lat, element.lon);
          if (distance < minDistance) {
            minDistance = distance;
            closestCamera = new Camera(element.lat, element.lon, +element.tags.maxspeed);
          }
        }
        return { camera: closestCamera!, distance: minDistance };
      })
    );
  }


}

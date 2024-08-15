import { Injectable, InjectionToken } from '@angular/core';
import { Camera } from '../model/camera.model';
import { Observable } from 'rxjs';
import { OsmData } from '../model/osmData.model';

export const OSM_SERVICE_TOKEN = new InjectionToken<OsmService>('OsmService');

export interface OsmService {

  getOsmData(): Observable<OsmData>;

}

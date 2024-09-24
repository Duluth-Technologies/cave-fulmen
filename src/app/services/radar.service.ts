import { Injectable, InjectionToken } from '@angular/core';
import { Camera } from '../models/camera.model';
import { Observable } from 'rxjs';
import { Radar } from '../models/radar.model';

export const RADAR_SERVICE_TOKEN = new InjectionToken<RadarService>('RadarService');

export interface RadarService {

  getRadars(): Observable<Radar[]>;

}

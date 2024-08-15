import { Injectable, InjectionToken } from '@angular/core';
import { Camera } from '../model/camera.model';
import { Observable } from 'rxjs';

export const CAMERA_SERVICE_TOKEN = new InjectionToken<CameraService>('CameraService');

export interface CameraService {

  getClosetCamera(lat: number, lon: number): Observable<{camera: Camera, distance: number}>;

}

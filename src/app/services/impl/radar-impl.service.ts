import { Injectable } from "@angular/core";
import { RadarService } from "../radar.service";
import { Observable, shareReplay } from "rxjs";
import { Radar } from "../../models/radar.model";
import { HttpClient } from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class RadarServiceImpl implements RadarService {

    private jsonUrl = 'assets/data/radars.json';

    // Observable to store the cached response
    private radars$: Observable<Radar[]>;

    constructor(private httpClient: HttpClient) { 
        // Initialize the observable and apply shareReplay to cache the result
        this.radars$ = this.httpClient.get<Radar[]>(this.jsonUrl).pipe(
            shareReplay(1) // Cache the latest result, allowing replay to any new subscribers
        );
    }

    getRadars(): Observable<Radar[]> {
        // Return the cached observable
        return this.radars$;
    }
}
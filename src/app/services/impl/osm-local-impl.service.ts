import { Injectable } from "@angular/core";
import { OsmService } from "../osm.service";
import { Observable, shareReplay } from "rxjs";
import { OsmData } from "../../models/osmData.model";
import { HttpClient } from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class OsmServiceLocalImpl implements OsmService {

    private jsonUrl = 'assets/data/speed_cameras.json';

    // Observable to store the cached response
    private osmData$: Observable<OsmData>;

    constructor(private httpClient: HttpClient) { 
        // Initialize the observable and apply shareReplay to cache the result
        this.osmData$ = this.httpClient.get<OsmData>(this.jsonUrl).pipe(
            shareReplay(1) // Cache the latest result, allowing replay to any new subscribers
        );
    }

    getOsmData(): Observable<OsmData> {
        // Return the cached observable
        return this.osmData$;
    }
}
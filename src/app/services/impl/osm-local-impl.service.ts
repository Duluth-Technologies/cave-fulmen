import { Injectable } from "@angular/core";
import { OsmService } from "../osm.service";
import { Observable } from "rxjs";
import { OsmData } from "../../model/osmData.model";
import { HttpClient } from "@angular/common/http";

@Injectable({
    providedIn: 'root'
  })
  export class OsmServiceLocalImpl implements OsmService {

    private jsonUrl = 'assets/data/speed_cameras.json';

  
    constructor(private httpClient: HttpClient) { }
    getOsmData(): Observable<OsmData> {
        return this.httpClient.get<any>(this.jsonUrl);
    }  
  
  }
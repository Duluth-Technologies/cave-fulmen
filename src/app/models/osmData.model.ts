export interface OsmData {
    version: number;
    generator: string;
    elements: Element[];

}

export interface Element {
    type: string;
    id: number;
    lat: number;
    lon: number;
    tags: Tags;
}

export interface Tags {
    description: string;
    direction: string;
    enforcement: string;
    highway: string;
    maxspeed: string;
}
export declare class AmapInstance {
    key: string;
    constructor(key: string);
    getDrivingPath(data: {
        from: [number, number];
        to: [number, number];
    }): Promise<any>;
    regeo(data: {
        longitude: number;
        latitude: number;
    }): Promise<any>;
    ipLoc(data: {
        ip: string;
    }): Promise<any>;
    getDistrict(data: {
        keywords: string;
        subdistrict: string;
    }): Promise<any>;
    geocode(data: {
        address: string;
    }): Promise<any>;
}

import { Action, CTYunZone } from '../../types/CTYun';
export declare class CTYunInstance {
    private accessKey;
    private secretKey;
    constructor(accessKey: string, secretKey: string);
    getUploadInfo(bucket: string, zone: CTYunZone, key?: string, actions?: Action[]): {
        key: string | undefined;
        uploadToken: void;
        uploadHost: string;
        bucket: string;
    };
    getToken(zone: CTYunZone, bucket: string, actions?: Action[]): void;
}

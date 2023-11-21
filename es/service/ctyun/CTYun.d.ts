import { Action, CTYunZone } from '../../types/CTGun';
export declare class CTYunInstance {
    private accessKey;
    private secretKey;
    constructor(accessKey: string, secretKey: string);
    getUploadInfo(bucket: string, zone: CTYunZone, key?: string, actions?: Action[]): {
        key: string | undefined;
        accessKey: string;
        policy: string;
        signature: string;
        uploadHost: string;
        bucket: string;
    };
    getSignInfo(bucket: string, actions?: Action[]): {
        encodePolicy: string;
        signature: string;
    };
    private base64ToUrlSafe;
    private hmacSha1;
    private urlSafeBase64Encode;
}

import { CTYunZone } from '../../types/CTYun';
export declare class CTYunInstance {
    private accessKey;
    private secretKey;
    constructor(accessKey: string, secretKey: string);
    getUploadInfo(bucket: string, zone: CTYunZone, key?: string): {
        key: string | undefined;
        accessKey: string;
        policy: string;
        signature: string;
        uploadHost: string;
        bucket: string;
    };
    getSignInfo(bucket: string): {
        encodePolicy: string;
        signature: string;
    };
    private base64ToUrlSafe;
    private hmacSha1;
    private urlSafeBase64Encode;
}

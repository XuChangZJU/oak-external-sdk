/// <reference types="node" />
/// <reference types="node" />
import { BinaryToTextEncoding } from 'crypto';
import { CTYunZone, ReqOptionProps } from '../../types/CTYun';
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
    removeFile(bucket: string, zone: CTYunZone, key: string): Promise<void>;
    getAuthorization(reqOptions: ReqOptionProps, zone: CTYunZone): string;
    signatureFn(reqOptions: ReqOptionProps, zone: CTYunZone): string | Buffer;
    stringToSign(reqOptions: ReqOptionProps, zone: CTYunZone): string;
    signedHeaders(headers: Record<string, string>): string;
    canonicalString(path: string, method: string, headers: Record<string, string>): string;
    canonicalHeaders(headers: Record<string, string>): string;
    canonicalHeaderValues(values: string): string;
    getSigningKey(date: string, zone: CTYunZone): string | Buffer;
    hmacSha256(key: string | Buffer, content: string | Buffer, digest?: BinaryToTextEncoding, fn?: string): string | Buffer;
    each(object: any, iterFunction: (key: any, item: any) => any): void;
    arrayEach(array: any, iterFunction: (item: any, key: any) => any): void;
    isSignableHeader(key: string): boolean;
}

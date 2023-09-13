export declare class QiniuCloudInstance {
    private accessKey;
    private secretKey;
    constructor(accessKey: string, secretKey: string);
    /**
     * 计算客户端上传七牛需要的凭证
     * https://developer.qiniu.com/kodo/1312/upload
     * @param uploadHost
     * @param domain
     * @param bucket
     * @param key
     * @returns
     */
    getUploadInfo(uploadHost: string, bucket: string, key?: string): {
        key: string | undefined;
        uploadToken: string;
        uploadHost: string;
        bucket: string;
    };
    /**
     * 计算直播需要的token
     * @param method
     * @param path
     * @param host
     * @param rawQuery
     * @param contentType
     * @param bodyStr
     * @returns
     */
    getLiveToken(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, host: string, rawQuery?: string, contentType?: string, bodyStr?: string): string;
    getLiveStream(hub: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', streamTitle: string, host: string, publishDomain: string, playDomain: string, publishKey: string, playKey: string, expireAt: number): Promise<{
        streamTitle: string;
        hub: string;
        rtmpPushUrl: string;
        rtmpPlayUrl: string;
        pcPushUrl: string;
        streamKey: string;
        expireAt: number;
    }>;
    /**
     * 计算直播流地址相关信息
     * @param publishDomain
     * @param playDomain
     * @param hub
     * @param publishKey
     * @param playKey
     * @param streamTitle
     * @param expireAt
     * @returns
     */
    getStreamObj(publishDomain: string, playDomain: string, hub: string, publishKey: string, playKey: string, streamTitle: string, expireAt: number): {
        streamTitle: string;
        hub: string;
        rtmpPushUrl: string;
        rtmpPlayUrl: string;
        pcPushUrl: string;
        streamKey: string;
        expireAt: number;
    };
    getPlayBackUrl(hub: string, playBackDomain: string, streamTitle: string, start: number, end: number, method: 'GET' | 'POST' | 'PUT' | 'DELETE', host: string, rawQuery?: string): Promise<string>;
    private getToken;
    private base64ToUrlSafe;
    private hmacSha1;
    private urlSafeBase64Encode;
}

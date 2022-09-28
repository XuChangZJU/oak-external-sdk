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
    getUploadInfo(uploadHost: string, domain: string, bucket: string, key?: string): {
        key: string | undefined;
        uploadToken: string;
        uploadHost: string;
        bucket: string;
        domain: string;
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
    private getToken;
    private base64ToUrlSafe;
    private hmacSha1;
    private urlSafeBase64Encode;
}

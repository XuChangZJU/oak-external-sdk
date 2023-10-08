export declare class QiniuCloudInstance {
    private accessKey;
    private secretKey;
    constructor(accessKey: string, secretKey: string);
    /**
     * 计算客户端上传七牛需要的凭证
     * https://developer.qiniu.com/kodo/1312/upload
     * @param uploadHost
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
     * https://developer.qiniu.com/kodo/1308/stat
     * 文档里写的是GET方法，从nodejs-sdk里看是POST方法
     */
    getKodoFileStat(bucket: string, key: string, mockData?: any): Promise<{
        fsize: number;
        hash: string;
        mimeType: string;
        type: 0 | 1 | 2 | 3;
        putTime: number;
    }>;
    /**
     * https://developer.qiniu.com/kodo/1257/delete
     * @param bucket
     * @param key
     * @param mockData
     * @returns
     */
    removeKodoFile(bucket: string, key: string, mockData?: any): Promise<boolean>;
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
    /**
     * 管理端访问七牛云服务器
     * @param path
     * @param method
     * @param headers
     * @param body
     */
    private access;
    /**
     * https://developer.qiniu.com/kodo/1208/upload-token
     * @param scope
     * @returns
     */
    private generateKodoUploadToken;
    /**
     * https://developer.qiniu.com/kodo/1201/access-token
     */
    private genernateKodoAccessToken;
    private base64ToUrlSafe;
    private hmacSha1;
    private urlSafeBase64Encode;
}

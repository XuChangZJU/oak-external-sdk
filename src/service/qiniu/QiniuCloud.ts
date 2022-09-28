import crypto from 'crypto';
import { Buffer } from 'buffer';

export class QiniuCloudInstance {
    private accessKey: string;
    private secretKey: string;

    constructor(accessKey: string, secretKey: string) {
        this.accessKey = accessKey;
        this.secretKey = secretKey;
    }

    /**
     * 计算客户端上传七牛需要的凭证
     * https://developer.qiniu.com/kodo/1312/upload
     * @param uploadHost 
     * @param domain 
     * @param bucket 
     * @param key 
     * @returns 
     */
    getUploadInfo(uploadHost: string, domain: string, bucket: string, key?: string) {
        try {
            const scope = key ? `${bucket}:${key}` : bucket;
            const uploadToken = this.getToken(scope);
            return {
                key,
                uploadToken,
                uploadHost,
                bucket,
                domain,
            };
        } catch (err) {
            throw err;
        }
    }

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
    getLiveToken(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, host: string, rawQuery?: string, contentType?: string, bodyStr?: string) {
        // 1. 添加 Path
        let data = `${method} ${path}`
        if (rawQuery) {
            data += `?${rawQuery}`
        }
        data += `\nHost: ${host}`
        if (contentType) {
            data += `\nContent-Type: ${contentType}`
        }
        data += "\n\n"
        if(bodyStr && contentType && contentType !== "application/octet-stream") {
            data+=bodyStr;
        }
        console.log('data', data);
        const sign = this.hmacSha1(data, this.secretKey);
        const encodedSign = this.base64ToUrlSafe(sign);
        const toke = "Qiniu " + this.accessKey + ":" + encodedSign;
        return toke;
    }

    private getToken(scope: string) {
        // 构造策略
        const putPolicy = {
            scope: scope,
            deadline: 3600 + Math.floor(Date.now() / 1000),
        };
        // 构造凭证
        const encodedFlags = this.urlSafeBase64Encode(
            JSON.stringify(putPolicy)
        );
        const encoded = this.hmacSha1(encodedFlags, this.secretKey);
        const encodedSign = this.base64ToUrlSafe(encoded);
        const uploadToken =
            this.accessKey + ':' + encodedSign + ':' + encodedFlags;
        return uploadToken;
    }

    private base64ToUrlSafe(v: string) {
        return v.replace(/\//g, '_').replace(/\+/g, '-');
    }

    private hmacSha1(encodedFlags: any, secretKey: string) {
        const hmac = crypto.createHmac('sha1', secretKey);
        hmac.update(encodedFlags);
        return hmac.digest('base64');
    }
    private urlSafeBase64Encode(jsonFlags: string) {
        const encoded = Buffer.from(jsonFlags).toString('base64');
        return this.base64ToUrlSafe(encoded);
    }
}
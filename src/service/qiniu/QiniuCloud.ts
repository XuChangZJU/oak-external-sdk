require('../../fetch');
import crypto from 'crypto';
import { Md5 } from 'ts-md5';
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
    getUploadInfo(
        uploadHost: string,
        bucket: string,
        key?: string
    ) {
        try {
            const scope = key ? `${bucket}:${key}` : bucket;
            const uploadToken = this.getToken(scope);
            return {
                key,
                uploadToken,
                uploadHost,
                bucket,
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
    getLiveToken(
        method: 'GET' | 'POST' | 'PUT' | 'DELETE',
        path: string,
        host: string,
        rawQuery?: string,
        contentType?: string,
        bodyStr?: string
    ) {
        // 1. 添加 Path
        let data = `${method} ${path}`;
        if (rawQuery) {
            data += `?${rawQuery}`;
        }
        data += `\nHost: ${host}`;
        if (contentType) {
            data += `\nContent-Type: ${contentType}`;
        }
        data += '\n\n';
        if (
            bodyStr &&
            contentType &&
            contentType !== 'application/octet-stream'
        ) {
            data += bodyStr;
        }
        const sign = this.hmacSha1(data, this.secretKey);
        const encodedSign = this.base64ToUrlSafe(sign);
        const toke = 'Qiniu ' + this.accessKey + ':' + encodedSign;
        return toke;
    }

    async getLiveStream(
        hub: string,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE',
        streamTitle: string,
        host: string,
        publishDomain: string,
        playDomain: string,
        publishKey: string,
        playKey: string,
        expireAt: number
    ) {
        // 七牛创建直播流接口路径
        const path = `/v2/hubs/${hub}/streams`;
        // 如果用户没给streamTitle，那么随机生成一个
        let key: string = streamTitle;
        if (!key) {
            key = `class${new Date().getTime()}`;
        }
        const bodyStr = JSON.stringify({
            key,
        });
        const contentType = 'application/json';
        const token = this.getLiveToken(method, path, host);

        const url = `https://pili.qiniuapi.com/v2/hubs/${hub}/streams`;
        await global.fetch(url, {
            method: 'POST',
            headers: {
                Authorization: token,
                'Content-Type': contentType,
            },
            body: bodyStr,
            mode: 'no-cors',
        });
        const obj = this.getStreamObj(
            publishDomain,
            playDomain,
            hub,
            publishKey,
            playKey,
            streamTitle,
            expireAt
        );
        return obj;
    }

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
    getStreamObj(
        publishDomain: string,
        playDomain: string,
        hub: string,
        publishKey: string,
        playKey: string,
        streamTitle: string,
        expireAt: number
    ) {
        const signStr = `/${hub}/${streamTitle}?expire=${expireAt}`;
        const sourcePath = `/${hub}/${streamTitle}`;
        const token = this.base64ToUrlSafe(this.hmacSha1(signStr, publishKey));
        const rtmpPushUrl = `rtmp://${publishDomain}${signStr}&token=${token}`;
        // 生成播放地址
        const t = expireAt.toString(16).toLowerCase();
        const playSign = Md5.hashStr(playKey + sourcePath + t)
            .toString()
            .toLowerCase();
        const rtmpPlayUrl = `https://${playDomain}${sourcePath}.m3u8?sign=${playSign}&t=${t}`;
        // obs推流需要的地址和串流密钥
        const pcPushUrl = `rtmp://${publishDomain}/${hub}/`;
        const streamKey = `${streamTitle}?expire=${expireAt}&token=${token}`;
        return {
            streamTitle,
            hub,
            rtmpPushUrl,
            rtmpPlayUrl,
            pcPushUrl,
            streamKey,
            expireAt,
        };
    }

    async getPlayBackUrl(
        hub: string,
        playBackDomain: string,
        streamTitle: string,
        start: number,
        end: number,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE',
        host: string,
        rawQuery?: string
    ) {
        const encodeStreamTitle = this.base64ToUrlSafe(streamTitle);
        const path = `/v2/hubs/${hub}/streams/${encodeStreamTitle}/saveas`;
        const bodyStr = JSON.stringify({
            fname: streamTitle,
            start,
            end,
        });
        const contentType = 'application/json';
        const token = this.getLiveToken(
            method,
            path,
            host,
            rawQuery,
            contentType,
            bodyStr
        );

        const url = `https://pili.qiniuapi.com${path}`;
        await global.fetch(url, {
            method: 'POST',
            headers: {
                Authorization: token,
                'Content-Type': contentType,
            },
            body: bodyStr,
            mode: 'no-cors',
        });
        return `https://${playBackDomain}/${streamTitle}.m3u8`;
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

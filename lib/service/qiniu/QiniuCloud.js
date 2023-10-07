"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QiniuCloudInstance = void 0;
const tslib_1 = require("tslib");
require('../../fetch');
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const ts_md5_1 = require("ts-md5");
const buffer_1 = require("buffer");
const querystring_1 = require("querystring");
const Exception_1 = require("oak-domain/lib/types/Exception");
const QINIU_CLOUD_HOST = 'rs.qiniuapi.com';
class QiniuCloudInstance {
    accessKey;
    secretKey;
    constructor(accessKey, secretKey) {
        this.accessKey = accessKey;
        this.secretKey = secretKey;
    }
    /**
     * 计算客户端上传七牛需要的凭证
     * https://developer.qiniu.com/kodo/1312/upload
     * @param uploadHost
     * @param bucket
     * @param key
     * @returns
     */
    getUploadInfo(uploadHost, bucket, key) {
        try {
            const scope = key ? `${bucket}:${key}` : bucket;
            const uploadToken = this.generateKodoUploadToken(scope);
            return {
                key,
                uploadToken,
                uploadHost,
                bucket,
            };
        }
        catch (err) {
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
    getLiveToken(method, path, host, rawQuery, contentType, bodyStr) {
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
        if (bodyStr &&
            contentType &&
            contentType !== 'application/octet-stream') {
            data += bodyStr;
        }
        const sign = this.hmacSha1(data, this.secretKey);
        const encodedSign = this.base64ToUrlSafe(sign);
        const toke = 'Qiniu ' + this.accessKey + ':' + encodedSign;
        return toke;
    }
    async getLiveStream(hub, method, streamTitle, host, publishDomain, playDomain, publishKey, playKey, expireAt) {
        // 七牛创建直播流接口路径
        const path = `/v2/hubs/${hub}/streams`;
        // 如果用户没给streamTitle，那么随机生成一个
        let key = streamTitle;
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
        const obj = this.getStreamObj(publishDomain, playDomain, hub, publishKey, playKey, streamTitle, expireAt);
        return obj;
    }
    /**
     * https://developer.qiniu.com/kodo/1308/stat
     */
    async getKodoStat(bucket, key) {
        const entry = `${bucket}:${key}`;
        const encodedEntryURI = this.urlSafeBase64Encode(entry);
        const path = `/stat/${encodedEntryURI}`;
        const result = await this.access(path, undefined, 'Get', {
            'Content-Type': 'application/x-www-form-urlencoded',
        });
        return result;
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
    getStreamObj(publishDomain, playDomain, hub, publishKey, playKey, streamTitle, expireAt) {
        const signStr = `/${hub}/${streamTitle}?expire=${expireAt}`;
        const sourcePath = `/${hub}/${streamTitle}`;
        const token = this.base64ToUrlSafe(this.hmacSha1(signStr, publishKey));
        const rtmpPushUrl = `rtmp://${publishDomain}${signStr}&token=${token}`;
        // 生成播放地址
        const t = expireAt.toString(16).toLowerCase();
        const playSign = ts_md5_1.Md5.hashStr(playKey + sourcePath + t)
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
    async getPlayBackUrl(hub, playBackDomain, streamTitle, start, end, method, host, rawQuery) {
        const encodeStreamTitle = this.base64ToUrlSafe(streamTitle);
        const path = `/v2/hubs/${hub}/streams/${encodeStreamTitle}/saveas`;
        const bodyStr = JSON.stringify({
            fname: streamTitle,
            start,
            end,
        });
        const contentType = 'application/json';
        const token = this.getLiveToken(method, path, host, rawQuery, contentType, bodyStr);
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
    /**
     * 管理端访问七牛云服务器
     * @param path
     * @param method
     * @param headers
     * @param body
     */
    async access(path, query, method, headers, body) {
        const contentType = headers && headers['Content-Type'];
        const url = new URL(`https://${QINIU_CLOUD_HOST}${path}`);
        if (query) {
            url.search = typeof query === 'object' ? (0, querystring_1.stringify)(query) : query;
        }
        const accessToken = this.genernateKodoAccessToken(method || 'Get', QINIU_CLOUD_HOST, path, undefined, contentType);
        let response;
        try {
            response = await fetch(`https://${QINIU_CLOUD_HOST}${path}`, {
                method,
                headers: {
                    'Authorization': `Qiniu ${accessToken}`,
                    ...headers,
                },
                body,
            });
        }
        catch (err) {
            // fetch返回异常一定是网络异常
            throw new Exception_1.OakNetworkException();
        }
        const responseType = response.headers.get('Content-Type') || response.headers.get('content-type');
        if (responseType?.toLocaleLowerCase().match(/application\/json/i)) {
            const json = await response.json();
            if (response.status > 299) {
                // 七牛服务器返回异常，根据文档一定是json
                // https://developer.qiniu.com/kodo/3928/error-responses
                const { code, error } = json;
                return new Exception_1.OakExternalException('qiniu', code, error);
            }
            return json;
        }
        else if (responseType?.toLocaleLowerCase().match(/application\/octet-stream/i)) {
            const result = await response.arrayBuffer();
            return result;
        }
        else {
            throw new Error(`尚不支持的content-type类型${responseType}`);
        }
    }
    /**
     * https://developer.qiniu.com/kodo/1208/upload-token
     * @param scope
     * @returns
     */
    generateKodoUploadToken(scope) {
        // 构造策略
        const putPolicy = {
            scope: scope,
            deadline: 3600 + Math.floor(Date.now() / 1000),
        };
        // 构造凭证
        const encodedFlags = this.urlSafeBase64Encode(JSON.stringify(putPolicy));
        const encoded = this.hmacSha1(encodedFlags, this.secretKey);
        const encodedSign = this.base64ToUrlSafe(encoded);
        const uploadToken = this.accessKey + ':' + encodedSign + ':' + encodedFlags;
        return uploadToken;
    }
    /**
     * https://developer.qiniu.com/kodo/1201/access-token
     */
    genernateKodoAccessToken(method, host, path, query, contentType, body, xHeaders) {
        let signingStr = method + ' ' + path;
        if (query) {
            signingStr += '?' + query;
        }
        signingStr += '\nHost: ' + host;
        if (contentType) {
            signingStr += '\nContent-Type: ' + contentType;
        }
        if (xHeaders) {
            const ks = Object.keys(xHeaders);
            ks.sort((e1, e2) => e1 < e2 ? -1 : 1);
            ks.forEach((k) => signingStr += `\n${k}: ${xHeaders[k]}`);
        }
        signingStr += '\n\n';
        if (body) {
            signingStr += body;
        }
        const sign = this.hmacSha1(signingStr, this.secretKey);
        const encodedSign = this.urlSafeBase64Encode(sign);
        return `${this.accessKey}:${encodedSign}`;
    }
    base64ToUrlSafe(v) {
        return v.replace(/\//g, '_').replace(/\+/g, '-');
    }
    hmacSha1(encodedFlags, secretKey) {
        const hmac = crypto_1.default.createHmac('sha1', secretKey);
        hmac.update(encodedFlags);
        return hmac.digest('base64');
    }
    urlSafeBase64Encode(jsonFlags) {
        const encoded = buffer_1.Buffer.from(jsonFlags).toString('base64');
        return this.base64ToUrlSafe(encoded);
    }
}
exports.QiniuCloudInstance = QiniuCloudInstance;

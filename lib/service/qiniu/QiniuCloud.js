"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QiniuCloudInstance = void 0;
var tslib_1 = require("tslib");
require('../../fetch');
var crypto_1 = tslib_1.__importDefault(require("crypto"));
var ts_md5_1 = require("ts-md5");
var buffer_1 = require("buffer");
var QiniuCloudInstance = /** @class */ (function () {
    function QiniuCloudInstance(accessKey, secretKey) {
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
    QiniuCloudInstance.prototype.getUploadInfo = function (uploadHost, domain, bucket, key) {
        try {
            var scope = key ? "".concat(bucket, ":").concat(key) : bucket;
            var uploadToken = this.getToken(scope);
            return {
                key: key,
                uploadToken: uploadToken,
                uploadHost: uploadHost,
                bucket: bucket,
                domain: domain,
            };
        }
        catch (err) {
            throw err;
        }
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
    QiniuCloudInstance.prototype.getLiveToken = function (method, path, host, rawQuery, contentType, bodyStr) {
        // 1. 添加 Path
        var data = "".concat(method, " ").concat(path);
        if (rawQuery) {
            data += "?".concat(rawQuery);
        }
        data += "\nHost: ".concat(host);
        if (contentType) {
            data += "\nContent-Type: ".concat(contentType);
        }
        data += '\n\n';
        if (bodyStr &&
            contentType &&
            contentType !== 'application/octet-stream') {
            data += bodyStr;
        }
        var sign = this.hmacSha1(data, this.secretKey);
        var encodedSign = this.base64ToUrlSafe(sign);
        var toke = 'Qiniu ' + this.accessKey + ':' + encodedSign;
        return toke;
    };
    QiniuCloudInstance.prototype.getLiveStream = function (hub, method, streamTitle, host, publishDomain, playDomain, publishKey, playKey, expireAt) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var path, key, bodyStr, contentType, token, url, obj;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        path = "/v2/hubs/".concat(hub, "/streams");
                        key = streamTitle;
                        if (!key) {
                            key = "class".concat(new Date().getTime());
                        }
                        bodyStr = JSON.stringify({
                            key: key,
                        });
                        contentType = 'application/json';
                        token = this.getLiveToken(method, path, host);
                        url = "https://pili.qiniuapi.com/v2/hubs/".concat(hub, "/streams");
                        return [4 /*yield*/, global.fetch(url, {
                                method: 'POST',
                                headers: {
                                    Authorization: token,
                                    'Content-Type': contentType,
                                },
                                body: bodyStr,
                                mode: 'no-cors',
                            })];
                    case 1:
                        _a.sent();
                        obj = this.getStreamObj(publishDomain, playDomain, hub, publishKey, playKey, streamTitle, expireAt);
                        return [2 /*return*/, obj];
                }
            });
        });
    };
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
    QiniuCloudInstance.prototype.getStreamObj = function (publishDomain, playDomain, hub, publishKey, playKey, streamTitle, expireAt) {
        var signStr = "/".concat(hub, "/").concat(streamTitle, "?expire=").concat(expireAt);
        var sourcePath = "/".concat(hub, "/").concat(streamTitle);
        var token = this.base64ToUrlSafe(this.hmacSha1(signStr, publishKey));
        var rtmpPushUrl = "rtmp://".concat(publishDomain).concat(signStr, "&token=").concat(token);
        // 生成播放地址
        var t = expireAt.toString(16).toLowerCase();
        var playSign = ts_md5_1.Md5.hashStr(playKey + sourcePath + t)
            .toString()
            .toLowerCase();
        var rtmpPlayUrl = "https://".concat(playDomain).concat(sourcePath, ".m3u8?sign=").concat(playSign, "&t=").concat(t);
        // obs推流需要的地址和串流密钥
        var pcPushUrl = "rtmp://".concat(publishDomain, "/").concat(hub, "/");
        var streamKey = "".concat(streamTitle, "?expire=").concat(expireAt, "&token=").concat(token);
        return {
            streamTitle: streamTitle,
            hub: hub,
            rtmpPushUrl: rtmpPushUrl,
            rtmpPlayUrl: rtmpPlayUrl,
            pcPushUrl: pcPushUrl,
            streamKey: streamKey,
            expireAt: expireAt,
        };
    };
    QiniuCloudInstance.prototype.getPlayBackUrl = function (hub, playBackDomain, streamTitle, start, end, method, host, rawQuery) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var encodeStreamTitle, path, bodyStr, contentType, token, url;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        encodeStreamTitle = this.base64ToUrlSafe(streamTitle);
                        path = "/v2/hubs/".concat(hub, "/streams/").concat(encodeStreamTitle, "/saveas");
                        bodyStr = JSON.stringify({
                            fname: streamTitle,
                            start: start,
                            end: end,
                        });
                        contentType = 'application/json';
                        token = this.getLiveToken(method, path, host, rawQuery, contentType, bodyStr);
                        url = "https://pili.qiniuapi.com".concat(path);
                        return [4 /*yield*/, global.fetch(url, {
                                method: 'POST',
                                headers: {
                                    Authorization: token,
                                    'Content-Type': contentType,
                                },
                                body: bodyStr,
                                mode: 'no-cors',
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, "https://".concat(playBackDomain, "/").concat(streamTitle, ".m3u8")];
                }
            });
        });
    };
    QiniuCloudInstance.prototype.getToken = function (scope) {
        // 构造策略
        var putPolicy = {
            scope: scope,
            deadline: 3600 + Math.floor(Date.now() / 1000),
        };
        // 构造凭证
        var encodedFlags = this.urlSafeBase64Encode(JSON.stringify(putPolicy));
        var encoded = this.hmacSha1(encodedFlags, this.secretKey);
        var encodedSign = this.base64ToUrlSafe(encoded);
        var uploadToken = this.accessKey + ':' + encodedSign + ':' + encodedFlags;
        return uploadToken;
    };
    QiniuCloudInstance.prototype.base64ToUrlSafe = function (v) {
        return v.replace(/\//g, '_').replace(/\+/g, '-');
    };
    QiniuCloudInstance.prototype.hmacSha1 = function (encodedFlags, secretKey) {
        var hmac = crypto_1.default.createHmac('sha1', secretKey);
        hmac.update(encodedFlags);
        return hmac.digest('base64');
    };
    QiniuCloudInstance.prototype.urlSafeBase64Encode = function (jsonFlags) {
        var encoded = buffer_1.Buffer.from(jsonFlags).toString('base64');
        return this.base64ToUrlSafe(encoded);
    };
    return QiniuCloudInstance;
}());
exports.QiniuCloudInstance = QiniuCloudInstance;

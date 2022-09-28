"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QiniuCloudInstance = void 0;
var tslib_1 = require("tslib");
var crypto_1 = tslib_1.__importDefault(require("crypto"));
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
        data += "\n\n";
        if (bodyStr && contentType && contentType !== "application/octet-stream") {
            data += bodyStr;
        }
        console.log('data', data);
        var sign = this.hmacSha1(data, this.secretKey);
        var encodedSign = this.base64ToUrlSafe(sign);
        var toke = "Qiniu " + this.accessKey + ":" + encodedSign;
        return toke;
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

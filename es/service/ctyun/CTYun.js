// import AWS from 'aws-sdk';
import crypto from 'crypto';
import { OakNetworkException, } from 'oak-domain/lib/types/Exception';
const CTYun_ENDPOINT_LIST = {
    hazz: {
        ul: 'oos-hazz.ctyunapi.cn',
    },
    lnsy: {
        ul: 'oos-lnsy.ctyunapi.cn',
    },
    sccd: {
        ul: 'oos-sccd.ctyunapi.cn',
    },
    xjwlmq: {
        ul: 'oos-xjwlmq.ctyunapi.cn',
    },
    gslz: {
        ul: 'oos-gslz.ctyunapi.cn',
    },
    sdqd: {
        ul: 'oos-sdqd.ctyunapi.cn',
    },
    gzgy: {
        ul: 'oos-gzgy.ctyunapi.cn',
    },
    hbwh: {
        ul: 'oos-hbwh.ctyunapi.cn',
    },
    xzls: {
        ul: 'oos-xzls.ctyunapi.cn',
    },
    ahwh: {
        ul: 'oos-ahwh.ctyunapi.cn',
    },
    gdsz: {
        ul: 'oos-gdsz.ctyunapi.cn',
    },
    jssz: {
        ul: 'oos-jssz.ctyunapi.cn',
    },
    sh2: {
        ul: 'oos-sh2.ctyunapi.cn',
    },
};
const serviceName = 's3';
const v4Identifier = 'aws4_request';
const expiresHeader = "presigned-expires";
const unsignableHeaders = ["authorization", "x-ctyun-data-location", "content-length", "user-agent", expiresHeader, "expect", "x-amzn-trace-id"];
export class CTYunInstance {
    accessKey;
    secretKey;
    constructor(accessKey, secretKey) {
        this.accessKey = accessKey;
        this.secretKey = secretKey;
    }
    getUploadInfo(bucket, zone, key) {
        try {
            // const uploadToken = this.getToken(zone, bucket, actions);
            const signInfo = this.getSignInfo(bucket);
            return {
                key,
                accessKey: this.accessKey,
                policy: signInfo.encodePolicy,
                signature: signInfo.signature,
                uploadHost: `https://${bucket}.${CTYun_ENDPOINT_LIST[zone].ul}`,
                bucket,
            };
        }
        catch (err) {
            throw err;
        }
    }
    getSignInfo(bucket) {
        // 对于policy里的expiration，我在天翼云的文档里没有找到具体的说明，但是这个字段不填入就会请求失败
        // 设置一个明天过期的时间
        const now = new Date();
        now.setDate(now.getDate() + 1);
        const tomorrow = now.toISOString();
        const policy = {
            Version: "2012-10-17",
            Statement: [{
                    Effect: "Allow",
                    Action: ["oos:*"],
                    Resource: `arn:ctyun:oos:::${bucket} /*`
                }],
            expiration: tomorrow,
            conditions: [{
                    bucket: bucket,
                }, [
                    "starts-with",
                    "$key",
                    "extraFile",
                ]]
        };
        const encodePolicy = this.urlSafeBase64Encode(JSON.stringify(policy));
        const signature = this.hmacSha1(encodePolicy, this.secretKey);
        return {
            encodePolicy,
            signature
        };
    }
    base64ToUrlSafe(v) {
        return v.replace(/\//g, '_').replace(/\+/g, '-');
    }
    hmacSha1(encodedFlags, secretKey) {
        const hmac = crypto.createHmac('sha1', secretKey);
        hmac.update(encodedFlags);
        return hmac.digest('base64');
    }
    urlSafeBase64Encode(jsonFlags) {
        const encoded = Buffer.from(jsonFlags).toString('base64');
        return this.base64ToUrlSafe(encoded);
    }
    // 当初就不应该封装天翼云，文档不全，找技术要签名代码还得自己去看源码，恶心
    // 下面的代码是根据天翼云生成签名源码改动得来 oos-js-sdk-6.2.js
    async removeFile(bucket, zone, key) {
        const path = `/${bucket}/${key}`;
        const host = `${CTYun_ENDPOINT_LIST[zone].ul}`;
        const url = `https://${host}${path}`;
        const date = new Date().toISOString().replace(/\.\d{3}Z$/, "Z").replace(/[:\-]|\.\d{3}/g, "");
        const headers = {
            "Content-Type": "application/octet-stream; charset=UTF-8",
            "Host": "oos-hbwh.ctyunapi.cn",
            "X-Amz-Content-Sha256": "UNSIGNED-PAYLOAD",
            "X-Amz-User-Agent": "aws-sdk-js/2.296.0 callback"
        };
        headers["X-Amz-Date"] = date;
        const reqOptions = {
            path,
            host,
            date,
            headers,
            method: "DELETE",
        };
        const authorization = this.getAuthorization(reqOptions, zone);
        headers['Authorization'] = authorization;
        try {
            await fetch(url, {
                method: 'DELETE',
                headers,
            });
        }
        catch (err) {
            throw new OakNetworkException();
        }
    }
    getAuthorization(reqOptions, zone) {
        const { headers, date } = reqOptions;
        const parts = [];
        const credString = [date.substring(0, 8), zone, serviceName, v4Identifier].join("/");
        parts.push("AWS4-HMAC-SHA256" + " Credential=" + this.accessKey + "/" + credString);
        parts.push("SignedHeaders=" + this.signedHeaders(headers));
        parts.push("Signature=" + this.signatureFn(reqOptions, zone));
        return parts.join(", ");
    }
    signatureFn(reqOptions, zone) {
        const { date } = reqOptions;
        var signingKey = this.getSigningKey(date.substring(0, 8), zone);
        return this.hmacSha256(signingKey, this.stringToSign(reqOptions, zone), "hex");
    }
    stringToSign(reqOptions, zone) {
        const { date, path, method, headers } = reqOptions;
        var parts = [];
        parts.push("AWS4-HMAC-SHA256");
        parts.push(date);
        parts.push([date.substring(0, 8), zone, serviceName, v4Identifier].join("/"));
        const canonicalStr = this.canonicalString(path, method, headers);
        const buffer = Buffer.from(canonicalStr);
        const encodeStr = crypto.createHash('sha256').update(buffer).digest('hex');
        parts.push(encodeStr);
        return parts.join("\n");
    }
    signedHeaders(headers) {
        const keys = [];
        this.each(headers, (key) => {
            key = key.toLowerCase();
            if (this.isSignableHeader(key))
                keys.push(key);
        });
        return keys.sort().join(";");
    }
    canonicalString(path, method, headers) {
        const parts = [];
        parts.push(method);
        parts.push(path);
        parts.push("");
        parts.push(this.canonicalHeaders(headers) + "\n");
        parts.push(this.signedHeaders(headers));
        parts.push("UNSIGNED-PAYLOAD");
        return parts.join("\n");
    }
    canonicalHeaders(headers) {
        const headerarr = [];
        this.each(headers, function (key, item) {
            headerarr.push([key, item]);
        });
        headerarr.sort(function (a, b) {
            return a[0].toLowerCase() < b[0].toLowerCase() ? -1 : 1;
        });
        const parts = [];
        this.arrayEach(headerarr, (item) => {
            let key = item[0].toLowerCase();
            if (this.isSignableHeader(key)) {
                var value = item[1];
                if (typeof value === "undefined" || value === null || typeof value.toString !== "function") {
                    throw new Error("Header " + key + " contains invalid value");
                }
                parts.push(key + ":" + this.canonicalHeaderValues(value.toString()));
            }
        });
        return parts.join("\n");
    }
    canonicalHeaderValues(values) {
        return values.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
    }
    getSigningKey(date, zone) {
        const kDate = this.hmacSha256("AWS4" + this.secretKey, date);
        const kRegion = this.hmacSha256(kDate, zone);
        const kService = this.hmacSha256(kRegion, serviceName);
        var signingKey = this.hmacSha256(kService, v4Identifier);
        return signingKey;
    }
    hmacSha256(key, content, digest, fn) {
        if (!fn)
            fn = "sha256";
        if (typeof content === "string")
            content = Buffer.from(content);
        if (!digest) {
            return crypto.createHmac(fn, key).update(content).digest();
        }
        return crypto.createHmac(fn, key).update(content).digest(digest);
    }
    each(object, iterFunction) {
        for (let key in object) {
            if (Object.prototype.hasOwnProperty.call(object, key)) {
                const ret = iterFunction.call(this, key, object[key]);
                if (Object.keys(ret).length === 0)
                    break;
            }
        }
    }
    arrayEach(array, iterFunction) {
        for (let idx in array) {
            if (Object.prototype.hasOwnProperty.call(array, idx)) {
                const ret = iterFunction.call(this, array[idx], parseInt(idx, 10));
                if (Object.keys(ret).length === 0)
                    break;
            }
        }
    }
    isSignableHeader(key) {
        if (key.toLowerCase().indexOf("x-amz-") === 0)
            return true;
        return unsignableHeaders.indexOf(key) < 0;
    }
}

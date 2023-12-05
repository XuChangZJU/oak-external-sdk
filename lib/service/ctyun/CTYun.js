"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CTYunInstance = void 0;
const tslib_1 = require("tslib");
// import AWS from 'aws-sdk';
const crypto_1 = tslib_1.__importDefault(require("crypto"));
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
class CTYunInstance {
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
                uploadHost: `http://${bucket}.${CTYun_ENDPOINT_LIST[zone].ul}`,
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
    //     getToken(zone: CTYunZone, bucket: string, actions?: Action[]) {
    //         const config = {
    //             accessKeyId: this.accessKey,
    //             secretAccessKey: this.secretKey,
    //             endpoint: `http://${CTYun_ENDPOINT_LIST[zone].ul}`,
    //             region: "ctyun",
    //         }
    //         const stsClient = new AWS.STS(config);
    //         const actions2 = actions ? actions.map((ele) => `s3:${ele}`) : ['s3:*'];
    //         const params = {
    //             Policy: `{"Version":"2012-10-17","Statement":{"Effect":"Allow","A
    // ction":${actions2},"Resource":["arn:aws:s3:::${bucket}","arn:aws:s
    // 3:::${bucket}/*"]}}`,
    //             RoleArn: "arn:aws:iam:::role/oak",
    //             RoleSessionName: "oak",
    //             DurationSeconds: 900, // 过期时间
    //         }
    //         stsClient.assumeRole(params, (err, data) => {
    //             if (err) {
    //                 throw err;
    //             }
    //             else {
    //                 console.log('success', data);
    //                 return data;
    //             }
    //         })
    //     }
    base64ToUrlSafe(v) {
        return v.replace(/\//g, '_').replace(/\+/g, '-');
    }
    hmacSha1(encodedFlags, secretKey) {
        const hmac = crypto_1.default.createHmac('sha1', secretKey);
        hmac.update(encodedFlags);
        return hmac.digest('base64');
    }
    urlSafeBase64Encode(jsonFlags) {
        const encoded = Buffer.from(jsonFlags).toString('base64');
        return this.base64ToUrlSafe(encoded);
    }
}
exports.CTYunInstance = CTYunInstance;

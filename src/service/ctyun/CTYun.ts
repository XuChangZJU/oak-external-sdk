// import AWS from 'aws-sdk';
import crypto from 'crypto';
import { Action, CTYunZone } from '../../types/CTYun';

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

export class CTYunInstance {
    private accessKey: string;
    private secretKey: string;

    constructor(accessKey: string, secretKey: string,) {
        this.accessKey = accessKey;
        this.secretKey = secretKey;
    }

    getUploadInfo(bucket: string, zone: CTYunZone, key?: string) {
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
        } catch (err) {
            throw err;
        }
    }

    getSignInfo(bucket: string) {
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
        }
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

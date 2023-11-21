"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CTYunInstance = void 0;
const tslib_1 = require("tslib");
const aws_sdk_1 = tslib_1.__importDefault(require("aws-sdk"));
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
        ul: 'oos-gslz.ctyunapi.cn',
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
    getUploadInfo(bucket, zone, key, actions) {
        try {
            const uploadToken = this.getToken(zone, bucket, actions);
            return {
                key,
                uploadToken,
                uploadHost: `https://${CTYun_ENDPOINT_LIST[zone].ul}`,
                bucket,
            };
        }
        catch (err) {
            throw err;
        }
    }
    getToken(zone, bucket, actions) {
        const config = {
            accessKeyId: this.accessKey,
            secretAccessKey: this.secretKey,
            endpoint: `http://${CTYun_ENDPOINT_LIST[zone].ul}`,
            region: "ctyun",
        };
        const stsClient = new aws_sdk_1.default.STS(config);
        const actions2 = actions ? actions.map((ele) => `s3:${ele}`) : ['s3:*'];
        const params = {
            Policy: `{"Version":"2012-10-17","Statement":{"Effect":"Allow","A
ction":${actions2},"Resource":["arn:aws:s3:::${bucket}","arn:aws:s
3:::${bucket}/*"]}}`,
            RoleArn: "arn:aws:iam:::role/oak",
            RoleSessionName: "oak",
            DurationSeconds: 900, // 过期时间
        };
        stsClient.assumeRole(params, (err, data) => {
            if (err) {
                throw err;
            }
            else {
                console.log('success', data);
                return data;
            }
        });
    }
}
exports.CTYunInstance = CTYunInstance;

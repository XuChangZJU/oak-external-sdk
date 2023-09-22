"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TencentSmsInstance = void 0;
const sms_client_1 = require("tencentcloud-sdk-nodejs/tencentcloud/services/sms/v20210111/sms_client");
const SmsClient = sms_client_1.Client;
class TencentSmsInstance {
    secretId;
    secretKey;
    region;
    endpoint;
    client;
    constructor(secretId, secretKey, region, endpoint) {
        this.secretId = secretId;
        this.secretKey = secretKey;
        this.region = region;
        this.endpoint = endpoint;
        const clientConfig = {
            credential: {
                secretId: this.secretId,
                secretKey: this.secretKey,
            },
            region: this.region,
            profile: {
                httpProfile: {
                    endpoint: this.endpoint || 'sms.tencentcloudapi.com',
                },
            },
        };
        // 实例化要请求产品的client对象,clientProfile是可选的
        this.client = new SmsClient(clientConfig);
    }
    async sendSms(params) {
        // const params: SendSmsRequest = {
        //     PhoneNumberSet: [],
        //     TemplateParamSet: [],
        //     SmsSdkAppId: '',
        //     TemplateId: '',
        // };
        try {
            const data = await this.client.SendSms(params);
            return data;
        }
        catch (err) {
            console.error(err);
            throw err;
        }
    }
}
exports.TencentSmsInstance = TencentSmsInstance;

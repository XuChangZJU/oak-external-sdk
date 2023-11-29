"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AliSmsInstance = void 0;
const tslib_1 = require("tslib");
const dysmsapi20170525_1 = tslib_1.__importStar(require("@alicloud/dysmsapi20170525")), $Dysmsapi20170525 = dysmsapi20170525_1;
const $OpenApi = tslib_1.__importStar(require("@alicloud/openapi-client"));
const $Util = tslib_1.__importStar(require("@alicloud/tea-util"));
class AliSmsInstance {
    accessKeyId;
    accessKeySecret;
    endpoint;
    client;
    constructor(accessKeyId, accessKeySecret, endpoint) {
        this.accessKeyId = accessKeyId;
        this.accessKeySecret = accessKeySecret;
        this.endpoint = endpoint || 'dysmsapi.aliyuncs.com'; // 目前国内终端域名相同
        let config = new $OpenApi.Config({
            // 必填，您的 AccessKey ID
            accessKeyId: accessKeyId,
            // 必填，您的 AccessKey Secret
            accessKeySecret: accessKeySecret,
            endpoint: this.endpoint,
        });
        this.client = new dysmsapi20170525_1.default(config);
    }
    async sendSms(params) {
        const { PhoneNumbers, TemplateParam = {}, TemplateCode, SignName, } = params;
        let sendSmsRequest = new $Dysmsapi20170525.SendSmsRequest({
            PhoneNumbers: PhoneNumbers.join(','),
            TemplateParam: JSON.stringify(TemplateParam),
            TemplateCode: TemplateCode,
            SignName: SignName,
        });
        try {
            const data = await this.client.sendSmsWithOptions(sendSmsRequest, new $Util.RuntimeOptions({}));
            return data;
        }
        catch (error) {
            throw error;
        }
    }
}
exports.AliSmsInstance = AliSmsInstance;

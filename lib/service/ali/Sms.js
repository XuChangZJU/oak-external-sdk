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
        const { phoneNumbers, templateParam = {}, templateCode, signName, } = params;
        let sendSmsRequest = new $Dysmsapi20170525.SendSmsRequest({
            phoneNumbers: phoneNumbers instanceof Array
                ? phoneNumbers.join(',')
                : phoneNumbers,
            templateParam: JSON.stringify(templateParam),
            templateCode: templateCode,
            signName: signName,
        });
        try {
            const data = await this.client.sendSmsWithOptions(sendSmsRequest, new $Util.RuntimeOptions({}));
            const { statusCode, body } = data;
            if (statusCode != 200) {
                throw new Error(`sendSms接口返回状态码错误，为${statusCode}`);
            }
            return body;
        }
        catch (error) {
            throw error;
        }
    }
    async syncTemplate(params) {
        const { PageIndex, PageSize } = params;
        try {
            let querySmsTemplateListRequest = new $Dysmsapi20170525.QuerySmsTemplateListRequest({
                PageIndex,
                PageSize,
            });
            const result = await this.client.querySmsTemplateListWithOptions(querySmsTemplateListRequest, new $Util.RuntimeOptions({}));
            const { statusCode, body } = result;
            if (statusCode != 200) {
                throw new Error(`syncTemplate接口返回状态码错误，为${statusCode}`);
            }
            return body;
        }
        catch (err) {
            throw err;
        }
    }
}
exports.AliSmsInstance = AliSmsInstance;

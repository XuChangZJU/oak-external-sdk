"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AliSmsInstance = void 0;
const tslib_1 = require("tslib");
const rpc_1 = tslib_1.__importDefault(require("@alicloud/pop-core/lib/rpc"));
class AliSmsInstance {
    accessKeyId;
    accessKeySecret;
    regionId;
    endpoint;
    apiVersion;
    client;
    constructor(accessKeyId, accessKeySecret, regionId, endpoint, apiVersion) {
        this.accessKeyId = accessKeyId;
        this.accessKeySecret = accessKeySecret;
        this.regionId = regionId;
        this.endpoint = endpoint;
        this.apiVersion = apiVersion;
        this.client = new rpc_1.default({
            accessKeyId: this.accessKeyId,
            accessKeySecret: this.accessKeySecret,
            endpoint: this.endpoint || 'dysmsapi.aliyuncs.com',
            apiVersion: this.apiVersion,
        });
    }
    async sendSms(params) {
        const { PhoneNumbers, TemplateParam = {}, TemplateCode, SignName, } = params;
        const param = Object.assign({
            regionId: this.regionId,
        }, {
            PhoneNumbers: PhoneNumbers.join(','),
            TemplateParam: JSON.stringify(TemplateParam),
            TemplateCode: TemplateCode,
            SignName: SignName,
        });
        try {
            // const data = await this.client.request<SendSmsResponse>(
            //     'SendSms',
            //     param,
            //     {
            //         method: 'POST',
            //     }
            // );
            // return data;
        }
        catch (err) {
            console.error(err);
            throw err;
        }
    }
}
exports.AliSmsInstance = AliSmsInstance;

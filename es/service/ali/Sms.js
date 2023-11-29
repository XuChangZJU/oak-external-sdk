import Dysmsapi20170525, * as $Dysmsapi20170525 from '@alicloud/dysmsapi20170525';
import * as $OpenApi from '@alicloud/openapi-client';
import * as $Util from '@alicloud/tea-util';
export class AliSmsInstance {
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
        this.client = new Dysmsapi20170525(config);
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

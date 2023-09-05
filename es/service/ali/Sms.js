import Core from '@alicloud/pop-core/lib/rpc';
export class AliSmsInstance {
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
        this.client = new Core({
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

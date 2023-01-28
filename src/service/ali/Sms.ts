// import Core from '@alicloud/pop-core/lib/rpc';
//todo 引入阿里云的库 在前端跑的时候会出现fs模块不存在

type SendSmsRequest = {
    PhoneNumbers: string[];
    TemplateCode: string;
    SignName: string;
    TemplateParam?: Record<string, string>;
    SmsUpExtendCode?: string;
    OutId?: string;
};

type SendSmsResponse = {
    Code: 'OK' | string;
    Message: string;
    BizId: string;
    RequestId: string;
};

export class AliSmsInstance {
    accessKeyId: string;
    accessKeySecret: string;
    regionId: string;
    endpoint: string;
    apiVersion: string;
    // client: Core;

    constructor(
        accessKeyId: string,
        accessKeySecret: string,
        regionId: string,
        endpoint: string,
        apiVersion: string
    ) {
        this.accessKeyId = accessKeyId;
        this.accessKeySecret = accessKeySecret;
        this.regionId = regionId;
        this.endpoint = endpoint;
        this.apiVersion = apiVersion;

        // this.client = new Core({
        //     accessKeyId: this.accessKeyId,
        //     accessKeySecret: this.accessKeySecret,
        //     endpoint: this.endpoint || 'dysmsapi.aliyuncs.com',
        //     apiVersion: this.apiVersion,
        // });
    }

    async sendSms(params: SendSmsRequest) {
        const {
            PhoneNumbers,
            TemplateParam = {},
            TemplateCode,
            SignName,
        } = params;
        const param = Object.assign(
            {
                regionId: this.regionId,
            },
            {
                PhoneNumbers: PhoneNumbers.join(','),
                TemplateParam: JSON.stringify(TemplateParam),
                TemplateCode: TemplateCode,
                SignName: SignName,
            }
        );

        try {
            // const data = await this.client.request<SendSmsResponse>(
            //     'SendSms',
            //     param,
            //     {
            //         method: 'POST',
            //     }
            // );
            // return data;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}

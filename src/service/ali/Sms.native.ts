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
    secretId: string;
    secretKey: string;
    region: string;
    endpoint: string;
    client: any;

    constructor(
        secretId: string,
        secretKey: string,
        region: string,
        endpoint: string
    ) {
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
                    endpoint: this.endpoint || 'dysmsapi.aliyuncs.com',
                },
            },
        };
    }

    async sendSms(params: SendSmsRequest) {
        console.log('native走不到这里');
        return {} as SendSmsResponse;
    }
}

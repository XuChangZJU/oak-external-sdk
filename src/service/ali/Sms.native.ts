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
    region: string;
    endpoint: string;
    client: any;

    constructor(
        accessKeyId: string,
        accessKeySecret: string,
        region: string,
        endpoint: string
    ) {
        this.accessKeyId = accessKeyId;
        this.accessKeySecret = accessKeySecret;
        this.region = region;
        this.endpoint = endpoint;
    }

    async sendSms(params: SendSmsRequest) {
        console.log('react-native走不到这里[ali/sms.native');
        return {} as SendSmsResponse;
    }
}

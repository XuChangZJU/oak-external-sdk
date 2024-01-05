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
export declare class AliSmsInstance {
    accessKeyId: string;
    accessKeySecret: string;
    region: string;
    endpoint: string;
    client: any;
    constructor(accessKeyId: string, accessKeySecret: string, region: string, endpoint: string);
    sendSms(params: SendSmsRequest): Promise<SendSmsResponse>;
}
export {};

declare type SendSmsRequest = {
    PhoneNumbers: string[];
    TemplateCode: string;
    SignName: string;
    TemplateParam?: Record<string, string>;
    SmsUpExtendCode?: string;
    OutId?: string;
};
declare type SendSmsResponse = {
    Code: 'OK' | string;
    Message: string;
    BizId: string;
    RequestId: string;
};
export declare class AliSmsInstance {
    secretId: string;
    secretKey: string;
    region: string;
    endpoint: string;
    client: any;
    constructor(secretId: string, secretKey: string, region: string, endpoint: string);
    sendSms(params: SendSmsRequest): Promise<SendSmsResponse>;
}
export {};

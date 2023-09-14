import Core from '@alicloud/pop-core/lib/rpc';
type SendSmsRequest = {
    PhoneNumbers: string[];
    TemplateCode: string;
    SignName: string;
    TemplateParam?: Record<string, string>;
    SmsUpExtendCode?: string;
    OutId?: string;
};
export declare class AliSmsInstance {
    accessKeyId: string;
    accessKeySecret: string;
    regionId: string;
    endpoint: string;
    apiVersion: string;
    client: Core;
    constructor(accessKeyId: string, accessKeySecret: string, regionId: string, endpoint: string, apiVersion: string);
    sendSms(params: SendSmsRequest): Promise<void>;
}
export {};

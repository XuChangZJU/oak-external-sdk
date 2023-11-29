import Dysmsapi20170525, * as $Dysmsapi20170525 from '@alicloud/dysmsapi20170525';
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
    endpoint: string;
    client: Dysmsapi20170525;
    constructor(accessKeyId: string, accessKeySecret: string, endpoint?: string);
    sendSms(params: SendSmsRequest): Promise<$Dysmsapi20170525.SendSmsResponse>;
}
export {};

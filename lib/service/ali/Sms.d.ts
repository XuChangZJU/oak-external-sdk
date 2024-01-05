import Dysmsapi20170525, * as $Dysmsapi20170525 from '@alicloud/dysmsapi20170525';
type SendSmsRequest = {
    phoneNumbers: string[];
    templateCode: string;
    signName: string;
    templateParam?: Record<string, string>;
    smsUpExtendCode?: string;
    outId?: string;
};
type DescribeSmsTemplateListRequest = {
    PageIndex: number;
    PageSize: number;
};
export declare class AliSmsInstance {
    accessKeyId: string;
    accessKeySecret: string;
    endpoint: string;
    client: Dysmsapi20170525;
    constructor(accessKeyId: string, accessKeySecret: string, endpoint?: string);
    sendSms(params: SendSmsRequest): Promise<$Dysmsapi20170525.SendSmsResponseBody>;
    syncTemplate(params: DescribeSmsTemplateListRequest): Promise<$Dysmsapi20170525.QuerySmsTemplateListResponseBody>;
}
export {};

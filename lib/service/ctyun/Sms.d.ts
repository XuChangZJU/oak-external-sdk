type SendSmsRequest = {
    phoneNumber: string;
    templateCode: string;
    signName: string;
    templateParam?: Record<string, string>;
    extendCode?: string;
    sessionId?: string;
};
type SendSmsResponse = {
    code: 'OK' | string;
    message: string;
    requestId: string;
};
type DescribeSmsTemplateListRequest = {
    pageIndex: number;
    pageSize: number;
};
type DescribeSmsTemplateListResponse = {
    code: 'OK' | string;
    message: string;
    requestId: string;
    total: number;
    data: {
        reason: string;
        createTime: Date;
        updateTime: Date;
        example: string;
        remark: string;
        status: 0 | 1 | 2;
        templateCode: string;
        templateType: 1 | 2;
        templateName: string;
        templateContent: string;
        templateStatus: 0 | 1 | 2;
    }[];
};
export declare class CTYunSmsInstance {
    accessKey: string;
    securityKey: string;
    endpoint: string;
    constructor(accessKey: string, securityKey: string, endpoint: string);
    sendSms(params: SendSmsRequest): Promise<SendSmsResponse>;
    syncTemplate(params: DescribeSmsTemplateListRequest): Promise<DescribeSmsTemplateListResponse>;
    private access;
    private hmacsha256;
    private sha256;
}
export {};

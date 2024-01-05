type SendSmsRequest = {
    action: 'SendSms' | string;
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
export declare class CTYunSmsInstance {
    accessKey: string;
    securityKey: string;
    endpoint: string;
    constructor(accessKey: string, securityKey: string, endpoint: string);
    sendSms(params: SendSmsRequest): Promise<SendSmsResponse>;
}
export {};

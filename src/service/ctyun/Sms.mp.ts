type SendSmsRequest = {
    action: 'SendSms' | string; // 系统规定参数。取值：SendSms。
    phoneNumber: string; // 接收短信的手机号码。格式：国内短信：无任何前缀的11位手机号码，例如1381111****。多个手机号码使用英文","隔开，最多支持一次提交200个手机号码。
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

export class CTYunSmsInstance {
    accessKey: string;
    securityKey: string;
    endpoint: string;

    constructor(accessKey: string, securityKey: string, endpoint: string) {
        this.accessKey = accessKey;
        this.securityKey = securityKey;
        this.endpoint = endpoint;
    }

    async sendSms(params: SendSmsRequest) {
        console.log('mp走不到这里');
        return {} as SendSmsResponse;
    }
}

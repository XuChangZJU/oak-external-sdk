export class CTYunSmsInstance {
    accessKey;
    securityKey;
    endpoint;
    constructor(accessKey, securityKey, endpoint) {
        this.accessKey = accessKey;
        this.securityKey = securityKey;
        this.endpoint = endpoint;
    }
    async sendSms(params) {
        console.log('web走不到这里');
        return {};
    }
}

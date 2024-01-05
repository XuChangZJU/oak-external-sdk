export class AliSmsInstance {
    accessKeyId;
    accessKeySecret;
    region;
    endpoint;
    client;
    constructor(accessKeyId, accessKeySecret, region, endpoint) {
        this.accessKeyId = accessKeyId;
        this.accessKeySecret = accessKeySecret;
        this.region = region;
        this.endpoint = endpoint;
    }
    async sendSms(params) {
        console.log('react-native走不到这里[ali/sms.native');
        return {};
    }
}

export class TencentSmsInstance {
    secretId;
    secretKey;
    region;
    endpoint;
    client;
    constructor(secretId, secretKey, region, endpoint) {
        this.secretId = secretId;
        this.secretKey = secretKey;
        this.region = region;
        this.endpoint = endpoint;
        const clientConfig = {
            credential: {
                secretId: this.secretId,
                secretKey: this.secretKey,
            },
            region: this.region,
            profile: {
                httpProfile: {
                    endpoint: this.endpoint || 'sms.tencentcloudapi.com',
                },
            },
        };
    }
    async sendSms(params) {
        console.log('mp走不到这里');
        return {};
    }
}

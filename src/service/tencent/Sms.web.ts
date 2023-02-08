import {
    SendSmsRequest,
    SendSmsResponse,
} from 'tencentcloud-sdk-nodejs/tencentcloud/services/sms/v20210111/sms_models';

export class TencentSmsInstance {
    secretId: string;
    secretKey: string;
    region: string;
    endpoint: string;
    client: any;

    constructor(
        secretId: string,
        secretKey: string,
        region: string,
        endpoint: string
    ) {
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

    async sendSms(params: SendSmsRequest) {
        console.log('web走不到这里');
        return {} as SendSmsResponse;
    }
}

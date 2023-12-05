import { Client } from 'tencentcloud-sdk-nodejs/tencentcloud/services/sms/v20210111/sms_client';
import { SendSmsRequest, SendSmsResponse, DescribeSmsTemplateListRequest, DescribeSmsTemplateListResponse } from 'tencentcloud-sdk-nodejs/tencentcloud/services/sms/v20210111/sms_models';

const SmsClient = Client;

export class TencentSmsInstance {
    secretId: string;
    secretKey: string;
    region: string;
    endpoint: string;
    client: Client;

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

        // 实例化要请求产品的client对象,clientProfile是可选的
        this.client = new SmsClient(clientConfig);
    }

    async sendSms(params: SendSmsRequest) {
        try {
            const result: SendSmsResponse = await this.client.SendSms(params);
            return result;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
    async syncTemplate(params: DescribeSmsTemplateListRequest) {
        try {
            const result: DescribeSmsTemplateListResponse = await this.client.DescribeSmsTemplateList(params);
            return result
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}
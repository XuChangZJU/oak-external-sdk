import { Client } from 'tencentcloud-sdk-nodejs/tencentcloud/services/sms/v20210111/sms_client';
import { SendSmsRequest, SendSmsResponse } from 'tencentcloud-sdk-nodejs/tencentcloud/services/sms/v20210111/sms_models';
export declare class TencentSmsInstance {
    secretId: string;
    secretKey: string;
    region: string;
    endpoint: string;
    client: Client;
    constructor(secretId: string, secretKey: string, region: string, endpoint: string);
    sendSms(params: SendSmsRequest): Promise<SendSmsResponse>;
}

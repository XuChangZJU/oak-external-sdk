import { SendSmsRequest, SendSmsResponse } from 'tencentcloud-sdk-nodejs/tencentcloud/services/sms/v20210111/sms_models';
export declare class TencentSmsInstance {
    sendSms(params: SendSmsRequest): Promise<SendSmsResponse>;
}

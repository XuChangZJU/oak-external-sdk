import {
    SendSmsRequest,
    SendSmsResponse,
} from 'tencentcloud-sdk-nodejs/tencentcloud/services/sms/v20210111/sms_models';

export class TencentSmsInstance {
    async sendSms(params: SendSmsRequest) {
        console.log('native走不到这里');
        return {} as SendSmsResponse;
    }
}

import { TencentSmsInstance } from './service/tencent/Sms';
import { AliSmsInstance } from './service/ali/Sms';
declare class SmsSDK {
    tencentMap: Record<string, TencentSmsInstance>;
    aliMap: Record<string, AliSmsInstance>;
    constructor();
    getInstance(origin: 'ali' | 'tencent', accessKey: string, accessSecret: string, endpoint: string, region?: string, apiVersion?: string): TencentSmsInstance | AliSmsInstance;
}
declare const SDK: SmsSDK;
export default SDK;
export { TencentSmsInstance, AliSmsInstance };

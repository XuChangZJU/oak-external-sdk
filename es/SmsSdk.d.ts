import { TencentSmsInstance } from './service/tencent/Sms';
import { AliSmsInstance } from './service/ali/Sms';
import { CTYunSmsInstance } from './service/ctyun/Sms';
declare class SmsSDK {
    tencentMap: Record<string, TencentSmsInstance>;
    aliMap: Record<string, AliSmsInstance>;
    ctyunMap: Record<string, CTYunSmsInstance>;
    constructor();
    getInstance(origin: 'ali' | 'tencent' | 'ctyun', accessKey: string, accessSecret: string, endpoint: string, region?: string, apiVersion?: string): TencentSmsInstance | AliSmsInstance | CTYunSmsInstance;
}
declare const SDK: SmsSDK;
export default SDK;
export { TencentSmsInstance, AliSmsInstance, CTYunSmsInstance };

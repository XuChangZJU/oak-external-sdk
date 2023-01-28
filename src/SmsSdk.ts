import { TencentSmsInstance } from './service/tencent/Sms';
import { AliSmsInstance } from './service/ali/Sms';
import assert from 'assert';

class SmsSDK {
    tencentMap: Record<string, TencentSmsInstance>;
    aliMap: Record<string, AliSmsInstance>;

    constructor() {
        this.tencentMap = {};
        this.aliMap = {};
    }

    getInstance(
        origin: 'ali' | 'tencent',
        accessKey: string,
        accessSecret: string,
        region: string,
        endpoint: string,
        apiVersion?: string //阿里云独有
    ) {
        if (origin === 'tencent') {
            if (this.tencentMap[accessKey]) {
                return this.tencentMap[accessKey];
            }
            const instance = new TencentSmsInstance(
                accessKey,
                accessSecret,
                region,
                endpoint
            );
            Object.assign(this.tencentMap, {
                [accessKey]: instance,
            });
            return instance;
        } else if (origin === 'ali') {
            assert(apiVersion, '阿里云短信apiVersion必须传入');
            if (this.aliMap[accessKey]) {
                return this.aliMap[accessKey];
            }
            const instance = new AliSmsInstance(
                accessKey,
                accessSecret,
                region,
                endpoint,
                apiVersion
            );
            Object.assign(this.aliMap, {
                [accessKey]: instance,
            });
            return instance;
        } else {
            throw new Error(`${origin} not implemented`);
        }
    }
}

const SDK = new SmsSDK();
export default SDK;

export { TencentSmsInstance, AliSmsInstance };

import { TencentSmsInstance } from './service/tencent/Sms';
import { AliSmsInstance } from './service/ali/Sms';
class SmsSDK {
    tencentMap;
    aliMap;
    constructor() {
        this.tencentMap = {};
        this.aliMap = {};
    }
    getInstance(origin, accessKey, accessSecret, region, endpoint, apiVersion //阿里云独有
    ) {
        if (origin === 'tencent') {
            if (this.tencentMap[accessKey]) {
                return this.tencentMap[accessKey];
            }
            const instance = new TencentSmsInstance(accessKey, accessSecret, region, endpoint);
            Object.assign(this.tencentMap, {
                [accessKey]: instance,
            });
            return instance;
        }
        else if (origin === 'ali') {
            if (!apiVersion) {
                throw new Error('阿里云短信apiVersion必须传入');
            }
            if (this.aliMap[accessKey]) {
                return this.aliMap[accessKey];
            }
            const instance = new AliSmsInstance(accessKey, accessSecret, region, endpoint, apiVersion);
            Object.assign(this.aliMap, {
                [accessKey]: instance,
            });
            return instance;
        }
        else {
            throw new Error(`${origin} not implemented`);
        }
    }
}
const SDK = new SmsSDK();
export default SDK;
export { TencentSmsInstance, AliSmsInstance };

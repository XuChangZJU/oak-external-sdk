import { TencentSmsInstance } from './service/tencent/Sms';
import { AliSmsInstance } from './service/ali/Sms';
import { CTYunSmsInstance } from './service/ctyun/Sms';

import { assert } from 'oak-domain/lib/utils/assert';

class SmsSDK {
    tencentMap: Record<string, TencentSmsInstance>;
    aliMap: Record<string, AliSmsInstance>;
    ctyunMap: Record<string, CTYunSmsInstance>;

    constructor() {
        this.tencentMap = {};
        this.aliMap = {};
        this.ctyunMap = {};
    }

    getInstance(
        origin: 'ali' | 'tencent' | 'ctyun',
        accessKey: string,
        accessSecret: string,
        endpoint: string,
        region?: string,
        apiVersion?: string //阿里云独有
    ) {
        if (origin === 'tencent') {
            if (this.tencentMap[accessKey]) {
                return this.tencentMap[accessKey];
            }
            const instance = new TencentSmsInstance(
                accessKey,
                accessSecret,
                region!,
                endpoint!
            );
            Object.assign(this.tencentMap, {
                [accessKey]: instance,
            });
            return instance;
        } else if (origin === 'ali') {
            // if (!apiVersion) {
            //     assert(false, '阿里云短信apiVersion必须传入');
            // }
            if (this.aliMap[accessKey]) {
                return this.aliMap[accessKey];
            }
            const instance = new AliSmsInstance(
                accessKey,
                accessSecret,
                endpoint
            );
            Object.assign(this.aliMap, {
                [accessKey]: instance,
            });
            return instance;
        } else if (origin === 'ctyun') {
            if (this.ctyunMap[accessKey]) {
                return this.ctyunMap[accessKey];
            }
            const instance = new CTYunSmsInstance(
                accessKey,
                accessSecret,
                endpoint
            );
            Object.assign(this.ctyunMap, {
                [accessKey]: instance,
            });
            return instance;
        } else {
            assert(false, `${origin} not implemented`);
        }
    }
}

const SDK = new SmsSDK();
export default SDK;

export { TencentSmsInstance, AliSmsInstance, CTYunSmsInstance };

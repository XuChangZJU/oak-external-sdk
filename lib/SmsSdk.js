"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AliSmsInstance = exports.TencentSmsInstance = void 0;
const Sms_1 = require("./service/tencent/Sms");
Object.defineProperty(exports, "TencentSmsInstance", { enumerable: true, get: function () { return Sms_1.TencentSmsInstance; } });
const Sms_2 = require("./service/ali/Sms");
Object.defineProperty(exports, "AliSmsInstance", { enumerable: true, get: function () { return Sms_2.AliSmsInstance; } });
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
            const instance = new Sms_1.TencentSmsInstance(accessKey, accessSecret, region, endpoint);
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
            const instance = new Sms_2.AliSmsInstance(accessKey, accessSecret, region, endpoint, apiVersion);
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
exports.default = SDK;

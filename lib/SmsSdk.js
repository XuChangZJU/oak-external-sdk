"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AliSmsInstance = exports.TencentSmsInstance = void 0;
var tslib_1 = require("tslib");
var Sms_1 = require("./service/tencent/Sms");
Object.defineProperty(exports, "TencentSmsInstance", { enumerable: true, get: function () { return Sms_1.TencentSmsInstance; } });
var Sms_2 = require("./service/ali/Sms");
Object.defineProperty(exports, "AliSmsInstance", { enumerable: true, get: function () { return Sms_2.AliSmsInstance; } });
var assert_1 = tslib_1.__importDefault(require("assert"));
var SmsSDK = /** @class */ (function () {
    function SmsSDK() {
        this.tencentMap = {};
        this.aliMap = {};
    }
    SmsSDK.prototype.getInstance = function (origin, accessKey, accessSecret, region, endpoint, apiVersion //阿里云独有
    ) {
        var _a, _b;
        if (origin === 'tencent') {
            if (this.tencentMap[accessKey]) {
                return this.tencentMap[accessKey];
            }
            var instance = new Sms_1.TencentSmsInstance(accessKey, accessSecret, region, endpoint);
            Object.assign(this.tencentMap, (_a = {},
                _a[accessKey] = instance,
                _a));
            return instance;
        }
        else if (origin === 'ali') {
            (0, assert_1.default)(apiVersion, '阿里云短信apiVersion必须传入');
            if (this.aliMap[accessKey]) {
                return this.aliMap[accessKey];
            }
            var instance = new Sms_2.AliSmsInstance(accessKey, accessSecret, region, endpoint, apiVersion);
            Object.assign(this.aliMap, (_b = {},
                _b[accessKey] = instance,
                _b));
            return instance;
        }
        else {
            throw new Error("".concat(origin, " not implemented"));
        }
    };
    return SmsSDK;
}());
var SDK = new SmsSDK();
exports.default = SDK;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TencentSmsInstance = void 0;
var tslib_1 = require("tslib");
var TencentSmsInstance = /** @class */ (function () {
    function TencentSmsInstance(secretId, secretKey, region, endpoint) {
        this.secretId = secretId;
        this.secretKey = secretKey;
        this.region = region;
        this.endpoint = endpoint;
        var clientConfig = {
            credential: {
                secretId: this.secretId,
                secretKey: this.secretKey,
            },
            region: this.region,
            profile: {
                httpProfile: {
                    endpoint: this.endpoint || 'sms.tencentcloudapi.com',
                },
            },
        };
    }
    TencentSmsInstance.prototype.sendSms = function (params) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                console.log('mp走不到这里');
                return [2 /*return*/, {}];
            });
        });
    };
    return TencentSmsInstance;
}());
exports.TencentSmsInstance = TencentSmsInstance;

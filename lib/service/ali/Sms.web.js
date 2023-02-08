"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AliSmsInstance = void 0;
var tslib_1 = require("tslib");
var AliSmsInstance = /** @class */ (function () {
    function AliSmsInstance(secretId, secretKey, region, endpoint) {
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
                    endpoint: this.endpoint || 'dysmsapi.aliyuncs.com',
                },
            },
        };
    }
    AliSmsInstance.prototype.sendSms = function (params) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                console.log('web走不到这里');
                return [2 /*return*/, {}];
            });
        });
    };
    return AliSmsInstance;
}());
exports.AliSmsInstance = AliSmsInstance;

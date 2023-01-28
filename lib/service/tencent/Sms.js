"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TencentSmsInstance = void 0;
var tslib_1 = require("tslib");
var sms_client_1 = require("tencentcloud-sdk-nodejs/tencentcloud/services/sms/v20210111/sms_client");
var SmsClient = sms_client_1.Client;
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
        // 实例化要请求产品的client对象,clientProfile是可选的
        this.client = new SmsClient(clientConfig);
    }
    TencentSmsInstance.prototype.sendSms = function (params) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var data, err_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.SendSms(params)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data];
                    case 2:
                        err_1 = _a.sent();
                        console.error(err_1);
                        throw err_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return TencentSmsInstance;
}());
exports.TencentSmsInstance = TencentSmsInstance;

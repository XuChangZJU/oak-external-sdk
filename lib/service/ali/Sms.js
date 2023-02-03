"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AliSmsInstance = void 0;
var tslib_1 = require("tslib");
var rpc_1 = tslib_1.__importDefault(require("@alicloud/pop-core/lib/rpc"));
var AliSmsInstance = /** @class */ (function () {
    function AliSmsInstance(accessKeyId, accessKeySecret, regionId, endpoint, apiVersion) {
        this.accessKeyId = accessKeyId;
        this.accessKeySecret = accessKeySecret;
        this.regionId = regionId;
        this.endpoint = endpoint;
        this.apiVersion = apiVersion;
        this.client = new rpc_1.default({
            accessKeyId: this.accessKeyId,
            accessKeySecret: this.accessKeySecret,
            endpoint: this.endpoint || 'dysmsapi.aliyuncs.com',
            apiVersion: this.apiVersion,
        });
    }
    AliSmsInstance.prototype.sendSms = function (params) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var PhoneNumbers, _a, TemplateParam, TemplateCode, SignName, param;
            return tslib_1.__generator(this, function (_b) {
                PhoneNumbers = params.PhoneNumbers, _a = params.TemplateParam, TemplateParam = _a === void 0 ? {} : _a, TemplateCode = params.TemplateCode, SignName = params.SignName;
                param = Object.assign({
                    regionId: this.regionId,
                }, {
                    PhoneNumbers: PhoneNumbers.join(','),
                    TemplateParam: JSON.stringify(TemplateParam),
                    TemplateCode: TemplateCode,
                    SignName: SignName,
                });
                try {
                    // const data = await this.client.request<SendSmsResponse>(
                    //     'SendSms',
                    //     param,
                    //     {
                    //         method: 'POST',
                    //     }
                    // );
                    // return data;
                }
                catch (err) {
                    console.error(err);
                    throw err;
                }
                return [2 /*return*/];
            });
        });
    };
    return AliSmsInstance;
}());
exports.AliSmsInstance = AliSmsInstance;

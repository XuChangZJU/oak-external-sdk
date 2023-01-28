"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WechatPublicInstance = exports.WechatWebInstance = exports.WechatMpInstance = void 0;
var WechatMp_1 = require("./service/wechat/WechatMp");
Object.defineProperty(exports, "WechatMpInstance", { enumerable: true, get: function () { return WechatMp_1.WechatMpInstance; } });
var WechatPublic_1 = require("./service/wechat/WechatPublic");
Object.defineProperty(exports, "WechatPublicInstance", { enumerable: true, get: function () { return WechatPublic_1.WechatPublicInstance; } });
var WechatWeb_1 = require("./service/wechat/WechatWeb");
Object.defineProperty(exports, "WechatWebInstance", { enumerable: true, get: function () { return WechatWeb_1.WechatWebInstance; } });
var WechatSDK = /** @class */ (function () {
    function WechatSDK() {
        this.mpMap = {};
        this.publicMap = {};
        this.webMap = {};
    }
    WechatSDK.prototype.getInstance = function (appId, appSecret, type) {
        var _a, _b, _c;
        // type 支持web网站扫码登录
        if (type === 'wechatMp') {
            if (this.mpMap[appId]) {
                return this.mpMap[appId];
            }
            var instance = new WechatMp_1.WechatMpInstance(appId, appSecret);
            Object.assign(this.mpMap, (_a = {},
                _a[appId] = instance,
                _a));
            return instance;
        }
        else if (type === 'wechatPublic') {
            if (this.publicMap[appId]) {
                return this.publicMap[appId];
            }
            var instance = new WechatPublic_1.WechatPublicInstance(appId, appSecret);
            Object.assign(this.publicMap, (_b = {},
                _b[appId] = instance,
                _b));
            return instance;
        }
        else if (type === 'web') {
            if (this.webMap[appId]) {
                return this.webMap[appId];
            }
            var instance = new WechatWeb_1.WechatWebInstance(appId, appSecret);
            Object.assign(this.webMap, (_c = {},
                _c[appId] = instance,
                _c));
            return instance;
        }
        else {
            throw new Error("".concat(type, " not implemented"));
        }
    };
    return WechatSDK;
}());
var SDK = new WechatSDK();
exports.default = SDK;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QiniuCloudInstance = void 0;
var QiniuCloud_1 = require("./service/qiniu/QiniuCloud");
Object.defineProperty(exports, "QiniuCloudInstance", { enumerable: true, get: function () { return QiniuCloud_1.QiniuCloudInstance; } });
var QiniuSDK = /** @class */ (function () {
    function QiniuSDK() {
        this.qiniuMap = {};
    }
    QiniuSDK.prototype.getInstance = function (accessKey, accessSecret) {
        var _a;
        if (this.qiniuMap[accessKey]) {
            return this.qiniuMap[accessKey];
        }
        var instance = new QiniuCloud_1.QiniuCloudInstance(accessKey, accessSecret);
        Object.assign(this.qiniuMap, (_a = {},
            _a[accessKey] = instance,
            _a));
        return instance;
    };
    return QiniuSDK;
}());
var SDK = new QiniuSDK();
exports.default = SDK;

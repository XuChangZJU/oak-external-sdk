"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QiniuCloudInstance = void 0;
const QiniuCloud_1 = require("./service/qiniu/QiniuCloud");
Object.defineProperty(exports, "QiniuCloudInstance", { enumerable: true, get: function () { return QiniuCloud_1.QiniuCloudInstance; } });
class QiniuSDK {
    qiniuMap;
    constructor() {
        this.qiniuMap = {};
    }
    getInstance(accessKey, accessSecret) {
        if (this.qiniuMap[accessKey]) {
            return this.qiniuMap[accessKey];
        }
        const instance = new QiniuCloud_1.QiniuCloudInstance(accessKey, accessSecret);
        Object.assign(this.qiniuMap, {
            [accessKey]: instance,
        });
        return instance;
    }
}
const SDK = new QiniuSDK();
exports.default = SDK;

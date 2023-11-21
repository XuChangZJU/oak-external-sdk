"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CTYunInstance = void 0;
const CTYun_1 = require("./service/ctyun/CTYun");
Object.defineProperty(exports, "CTYunInstance", { enumerable: true, get: function () { return CTYun_1.CTYunInstance; } });
class CTYunSDK {
    ctyunMap;
    constructor() {
        this.ctyunMap = {};
    }
    getInstance(accessKey, accessSecret) {
        if (this.ctyunMap[accessKey]) {
            return this.ctyunMap[accessKey];
        }
        const instance = new CTYun_1.CTYunInstance(accessKey, accessSecret);
        Object.assign(this.ctyunMap, {
            [accessKey]: instance,
        });
        return instance;
    }
}
const SDK = new CTYunSDK();
exports.default = SDK;

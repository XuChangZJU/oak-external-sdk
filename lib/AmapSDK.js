"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Amap_1 = require("./service/amap/Amap");
class AmapSDK {
    webKeyMap;
    constructor() {
        this.webKeyMap = {};
    }
    getInstance(key) {
        if (this.webKeyMap[key]) {
            return this.webKeyMap[key];
        }
        const instance = new Amap_1.AmapInstance(key);
        Object.assign(this.webKeyMap, {
            [key]: instance,
        });
        return instance;
    }
}
const SDK = new AmapSDK();
exports.default = SDK;

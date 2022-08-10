"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Amap_1 = require("./service/amap/Amap");
var AmapSDK = /** @class */ (function () {
    function AmapSDK() {
        this.webKeyMap = {};
    }
    AmapSDK.prototype.getInstance = function (key) {
        var _a;
        if (this.webKeyMap[key]) {
            return this.webKeyMap[key];
        }
        var instance = new Amap_1.AmapInstance(key);
        Object.assign(this.webKeyMap, (_a = {},
            _a[key] = instance,
            _a));
        return instance;
    };
    return AmapSDK;
}());
var SDK = new AmapSDK();
exports.default = SDK;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmapInstance = void 0;
var tslib_1 = require("tslib");
require('isomorphic-fetch');
var AmapInstance = /** @class */ (function () {
    function AmapInstance(key) {
        this.key = key;
    }
    AmapInstance.prototype.getDrivingPath = function (data) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var from, to, url, result, jsonData;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        from = data.from, to = data.to;
                        url = "http://restapi.amap.com/v3/direction/driving?origin=".concat(from[0].toFixed(6), ",").concat(from[1].toFixed(6), "&destination=").concat(to[0].toFixed(6), ",").concat(to[1].toFixed(6), "&strategy=10&key=").concat(this.key);
                        return [4 /*yield*/, fetch(url)];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, result.json()];
                    case 2:
                        jsonData = _a.sent();
                        if (jsonData.status !== '1') {
                            throw new Error(JSON.stringify(jsonData));
                        }
                        return [2 /*return*/, Promise.resolve(jsonData)];
                }
            });
        });
    };
    AmapInstance.prototype.regeo = function (data) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var longitude, latitude, result, jsonData;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        longitude = data.longitude, latitude = data.latitude;
                        return [4 /*yield*/, global.fetch("https://restapi.amap.com/v3/geocode/regeo?location=".concat(longitude, ",").concat(latitude, "&key=").concat(this.key))];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, result.json()];
                    case 2:
                        jsonData = _a.sent();
                        if (jsonData.status !== '1') {
                            throw new Error(JSON.stringify(jsonData));
                        }
                        return [2 /*return*/, Promise.resolve(jsonData)];
                }
            });
        });
    };
    AmapInstance.prototype.ipLoc = function (data) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var ip, url, result, jsonData;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ip = data.ip;
                        url = "https://restapi.amap.com/v3/ip?key=".concat(this.key, "&ip=").concat(ip);
                        return [4 /*yield*/, global.fetch(url)];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, result.json()];
                    case 2:
                        jsonData = _a.sent();
                        if (jsonData.status !== '1') {
                            throw new Error(JSON.stringify(jsonData));
                        }
                        return [2 /*return*/, Promise.resolve(jsonData)];
                }
            });
        });
    };
    AmapInstance.prototype.getDistrict = function (data) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var keywords, subdistrict, url, result, jsonData;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        keywords = data.keywords, subdistrict = data.subdistrict;
                        url = "https://restapi.amap.com/v3/config/district?keywords=".concat(keywords, "&subdistrict=").concat(subdistrict, "&key=").concat(this.key);
                        return [4 /*yield*/, global.fetch(url)];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, result.json()];
                    case 2:
                        jsonData = _a.sent();
                        if (jsonData.status !== '1') {
                            throw new Error(JSON.stringify(jsonData));
                        }
                        return [2 /*return*/, Promise.resolve(jsonData)];
                }
            });
        });
    };
    AmapInstance.prototype.geocode = function (data) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var address, url, result, jsonData;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        address = data.address;
                        url = "https://restapi.amap.com/v3/geocode/geo?address=".concat(address, "&key=").concat(this.key);
                        return [4 /*yield*/, global.fetch(url)];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, result.json()];
                    case 2:
                        jsonData = _a.sent();
                        if (jsonData.status !== '1') {
                            throw new Error(JSON.stringify(jsonData));
                        }
                        return [2 /*return*/, Promise.resolve(jsonData)];
                }
            });
        });
    };
    return AmapInstance;
}());
exports.AmapInstance = AmapInstance;

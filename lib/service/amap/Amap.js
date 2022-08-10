"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmapInstance = void 0;
var AmapInstance = /** @class */ (function () {
    function AmapInstance(key) {
        this.key = key;
    }
    AmapInstance.prototype.getDrivingPath = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var from, to, url, result, jsonData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        from = data.from, to = data.to;
                        url = "http://restapi.amap.com/v3/direction/driving?origin=".concat(from[0].toFixed(6), ",").concat(from[1].toFixed(6), "&destination=").concat(to[0].toFixed(6), ",").concat(to[1].toFixed(6), "&strategy=10&key=").concat(this.key);
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
    AmapInstance.prototype.regeo = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var longitude, latitude, result, jsonData;
            return __generator(this, function (_a) {
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
        return __awaiter(this, void 0, void 0, function () {
            var ip, url, result, jsonData;
            return __generator(this, function (_a) {
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
        return __awaiter(this, void 0, void 0, function () {
            var keywords, subdistrict, url, result, jsonData;
            return __generator(this, function (_a) {
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
        return __awaiter(this, void 0, void 0, function () {
            var address, url, result, jsonData;
            return __generator(this, function (_a) {
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

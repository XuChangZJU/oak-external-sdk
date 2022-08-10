"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WechatWebInstance = exports.WechatPublicInstance = exports.WechatMpInstance = exports.AmapSDK = exports.WechatSDK = void 0;
var WechatSDK_1 = __importStar(require("./WechatSDK"));
exports.WechatSDK = WechatSDK_1.default;
Object.defineProperty(exports, "WechatMpInstance", { enumerable: true, get: function () { return WechatSDK_1.WechatMpInstance; } });
Object.defineProperty(exports, "WechatPublicInstance", { enumerable: true, get: function () { return WechatSDK_1.WechatPublicInstance; } });
Object.defineProperty(exports, "WechatWebInstance", { enumerable: true, get: function () { return WechatSDK_1.WechatWebInstance; } });
var AmapSDK_1 = __importDefault(require("./AmapSDK"));
exports.AmapSDK = AmapSDK_1.default;
__exportStar(require("./service/amap/Amap"), exports);

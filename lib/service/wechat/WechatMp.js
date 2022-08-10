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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WechatMpInstance = void 0;
var crypto_1 = __importDefault(require("crypto"));
var buffer_1 = require("buffer");
var WechatMpInstance = /** @class */ (function () {
    function WechatMpInstance(appId, appSecret) {
        this.appId = appId;
        this.appSecret = appSecret;
        this.refreshAccessToken();
    }
    WechatMpInstance.prototype.access = function (url, init) {
        return __awaiter(this, void 0, void 0, function () {
            var response, headers, status, contentType, json, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, global.fetch(url, init)];
                    case 1:
                        response = _a.sent();
                        headers = response.headers, status = response.status;
                        if (![200, 201].includes(status)) {
                            throw new Error("\u5FAE\u4FE1\u670D\u52A1\u5668\u8FD4\u56DE\u4E0D\u6B63\u786E\u5E94\u7B54\uFF1A".concat(status));
                        }
                        contentType = headers['Content-Type'] || headers.get('Content-Type');
                        if (!contentType.includes('application/json')) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json()];
                    case 2:
                        json = _a.sent();
                        if (typeof json.errcode === 'number' && json.errcode !== 0) {
                            throw new Error("\u8C03\u7528\u5FAE\u4FE1\u63A5\u53E3\u8FD4\u56DE\u51FA\u9519\uFF0Ccode\u662F".concat(json.errcode, "\uFF0C\u4FE1\u606F\u662F").concat(json.errmsg));
                        }
                        return [2 /*return*/, json];
                    case 3:
                        if (!(contentType.includes('text')
                            || contentType.includes('xml')
                            || contentType.includes('html'))) return [3 /*break*/, 5];
                        return [4 /*yield*/, response.text()];
                    case 4:
                        data = _a.sent();
                        return [2 /*return*/, data];
                    case 5:
                        if (!contentType.includes('application/octet-stream')) return [3 /*break*/, 7];
                        return [4 /*yield*/, response.arrayBuffer()];
                    case 6: return [2 /*return*/, _a.sent()];
                    case 7: return [2 /*return*/, response];
                }
            });
        });
    };
    WechatMpInstance.prototype.code2Session = function (code) {
        return __awaiter(this, void 0, void 0, function () {
            var result, _a, session_key, openid, unionid;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.access("https://api.weixin.qq.com/sns/jscode2session?appid=".concat(this.appId, "&secret=").concat(this.appSecret, "&js_code=").concat(code, "&grant_type=authorization_code"))];
                    case 1:
                        result = _b.sent();
                        _a = JSON.parse(result), session_key = _a.session_key, openid = _a.openid, unionid = _a.unionid;
                        return [2 /*return*/, {
                                sessionKey: session_key,
                                openId: openid,
                                unionId: unionid,
                            }];
                }
            });
        });
    };
    WechatMpInstance.prototype.refreshAccessToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, access_token, expires_in;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.access("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=".concat(this.appId, "&secret=").concat(this.appSecret))];
                    case 1:
                        result = _a.sent();
                        access_token = result.access_token, expires_in = result.expires_in;
                        this.accessToken = access_token;
                        // 生成下次刷新的定时器
                        this.refreshAccessTokenHandler = setTimeout(function () {
                            _this.refreshAccessToken();
                        }, (expires_in - 10) * 1000);
                        return [2 /*return*/];
                }
            });
        });
    };
    WechatMpInstance.prototype.decryptData = function (sessionKey, encryptedData, iv, signature) {
        var skBuf = buffer_1.Buffer.from(sessionKey, 'base64');
        // const edBuf = Buffer.from(encryptedData, 'base64');
        var ivBuf = buffer_1.Buffer.from(iv, 'base64');
        var decipher = crypto_1.default.createDecipheriv('aes-128-cbc', skBuf, ivBuf);
        // 设置自动 padding 为 true，删除填充补位
        decipher.setAutoPadding(true);
        var decoded = decipher.update(encryptedData, 'base64', 'utf8');
        decoded += decipher.final('utf8');
        var data = JSON.parse(decoded);
        if (data.watermark.appid !== this.appId) {
            throw new Error('Illegal Buffer');
        }
        return data;
    };
    WechatMpInstance.prototype.getMpUnlimitWxaCode = function (_a) {
        var scene = _a.scene, page = _a.page, envVersion = _a.envVersion, width = _a.width, autoColor = _a.autoColor, lineColor = _a.lineColor, isHyaline = _a.isHyaline;
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.access("https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=".concat(this.accessToken), {
                            method: 'POST',
                            headers: {
                                'Content-type': "application/json",
                                'Accept': 'image/jpg',
                            },
                            body: JSON.stringify({
                                // access_token: this.accessToken,
                                scene: scene,
                                page: page,
                                env_version: envVersion,
                                width: width,
                                auto_color: autoColor,
                                line_color: lineColor,
                                is_hyaline: isHyaline,
                            })
                        })];
                    case 1:
                        result = _b.sent();
                        return [4 /*yield*/, result.arrayBuffer()];
                    case 2: return [2 /*return*/, (_b.sent())];
                }
            });
        });
    };
    return WechatMpInstance;
}());
exports.WechatMpInstance = WechatMpInstance;
;

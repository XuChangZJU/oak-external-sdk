"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WechatMpInstance = void 0;
var tslib_1 = require("tslib");
require('../../fetch');
var crypto_1 = tslib_1.__importDefault(require("crypto"));
var buffer_1 = require("buffer");
var WechatMpInstance = /** @class */ (function () {
    function WechatMpInstance(appId, appSecret, accessToken, externalRefreshFn) {
        this.appId = appId;
        this.appSecret = appSecret;
        this.externalRefreshFn = externalRefreshFn;
        if (!appSecret && !externalRefreshFn) {
            throw new Error('appSecret和externalRefreshFn必须至少支持一个');
        }
        if (accessToken) {
            this.accessToken = accessToken;
        }
        else {
            this.refreshAccessToken();
        }
    }
    WechatMpInstance.prototype.getAccessToken = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!true) return [3 /*break*/, 2];
                        if (this.accessToken) {
                            return [2 /*return*/, this.accessToken];
                        }
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(function () { return resolve(0); }, 500); })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 0];
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    WechatMpInstance.prototype.access = function (url, init, fresh) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var response, headers, status, contentType, json, data;
            return tslib_1.__generator(this, function (_a) {
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
                            if ([42001, 40001].includes(json.errcode)) {
                                if (fresh) {
                                    throw new Error('刚刷新的token不可能马上过期，请检查是否有并发刷新token的逻辑');
                                }
                                console.log(JSON.stringify(json));
                                return [2 /*return*/, this.refreshAccessToken(url, init)];
                            }
                            throw new Error("\u8C03\u7528\u5FAE\u4FE1\u63A5\u53E3\u8FD4\u56DE\u51FA\u9519\uFF0Ccode\u662F".concat(json.errcode, "\uFF0C\u4FE1\u606F\u662F").concat(json.errmsg));
                        }
                        return [2 /*return*/, json];
                    case 3:
                        if (!(contentType.includes('text') ||
                            contentType.includes('xml') ||
                            contentType.includes('html'))) return [3 /*break*/, 5];
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
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var result, _a, session_key, openid, unionid;
            return tslib_1.__generator(this, function (_b) {
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
    WechatMpInstance.prototype.refreshAccessToken = function (url, init) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var result, _a, access_token, expires_in;
            var _this = this;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.externalRefreshFn) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.externalRefreshFn(this.appId)];
                    case 1:
                        _a = _b.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.access("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=".concat(this.appId, "&secret=").concat(this.appSecret))];
                    case 3:
                        _a = _b.sent();
                        _b.label = 4;
                    case 4:
                        result = _a;
                        access_token = result.access_token, expires_in = result.expires_in;
                        this.accessToken = access_token;
                        if (process.env.NODE_ENV === 'development') {
                            console.log("\u5C0F\u7A0B\u5E8F\u83B7\u5F97\u65B0\u7684accessToken\u3002appId:[".concat(this.appId, "], token: [").concat(access_token, "]"));
                        }
                        // 生成下次刷新的定时器
                        this.refreshAccessTokenHandler = setTimeout(function () {
                            _this.refreshAccessToken();
                        }, (expires_in - 10) * 1000);
                        if (url) {
                            return [2 /*return*/, this.access(url, init, true)];
                        }
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
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var token, result;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getAccessToken()];
                    case 1:
                        token = _b.sent();
                        return [4 /*yield*/, this.access("https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=".concat(token), {
                                method: 'POST',
                                headers: {
                                    'Content-type': 'application/json',
                                    Accept: 'image/jpg',
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
                                }),
                            })];
                    case 2:
                        result = _b.sent();
                        return [4 /*yield*/, result.arrayBuffer()];
                    case 3: return [2 /*return*/, (_b.sent())];
                }
            });
        });
    };
    WechatMpInstance.prototype.getUserPhoneNumber = function (code) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var token, result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAccessToken()];
                    case 1:
                        token = _a.sent();
                        return [4 /*yield*/, this.access("https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=".concat(token), {
                                method: 'POST',
                                headers: {
                                    'Content-type': 'application/json',
                                },
                                body: JSON.stringify({
                                    code: code,
                                }),
                            })];
                    case 2:
                        result = (_a.sent());
                        return [2 /*return*/, result.phone_info];
                }
            });
        });
    };
    /**
     * 发送订阅消息
     * @param param0
     * @returns
     * https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/mp-message-management/subscribe-message/sendMessage.html
     */
    WechatMpInstance.prototype.sendSubscribedMessage = function (_a) {
        var templateId = _a.templateId, page = _a.page, openId = _a.openId, data = _a.data, state = _a.state, lang = _a.lang;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var token;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getAccessToken()];
                    case 1:
                        token = _b.sent();
                        /**
                         * 实测，若用户未订阅，会抛出errcode: 43101, errmsg: user refuse to accept the msg
                         */
                        return [2 /*return*/, this.access("https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=".concat(token), {
                                body: JSON.stringify({
                                    template_id: templateId,
                                    page: page,
                                    touser: openId,
                                    data: data,
                                    miniprogram_state: state || 'formal',
                                    lang: lang || 'zh_CN',
                                }),
                                method: 'post',
                            })];
                }
            });
        });
    };
    return WechatMpInstance;
}());
exports.WechatMpInstance = WechatMpInstance;

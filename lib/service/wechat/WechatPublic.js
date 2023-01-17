"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WechatPublicInstance = void 0;
var tslib_1 = require("tslib");
require('isomorphic-fetch');
var crypto_1 = tslib_1.__importDefault(require("crypto"));
var buffer_1 = require("buffer");
var WechatPublicInstance = /** @class */ (function () {
    function WechatPublicInstance(appId, appSecret) {
        this.appId = appId;
        this.appSecret = appSecret;
        this.refreshAccessToken();
    }
    WechatPublicInstance.prototype.access = function (url, mockData, init) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var response, headers, status, contentType, json, data;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (process.env.NODE_ENV === 'development') {
                            return [2 /*return*/, mockData];
                        }
                        return [4 /*yield*/, fetch(url, init)];
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
    WechatPublicInstance.prototype.code2Session = function (code) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var result, _a, session_key, openid, unionid;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.access("https://api.weixin.qq.com/sns/oauth2/access_token?appid=".concat(this.appId, "&secret=").concat(this.appSecret, "&code=").concat(code, "&grant_type=authorization_code"), { session_key: 'aaa', openid: code, unionid: code })];
                    case 1:
                        result = _b.sent();
                        _a = typeof result === 'string' ? JSON.parse(result) : result, session_key = _a.session_key, openid = _a.openid, unionid = _a.unionid;
                        return [2 /*return*/, {
                                sessionKey: session_key,
                                openId: openid,
                                unionId: unionid,
                            }];
                }
            });
        });
    };
    WechatPublicInstance.prototype.refreshAccessToken = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var result, access_token, expires_in;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.access("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=".concat(this.appId, "&secret=").concat(this.appSecret), { access_token: 'mockToken', expires_in: 3600 * 1000 })];
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
    WechatPublicInstance.prototype.decryptData = function (sessionKey, encryptedData, iv, signature) {
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
    WechatPublicInstance.prototype.getQrCode = function (options) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var sceneId, sceneStr, expireSeconds, isPermanent, scene, actionName, myInit, result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sceneId = options.sceneId, sceneStr = options.sceneStr, expireSeconds = options.expireSeconds, isPermanent = options.isPermanent;
                        if (!sceneId && !sceneStr) {
                            throw new Error('Missing sceneId or sceneStr');
                        }
                        scene = sceneId
                            ? {
                                scene_id: sceneId,
                            }
                            : {
                                scene_str: sceneStr,
                            };
                        actionName = sceneId ? 'QR_SCENE' : 'QR_STR_SCENE';
                        myInit = {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                expire_seconds: expireSeconds,
                                action_name: actionName,
                                action_info: {
                                    scene: scene,
                                },
                            }),
                        };
                        if (isPermanent) {
                            actionName = sceneId ? 'QR_LIMIT_SCENE' : 'QR_LIMIT_STR_SCENE';
                            myInit = {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    action_name: actionName,
                                    action_info: {
                                        scene: scene,
                                    },
                                }),
                            };
                        }
                        return [4 /*yield*/, this.access("https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=".concat(this.accessToken), {
                                ticket: "ticket".concat(Date.now()),
                                url: "http://mock/q/".concat(sceneId ? sceneId : sceneStr),
                                expireSeconds: expireSeconds,
                            }, myInit)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                ticket: result.ticket,
                                url: result.url,
                                expireSeconds: result.expire_seconds,
                            }];
                }
            });
        });
    };
    WechatPublicInstance.prototype.sendTemplateMessage = function (options) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var openId, templateId, url, data, miniProgram, clientMsgId, myInit, result, errcode;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        openId = options.openId, templateId = options.templateId, url = options.url, data = options.data, miniProgram = options.miniProgram, clientMsgId = options.clientMsgId;
                        myInit = {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                touser: openId,
                                template_id: templateId,
                                url: url,
                                miniProgram: miniProgram,
                                client_msg_id: clientMsgId,
                                data: data,
                            }),
                        };
                        return [4 /*yield*/, this.access("https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=".concat(this.accessToken), {
                                errcode: 0,
                                errmsg: 'ok',
                                msgid: Date.now(),
                            }, myInit)];
                    case 1:
                        result = _a.sent();
                        errcode = result.errcode;
                        if (errcode === 0) {
                            return [2 /*return*/, Object.assign({ success: true }, result)];
                        }
                        return [2 /*return*/, Object.assign({ success: false }, result)];
                }
            });
        });
    };
    WechatPublicInstance.prototype.batchGetArticle = function (options) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var offset, count, noContent, myInit, result, errcode;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        offset = options.offset, count = options.count, noContent = options.noContent;
                        myInit = {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                offset: offset,
                                count: count,
                                no_content: noContent,
                            }),
                        };
                        return [4 /*yield*/, this.access("https://api.weixin.qq.com/cgi-bin/freepublish/batchget?access_token=".concat(this.accessToken), {
                                total_count: 1,
                                item_count: 1,
                                item: [
                                    {
                                        article_id: 'test',
                                        content: {
                                            news_item: [
                                                {
                                                    title: '测试文章',
                                                    author: '测试作者',
                                                    digest: '测试摘要',
                                                    content: '测试内容',
                                                    content_source_url: '',
                                                    thumb_media_id: 'TEST_MEDIA_ID',
                                                    show_cover_pic: 1,
                                                    need_open_comment: 0,
                                                    only_fans_can_comment: 0,
                                                    url: 'TEST_ARTICLE_URL',
                                                    is_deleted: false,
                                                },
                                            ],
                                        },
                                        update_time: Date.now(),
                                    },
                                ],
                            }, myInit)];
                    case 1:
                        result = _a.sent();
                        errcode = result.errcode;
                        if (!errcode) {
                            return [2 /*return*/, result];
                        }
                        throw new Error(JSON.stringify(result));
                }
            });
        });
    };
    return WechatPublicInstance;
}());
exports.WechatPublicInstance = WechatPublicInstance;

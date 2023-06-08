"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WechatPublicInstance = exports.WechatWebInstance = exports.WechatMpInstance = void 0;
var tslib_1 = require("tslib");
var WechatMp_1 = require("./service/wechat/WechatMp");
Object.defineProperty(exports, "WechatMpInstance", { enumerable: true, get: function () { return WechatMp_1.WechatMpInstance; } });
var WechatPublic_1 = require("./service/wechat/WechatPublic");
Object.defineProperty(exports, "WechatPublicInstance", { enumerable: true, get: function () { return WechatPublic_1.WechatPublicInstance; } });
var WechatWeb_1 = require("./service/wechat/WechatWeb");
Object.defineProperty(exports, "WechatWebInstance", { enumerable: true, get: function () { return WechatWeb_1.WechatWebInstance; } });
var cheerio_1 = require("cheerio");
var WechatSDK = /** @class */ (function () {
    function WechatSDK() {
        this.mpMap = {};
        this.publicMap = {};
        this.webMap = {};
    }
    WechatSDK.prototype.getInstance = function (appId, type, appSecret, accessToken, externalRefreshFn) {
        var _a, _b, _c;
        // type 支持web网站扫码登录
        if (type === 'wechatMp') {
            if (this.mpMap[appId]) {
                return this.mpMap[appId];
            }
            var instance = new WechatMp_1.WechatMpInstance(appId, appSecret, accessToken, externalRefreshFn);
            Object.assign(this.mpMap, (_a = {},
                _a[appId] = instance,
                _a));
            return instance;
        }
        else if (type === 'wechatPublic') {
            if (this.publicMap[appId]) {
                return this.publicMap[appId];
            }
            var instance = new WechatPublic_1.WechatPublicInstance(appId, appSecret, accessToken, externalRefreshFn);
            Object.assign(this.publicMap, (_b = {},
                _b[appId] = instance,
                _b));
            return instance;
        }
        else if (type === 'web') {
            if (this.webMap[appId]) {
                return this.webMap[appId];
            }
            var instance = new WechatWeb_1.WechatWebInstance(appId, appSecret, accessToken, externalRefreshFn);
            Object.assign(this.webMap, (_c = {},
                _c[appId] = instance,
                _c));
            return instance;
        }
        else {
            throw new Error("".concat(type, " not implemented"));
        }
    };
    /**
     * 解析微信公众号文章内容
     * @param url 微信公众号链接
     * @returns html
     */
    WechatSDK.prototype.analyzePublicArticle = function (url) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var response, html, $, title, ems, imgsElement, imageList, i, src, publishDate, lines, i, timeStr;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, fetch(url)];
                    case 1:
                        response = _b.sent();
                        return [4 /*yield*/, response.text()];
                    case 2:
                        html = _b.sent();
                        $ = (0, cheerio_1.load)(html);
                        title = $('#activity-name') ? (_a = $('#activity-name').text()) === null || _a === void 0 ? void 0 : _a.trim().replace(/\n/g, '') : '';
                        ems = $('em');
                        imgsElement = $('img');
                        imageList = [];
                        for (i = 0; i < imgsElement.length; i++) {
                            src = imgsElement[i].attribs['data-src'];
                            if (src && (src.includes('http') || src.includes('https'))) {
                                imageList.push(src);
                            }
                        }
                        lines = html.split('\n');
                        for (i = 0; i < lines.length; i++) {
                            if (lines[i].includes('var ct =')) {
                                timeStr = lines[i].split('"')[1] + '000';
                                publishDate = Number(timeStr);
                                break;
                            }
                        }
                        return [2 /*return*/, {
                                title: title,
                                publishDate: publishDate,
                                imageList: imageList,
                            }];
                }
            });
        });
    };
    return WechatSDK;
}());
var SDK = new WechatSDK();
exports.default = SDK;

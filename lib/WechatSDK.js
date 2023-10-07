"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WechatPublicInstance = exports.WechatWebInstance = exports.WechatMpInstance = void 0;
const WechatMp_1 = require("./service/wechat/WechatMp");
Object.defineProperty(exports, "WechatMpInstance", { enumerable: true, get: function () { return WechatMp_1.WechatMpInstance; } });
const WechatPublic_1 = require("./service/wechat/WechatPublic");
Object.defineProperty(exports, "WechatPublicInstance", { enumerable: true, get: function () { return WechatPublic_1.WechatPublicInstance; } });
const WechatWeb_1 = require("./service/wechat/WechatWeb");
Object.defineProperty(exports, "WechatWebInstance", { enumerable: true, get: function () { return WechatWeb_1.WechatWebInstance; } });
const cheerio_1 = require("./utils/cheerio");
const assert_1 = require("oak-domain/lib/utils/assert");
const Exception_1 = require("oak-domain/lib/types/Exception");
class WechatSDK {
    mpMap;
    publicMap;
    webMap;
    constructor() {
        this.mpMap = {};
        this.publicMap = {};
        this.webMap = {};
    }
    getInstance(appId, type, appSecret, accessToken, externalRefreshFn) {
        // type 支持web网站扫码登录
        if (type === 'wechatMp') {
            if (this.mpMap[appId]) {
                return this.mpMap[appId];
            }
            const instance = new WechatMp_1.WechatMpInstance(appId, appSecret, accessToken, externalRefreshFn);
            Object.assign(this.mpMap, {
                [appId]: instance,
            });
            return instance;
        }
        else if (type === 'wechatPublic') {
            if (this.publicMap[appId]) {
                return this.publicMap[appId];
            }
            const instance = new WechatPublic_1.WechatPublicInstance(appId, appSecret, accessToken, externalRefreshFn);
            Object.assign(this.publicMap, {
                [appId]: instance,
            });
            return instance;
        }
        else if (type === 'web') {
            if (this.webMap[appId]) {
                return this.webMap[appId];
            }
            const instance = new WechatWeb_1.WechatWebInstance(appId, appSecret, accessToken, externalRefreshFn);
            Object.assign(this.webMap, {
                [appId]: instance,
            });
            return instance;
        }
        else {
            (0, assert_1.assert)(false, `${type} not implemented`);
        }
    }
    /**
     * 解析微信公众号文章内容
     * @param url 微信公众号链接
     * @returns html
     */
    async analyzePublicArticle(url) {
        let response;
        try {
            response = await fetch(url);
        }
        catch (err) {
            throw new Exception_1.OakNetworkException(`访问analyzePublicArticle接口失败，「${url}」`);
        }
        const html = await response.text();
        const $ = (0, cheerio_1.load)(html);
        const title = $('#activity-name')
            ? $('#activity-name').text()?.trim().replace(/\n/g, '')
            : '';
        const imgsElement = $('img');
        const imageList = [];
        for (let i = 0; i < imgsElement.length; i++) {
            // 把 img 元素中的 src 内容提取出来，加入到数组中
            const src = imgsElement[i].attribs['data-src'];
            if (src && (src.includes('http') || src.includes('https'))) {
                imageList.push(src);
            }
        }
        let publishDate;
        const lines = html.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('var ct =')) {
                const timeStr = lines[i].split('"')[1] + '000';
                publishDate = Number(timeStr);
                break;
            }
        }
        return {
            title,
            publishDate,
            imageList,
        };
    }
}
const SDK = new WechatSDK();
exports.default = SDK;

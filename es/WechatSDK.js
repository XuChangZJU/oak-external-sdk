import { WechatMpInstance } from './service/wechat/WechatMp';
import { WechatPublicInstance } from './service/wechat/WechatPublic';
import { WechatWebInstance } from './service/wechat/WechatWeb';
import { load } from './utils/cheerio';
import { assert } from 'oak-domain/lib/utils/assert';
import { OakNetworkException, } from 'oak-domain/lib/types/Exception';
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
            const instance = new WechatMpInstance(appId, appSecret, accessToken, externalRefreshFn);
            Object.assign(this.mpMap, {
                [appId]: instance,
            });
            return instance;
        }
        else if (type === 'wechatPublic') {
            if (this.publicMap[appId]) {
                return this.publicMap[appId];
            }
            const instance = new WechatPublicInstance(appId, appSecret, accessToken, externalRefreshFn);
            Object.assign(this.publicMap, {
                [appId]: instance,
            });
            return instance;
        }
        else if (type === 'web') {
            if (this.webMap[appId]) {
                return this.webMap[appId];
            }
            const instance = new WechatWebInstance(appId, appSecret, accessToken, externalRefreshFn);
            Object.assign(this.webMap, {
                [appId]: instance,
            });
            return instance;
        }
        else {
            assert(false, `${type} not implemented`);
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
            throw new OakNetworkException(`访问analyzePublicArticle接口失败，「${url}」`);
        }
        const html = await response.text();
        const $ = load(html);
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
export default SDK;
export { WechatMpInstance, WechatWebInstance, WechatPublicInstance };

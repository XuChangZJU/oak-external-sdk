import { WechatMpInstance } from './service/wechat/WechatMp';
import { WechatPublicInstance } from './service/wechat/WechatPublic';
import { WechatWebInstance } from './service/wechat/WechatWeb';
import { load } from './utils/cheerio';

class WechatSDK {
    mpMap: Record<string, WechatMpInstance>;
    publicMap: Record<string, WechatPublicInstance>;
    webMap: Record<string, WechatWebInstance>;

    constructor() {
        this.mpMap = {};
        this.publicMap = {};
        this.webMap = {};
    }

    getInstance(
        appId: string,
        type: 'wechatMp' | 'wechatPublic' | 'web',
        appSecret?: string,
        accessToken?: string,
        externalRefreshFn?: (appId: string) => Promise<string>
    ) {
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
        } else if (type === 'wechatPublic') {
            if (this.publicMap[appId]) {
                return this.publicMap[appId];
            }
            const instance = new WechatPublicInstance(appId, appSecret, accessToken, externalRefreshFn);
            Object.assign(this.publicMap, {
                [appId]: instance,
            });
            return instance;
        } else if (type === 'web') {
            if (this.webMap[appId]) {
                return this.webMap[appId];
            }
            const instance = new WechatWebInstance(appId, appSecret, accessToken, externalRefreshFn);
            Object.assign(this.webMap, {
                [appId]: instance,
            });
            return instance;
        } else {
            throw new Error(`${type} not implemented`);
        }
    }

    /**
     * 解析微信公众号文章内容
     * @param url 微信公众号链接
     * @returns html
     */
    async analyzePublicArticle(url: string): Promise<{
        title: string;
        publishDate: number | undefined;
        imageList: string[];
    }> {
        const response = await fetch(url);
        const html = await response.text();
        const $ = load(html);
        const title = $('#activity-name') ? $('#activity-name').text()?.trim().replace(/\n/g, '') : '';
        const ems = $('em');
        const imgsElement = $('img');
        const imageList: string[] = [];
        for (let i = 0; i < imgsElement.length; i++) {
            // 把 img 元素中的 src 内容提取出来，加入到数组中
            const src = imgsElement[i].attribs['data-src'];
            if (src && (src.includes('http') || src.includes('https'))) {
                imageList.push(src);
            }
        }
        let publishDate;
        // $('em').toArray().forEach((element, index) => {
        //     if (index === 0) {
        //         publishDate = $(element).text();
        //     }
        // });
        const lines = html.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('var ct =')) {
                const timeStr = lines[i].split('"')[1] + '000'
                publishDate = Number(timeStr);
                break;
            }
        }
        return {
            title,
            publishDate,
            imageList,
        }        
    }
}

const SDK = new WechatSDK();
export default SDK;

export { WechatMpInstance, WechatWebInstance, WechatPublicInstance };


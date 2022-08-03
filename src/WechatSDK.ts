import { WechatMpInstance } from './service/wechat/WechatMp';
import { WechatPublicInstance } from './service/wechat/WechatPublic';

class WechatSDK {
    mpMap: Record<string, WechatMpInstance>;
    publicMap: Record<string, any>;
    webMap: Record<string, any>;

    constructor() {
        this.mpMap = {};
        this.publicMap = {};
        this.webMap = {};
    }

    getInstance(
        appId: string,
        appSecret: string,
        type: 'wechatMp' | 'wechatPublic' | 'web'
    ) {
        // type 支持web网站扫码登录
        if (type === 'wechatMp') {
            if (this.mpMap[appId]) {
                return this.mpMap[appId];
            }
            const instance = new WechatMpInstance(appId, appSecret);
            Object.assign(this.mpMap, {
                [appId]: instance,
            });
            return instance;
        } else if (type === 'wechatPublic') {
            if (this.publicMap[appId]) {
                return this.publicMap[appId];
            }
            const instance = new WechatPublicInstance(appId, appSecret);
            Object.assign(this.publicMap, {
                [appId]: instance,
            });
            return instance;
        } else {
            throw new Error('public not implemented');
        }
    }
}

const SDK = new WechatSDK();
export default SDK;

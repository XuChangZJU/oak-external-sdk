import { WechatMpInstance } from './service/wechat/WechatMp';
import { WechatPublicInstance } from './service/wechat/WechatPublic';
import { WechatWebInstance } from './service/wechat/WechatWeb';

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
}

const SDK = new WechatSDK();
export default SDK;

export { WechatMpInstance, WechatWebInstance, WechatPublicInstance };


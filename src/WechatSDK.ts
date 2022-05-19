import { WechatMpInstance } from './WechatMp';

class WechatSDK {
    mpMap: Record<string, WechatMpInstance>;
    publicMap: Record<string, any>;

    constructor() {
        this.mpMap = {};
        this.publicMap = {};
    }

    getInstance(
        appId: string,
        appSecret: string,
        type: 'wechatMp' | 'wechatPublic'
    ) {
        if (type === 'wechatMp') {
            if (this.mpMap[appId]) {
                return this.mpMap[appId];
            }
            const instance = new WechatMpInstance(appId, appSecret);
            Object.assign(this.mpMap, {
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

import { WechatMpInstance } from './service/wechat/WechatMp';
declare class WechatSDK {
    mpMap: Record<string, WechatMpInstance>;
    publicMap: Record<string, any>;
    constructor();
    getInstance(appId: string, appSecret: string, type: 'wechatMp' | 'wechatPublic'): WechatMpInstance;
}
declare const SDK: WechatSDK;
export default SDK;

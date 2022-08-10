import { WechatMpInstance } from './service/wechat/WechatMp';
import { WechatPublicInstance } from './service/wechat/WechatPublic';
import { WechatWebInstance } from './service/wechat/WechatWeb';
declare class WechatSDK {
    mpMap: Record<string, WechatMpInstance>;
    publicMap: Record<string, WechatPublicInstance>;
    webMap: Record<string, WechatWebInstance>;
    constructor();
    getInstance(appId: string, appSecret: string, type: 'wechatMp' | 'wechatPublic' | 'web'): WechatMpInstance | WechatPublicInstance | WechatWebInstance;
}
declare const SDK: WechatSDK;
export default SDK;
export { WechatMpInstance, WechatWebInstance, WechatPublicInstance };

import { WechatMpInstance } from './service/wechat/WechatMp';
import { WechatPublicInstance } from './service/wechat/WechatPublic';
import { WechatWebInstance } from './service/wechat/WechatWeb';
declare class WechatSDK {
    mpMap: Record<string, WechatMpInstance>;
    publicMap: Record<string, WechatPublicInstance>;
    webMap: Record<string, WechatWebInstance>;
    constructor();
    getInstance(appId: string, type: 'wechatMp' | 'wechatPublic' | 'web', appSecret?: string, accessToken?: string, externalRefreshFn?: (appId: string) => Promise<string>): WechatMpInstance | WechatPublicInstance | WechatWebInstance;
}
declare const SDK: WechatSDK;
export default SDK;
export { WechatMpInstance, WechatWebInstance, WechatPublicInstance };

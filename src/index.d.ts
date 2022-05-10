import { WechatMpInstance } from "./WechatMp";
declare class WechatInstanceContainer {
    mpMap: Record<string, WechatMpInstance>;
    publicMap: Record<string, any>;
    constructor();
    getInstance(appId: string, appSecret: string, type: 'wechatMp' | 'wechatPublic'): WechatMpInstance;
}
declare const Container: WechatInstanceContainer;
export default Container;

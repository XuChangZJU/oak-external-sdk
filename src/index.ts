import WechatSDK, { WechatMpInstance, WechatPublicInstance, WechatWebInstance } from './WechatSDK';
import AmapSDK from './AmapSDK';
import QiniuSDK, { QiniuCloudInstance } from './QiniuSDK';
import SmsSdk, { TencentSmsInstance, AliSmsInstance } from './SmsSdk';

export * from './service/amap/Amap';
export {
    AmapSDK,
    QiniuSDK,
    WechatSDK,
    WechatMpInstance,
    WechatPublicInstance,
    WechatWebInstance,
    QiniuCloudInstance,
    SmsSdk,
    TencentSmsInstance,
    AliSmsInstance,
};
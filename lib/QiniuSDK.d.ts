import { QiniuCloudInstance } from './service/qiniu/QiniuCloud';
declare class QiniuSDK {
    qiniuMap: Record<string, QiniuCloudInstance>;
    constructor();
    getInstance(accessKey: string, accessSecret: string): QiniuCloudInstance;
}
declare const SDK: QiniuSDK;
export default SDK;
export { QiniuCloudInstance };

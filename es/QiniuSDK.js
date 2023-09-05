import { QiniuCloudInstance } from './service/qiniu/QiniuCloud';
class QiniuSDK {
    qiniuMap;
    constructor() {
        this.qiniuMap = {};
    }
    getInstance(accessKey, accessSecret) {
        if (this.qiniuMap[accessKey]) {
            return this.qiniuMap[accessKey];
        }
        const instance = new QiniuCloudInstance(accessKey, accessSecret);
        Object.assign(this.qiniuMap, {
            [accessKey]: instance,
        });
        return instance;
    }
}
const SDK = new QiniuSDK();
export default SDK;
export { QiniuCloudInstance };

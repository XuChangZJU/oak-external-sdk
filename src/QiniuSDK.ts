import { QiniuCloudInstance } from './service/qiniu/QiniuCloud';
import { QiniuZone } from './types/Qiniu';

class QiniuSDK {
    qiniuMap: Record<string, QiniuCloudInstance>;

    constructor() {
        this.qiniuMap = {};
    }

    getInstance(
        accessKey: string,
        accessSecret: string,
    ) {
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


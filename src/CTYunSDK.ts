import { CTYunInstance } from './service/ctyun/CTYun';

class CTYunSDK {
    ctyunMap: Record<string, CTYunInstance>;

    constructor() {
        this.ctyunMap = {};
    }

    getInstance(
        accessKey: string,
        accessSecret: string,
    ) {
        if (this.ctyunMap[accessKey]) {
            return this.ctyunMap[accessKey];
        }
        const instance = new CTYunInstance(accessKey, accessSecret);
        Object.assign(this.ctyunMap, {
            [accessKey]: instance,
        });
        return instance;
    }
}

const SDK = new CTYunSDK();
export default SDK;

export { CTYunInstance };


import { CTYunInstance } from './service/ctyun/CTYun';
class CTYunSDK {
    ctyunMap;
    constructor() {
        this.ctyunMap = {};
    }
    getInstance(accessKey, accessSecret) {
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

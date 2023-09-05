import { AmapInstance } from './service/amap/Amap';
class AmapSDK {
    webKeyMap;
    constructor() {
        this.webKeyMap = {};
    }
    getInstance(key) {
        if (this.webKeyMap[key]) {
            return this.webKeyMap[key];
        }
        const instance = new AmapInstance(key);
        Object.assign(this.webKeyMap, {
            [key]: instance,
        });
        return instance;
    }
}
const SDK = new AmapSDK();
export default SDK;

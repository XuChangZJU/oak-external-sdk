import { AmapInstance } from './service/amap/Amap';

class AmapSDK {
    webKeyMap: Record<string, AmapInstance>;

    constructor() {
        this.webKeyMap = {};
    }

    getInstance(key: string) {
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

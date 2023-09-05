import { AmapInstance } from './service/amap/Amap';
declare class AmapSDK {
    webKeyMap: Record<string, AmapInstance>;
    constructor();
    getInstance(key: string): AmapInstance;
}
declare const SDK: AmapSDK;
export default SDK;

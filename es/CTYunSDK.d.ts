import { CTYunInstance } from './service/ctyun/CTYun';
declare class CTYunSDK {
    ctyunMap: Record<string, CTYunInstance>;
    constructor();
    getInstance(accessKey: string, accessSecret: string): CTYunInstance;
}
declare const SDK: CTYunSDK;
export default SDK;
export { CTYunInstance };

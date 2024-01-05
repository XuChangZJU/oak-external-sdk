"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CTYunSmsInstance = void 0;
class CTYunSmsInstance {
    accessKey;
    securityKey;
    endpoint;
    constructor(accessKey, securityKey, endpoint) {
        this.accessKey = accessKey;
        this.securityKey = securityKey;
        this.endpoint = endpoint;
    }
    async sendSms(params) {
        console.log('react-native走不到这里[ali/sms.native');
        return {};
    }
}
exports.CTYunSmsInstance = CTYunSmsInstance;

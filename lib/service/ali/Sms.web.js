"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AliSmsInstance = void 0;
class AliSmsInstance {
    accessKeyId;
    accessKeySecret;
    region;
    endpoint;
    client;
    constructor(accessKeyId, accessKeySecret, region, endpoint) {
        this.accessKeyId = accessKeyId;
        this.accessKeySecret = accessKeySecret;
        this.region = region;
        this.endpoint = endpoint;
    }
    async sendSms(params) {
        console.log('web走不到这里');
        return {};
    }
}
exports.AliSmsInstance = AliSmsInstance;

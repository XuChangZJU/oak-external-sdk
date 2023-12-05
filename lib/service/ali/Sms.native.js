"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AliSmsInstance = void 0;
class AliSmsInstance {
    secretId;
    secretKey;
    region;
    endpoint;
    client;
    constructor(secretId, secretKey, region, endpoint) {
        this.secretId = secretId;
        this.secretKey = secretKey;
        this.region = region;
        this.endpoint = endpoint;
        const clientConfig = {
            credential: {
                secretId: this.secretId,
                secretKey: this.secretKey,
            },
            region: this.region,
            profile: {
                httpProfile: {
                    endpoint: this.endpoint || 'dysmsapi.aliyuncs.com',
                },
            },
        };
    }
    async sendSms(params) {
        console.log('native走不到这里');
        return {};
    }
}
exports.AliSmsInstance = AliSmsInstance;

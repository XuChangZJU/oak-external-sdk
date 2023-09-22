"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WechatWebInstance = void 0;
const tslib_1 = require("tslib");
require('../../fetch');
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const buffer_1 = require("buffer");
class WechatWebInstance {
    appId;
    appSecret;
    accessToken;
    refreshAccessTokenHandler;
    externalRefreshFn;
    constructor(appId, appSecret, accessToken, externalRefreshFn) {
        this.appId = appId;
        this.appSecret = appSecret;
        this.externalRefreshFn = externalRefreshFn;
        if (!appSecret && !externalRefreshFn) {
            throw new Error('appSecret和externalRefreshFn必须至少支持一个');
        }
        if (accessToken) {
            this.accessToken = accessToken;
        }
        else {
            this.refreshAccessToken();
        }
    }
    async getAccessToken() {
        while (true) {
            if (this.accessToken) {
                return this.accessToken;
            }
            await new Promise((resolve) => setTimeout(() => resolve(0), 500));
        }
    }
    async access(url, mockData, init) {
        if (process.env.NODE_ENV === 'development') {
            return mockData;
        }
        const response = await global.fetch(url, init);
        const { headers, status } = response;
        if (![200, 201].includes(status)) {
            throw new Error(`微信服务器返回不正确应答：${status}`);
        }
        const contentType = headers['Content-Type'] || headers.get('Content-Type');
        if (contentType.includes('application/json')) {
            const json = await response.json();
            if (typeof json.errcode === 'number' && json.errcode !== 0) {
                if ([40001, 42001].includes(json.errcode)) {
                    return this.refreshAccessToken();
                }
                throw new Error(`调用微信接口返回出错，code是${json.errcode}，信息是${json.errmsg}`);
            }
            return json;
        }
        if (contentType.includes('text') ||
            contentType.includes('xml') ||
            contentType.includes('html')) {
            const data = await response.text();
            return data;
        }
        if (contentType.includes('application/octet-stream')) {
            return await response.arrayBuffer();
        }
        return response;
    }
    async code2Session(code) {
        const result = await this.access(`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${this.appId}&secret=${this.appSecret}&code=${code}&grant_type=authorization_code`, { session_key: 'aaa', openid: code, unionid: code });
        const { session_key, openid, unionid } = typeof result === 'string' ? JSON.parse(result) : result; // 这里微信返回的数据有时候竟然是text/plain
        return {
            sessionKey: session_key,
            openId: openid,
            unionId: unionid,
        };
    }
    async refreshAccessToken(url, init) {
        const result = this.externalRefreshFn ? await this.externalRefreshFn(this.appId) : await this.access(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appId}&secret=${this.appSecret}`, { access_token: 'mockToken', expires_in: 600 });
        const { access_token, expires_in } = result;
        this.accessToken = access_token;
        // 生成下次刷新的定时器
        this.refreshAccessTokenHandler = setTimeout(() => {
            this.refreshAccessToken();
        }, (expires_in - 10) * 1000);
        if (url) {
            return this.access(url, init);
        }
    }
    decryptData(sessionKey, encryptedData, iv, signature) {
        const skBuf = buffer_1.Buffer.from(sessionKey, 'base64');
        // const edBuf = Buffer.from(encryptedData, 'base64');
        const ivBuf = buffer_1.Buffer.from(iv, 'base64');
        const decipher = crypto_1.default.createDecipheriv('aes-128-cbc', skBuf, ivBuf);
        // 设置自动 padding 为 true，删除填充补位
        decipher.setAutoPadding(true);
        let decoded = decipher.update(encryptedData, 'base64', 'utf8');
        decoded += decipher.final('utf8');
        const data = JSON.parse(decoded);
        if (data.watermark.appid !== this.appId) {
            throw new Error('Illegal Buffer');
        }
        return data;
    }
}
exports.WechatWebInstance = WechatWebInstance;

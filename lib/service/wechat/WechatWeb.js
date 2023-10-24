"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WechatWebInstance = void 0;
const tslib_1 = require("tslib");
require('../../utils/fetch');
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const buffer_1 = require("buffer");
const url_1 = tslib_1.__importDefault(require("url"));
const Exception_1 = require("oak-domain/lib/types/Exception");
const assert_1 = require("oak-domain/lib/utils/assert");
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
            (0, assert_1.assert)(false, 'appSecret和externalRefreshFn必须至少支持一个');
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
    async access(url, init, mockData) {
        if (process.env.NODE_ENV === 'development' && mockData) {
            return mockData;
        }
        let response;
        try {
            response = await global.fetch(url, init);
        }
        catch (err) {
            throw new Exception_1.OakNetworkException(`访问wechat接口失败，「${url}」`);
        }
        const { headers, status } = response;
        if (![200, 201].includes(status)) {
            throw new Exception_1.OakServerProxyException(`访问wechat接口失败，「${url}」,「${status}」`);
        }
        const contentType = headers['Content-Type'] || headers.get('Content-Type');
        if (contentType?.includes('application/json')) {
            const json = await response.json();
            if (typeof json.errcode === 'number' && json.errcode !== 0) {
                if ([40001, 42001].includes(json.errcode)) {
                    return this.refreshAccessToken(url, init);
                }
                throw new Exception_1.OakExternalException('wechat', json.errcode, json.errmsg);
            }
            return json;
        }
        if (contentType?.includes('text') ||
            contentType?.includes('xml') ||
            contentType?.includes('html')) {
            const data = await response.text();
            // 某些接口返回contentType为text/plain, 里面text是json结构
            const isJson = this.isJson(data);
            if (isJson) {
                const json = JSON.parse(data);
                if (typeof json.errcode === 'number' && json.errcode !== 0) {
                    if ([40001, 42001].includes(json.errcode)) {
                        return this.refreshAccessToken(url, init);
                    }
                    throw new Exception_1.OakExternalException('wechat', json.errcode, json.errmsg);
                }
                return json;
            }
            return data;
        }
        if (contentType?.includes('application/octet-stream')) {
            return await response.arrayBuffer();
        }
        return response;
    }
    async code2Session(code) {
        const result = await this.access(`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${this.appId}&secret=${this.appSecret}&code=${code}&grant_type=authorization_code`, undefined, { session_key: 'aaa', openid: code, unionid: code });
        const { session_key, openid, unionid } = typeof result === 'string' ? JSON.parse(result) : result; // 这里微信返回的数据有时候竟然是text/plain
        return {
            sessionKey: session_key,
            openId: openid,
            unionId: unionid,
        };
    }
    async refreshAccessToken(url, init) {
        const result = this.externalRefreshFn
            ? await this.externalRefreshFn(this.appId)
            : await this.access(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appId}&secret=${this.appSecret}`, undefined, { access_token: 'mockToken', expires_in: 600 });
        const { access_token, expires_in } = result;
        this.accessToken = access_token;
        // 生成下次刷新的定时器
        this.refreshAccessTokenHandler = setTimeout(() => {
            this.refreshAccessToken();
        }, (expires_in - 10) * 1000);
        if (url) {
            const url2 = new url_1.default.URL(url);
            url2.searchParams.set('access_token', access_token);
            return this.access(url2.toString(), init);
        }
    }
    isJson(data) {
        try {
            JSON.parse(data);
            return true;
        }
        catch (e) {
            return false;
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
        (0, assert_1.assert)(data.watermark.appid === this.appId);
        return data;
    }
}
exports.WechatWebInstance = WechatWebInstance;

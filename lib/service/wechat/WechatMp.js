"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WechatMpInstance = void 0;
const tslib_1 = require("tslib");
require('../../fetch');
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const buffer_1 = require("buffer");
const Exception_1 = require("oak-domain/lib/types/Exception");
const assert_1 = require("oak-domain/lib/utils/assert");
class WechatMpInstance {
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
    async access(url, init, fresh) {
        let response;
        try {
            response = await global.fetch(url, init);
        }
        catch (err) {
            throw new Exception_1.OakNetworkException(`访问wechatMp接口失败，「${url}」`);
        }
        const { headers, status } = response;
        if (![200, 201].includes(status)) {
            throw new Exception_1.OakServerProxyException(`访问wechatMp接口失败，「${url}」,「${status}」`);
        }
        const contentType = headers['Content-Type'] || headers.get('Content-Type');
        if (contentType.includes('application/json')) {
            const json = await response.json();
            if (typeof json.errcode === 'number' && json.errcode !== 0) {
                if ([42001, 40001].includes(json.errcode)) {
                    if (fresh) {
                        throw new Exception_1.OakServerProxyException('刚刷新的token不可能马上过期，请检查是否有并发刷新token的逻辑');
                    }
                    return this.refreshAccessToken(url, init);
                }
                throw new Exception_1.OakExternalException('wechatMp', json.errcode, json.errmsg);
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
        const result = await this.access(`https://api.weixin.qq.com/sns/jscode2session?appid=${this.appId}&secret=${this.appSecret}&js_code=${code}&grant_type=authorization_code`);
        const { session_key, openid, unionid } = typeof result === 'string' ? JSON.parse(result) : result; // 这里微信返回的数据竟然是text/plain
        return {
            sessionKey: session_key,
            openId: openid,
            unionId: unionid,
        };
    }
    async refreshAccessToken(url, init) {
        const result = this.externalRefreshFn
            ? await this.externalRefreshFn(this.appId)
            : await this.access(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appId}&secret=${this.appSecret}`);
        const { access_token, expires_in } = result;
        this.accessToken = access_token;
        if (process.env.NODE_ENV === 'development') {
            console.log(`小程序获得新的accessToken。appId:[${this.appId}], token: [${access_token}]`);
        }
        // 生成下次刷新的定时器
        this.refreshAccessTokenHandler = setTimeout(() => {
            this.refreshAccessToken();
        }, (expires_in - 10) * 1000);
        if (url) {
            return this.access(url, init, true);
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
    async getMpUnlimitWxaCode({ scene, page, envVersion = 'release', width, autoColor, lineColor, isHyaline, }) {
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${token}`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                Accept: 'image/jpg',
            },
            body: JSON.stringify({
                // access_token: this.accessToken,
                scene,
                page,
                env_version: envVersion,
                width,
                auto_color: autoColor,
                line_color: lineColor,
                is_hyaline: isHyaline,
            }),
        });
        return (await result.arrayBuffer());
    }
    async getUserPhoneNumber(code) {
        const token = await this.getAccessToken();
        const result = (await this.access(`https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${token}`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify({
                code,
            }),
        }));
        return result.phone_info;
    }
    /**
     * 发送订阅消息
     * @param param0
     * @returns
     * https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/mp-message-management/subscribe-message/sendMessage.html
     */
    async sendSubscribedMessage({ templateId, page, openId, data, state, lang, }) {
        const token = await this.getAccessToken();
        /**
         * 实测，若用户未订阅，会抛出errcode: 43101, errmsg: user refuse to accept the msg
         */
        return this.access(`https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${token}`, {
            body: JSON.stringify({
                template_id: templateId,
                page,
                touser: openId,
                data,
                miniprogram_state: state || 'formal',
                lang: lang || 'zh_CN',
            }),
            method: 'post',
        });
    }
}
exports.WechatMpInstance = WechatMpInstance;

require('../../utils/fetch');
import crypto from 'crypto';
import { Buffer } from 'buffer';
import URL from 'url';
import FormData from '../../utils/form-data';
import { OakExternalException, OakNetworkException, OakServerProxyException, } from 'oak-domain/lib/types/Exception';
import { assert } from 'oak-domain/lib/utils/assert';
export class WechatMpInstance {
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
            assert(false, 'appSecret和externalRefreshFn必须至少支持一个');
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
            throw new OakNetworkException(`访问wechatMp接口失败，「${url}」`);
        }
        const { headers, status } = response;
        if (![200, 201].includes(status)) {
            throw new OakServerProxyException(`访问wechatMp接口失败，「${url}」,「${status}」`);
        }
        const contentType = headers['Content-Type'] || headers.get('Content-Type');
        if (contentType?.includes('application/json')) {
            const json = await response.json();
            if (typeof json.errcode === 'number' && json.errcode !== 0) {
                if ([42001, 40001].includes(json.errcode)) {
                    if (fresh) {
                        throw new OakServerProxyException('刚刷新的token不可能马上过期，请检查是否有并发刷新token的逻辑');
                    }
                    return this.refreshAccessToken(url, init);
                }
                throw new OakExternalException('wechatMp', json.errcode, json.errmsg);
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
                        if (fresh) {
                            throw new OakServerProxyException('刚刷新的token不可能马上过期，请检查是否有并发刷新token的逻辑');
                        }
                        return this.refreshAccessToken(url, init);
                    }
                    throw new OakExternalException('wechatMp', json.errcode, json.errmsg);
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
            const url2 = new URL.URL(url);
            url2.searchParams.set('access_token', access_token);
            return this.access(url2.toString(), init);
        }
    }
    decryptData(sessionKey, encryptedData, iv, signature) {
        const skBuf = Buffer.from(sessionKey, 'base64');
        // const edBuf = Buffer.from(encryptedData, 'base64');
        const ivBuf = Buffer.from(iv, 'base64');
        const decipher = crypto.createDecipheriv('aes-128-cbc', skBuf, ivBuf);
        // 设置自动 padding 为 true，删除填充补位
        decipher.setAutoPadding(true);
        let decoded = decipher.update(encryptedData, 'base64', 'utf8');
        decoded += decipher.final('utf8');
        const data = JSON.parse(decoded);
        assert(data.watermark.appid === this.appId);
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
    //创建临时素材
    async createTemporaryMaterial(options) {
        const { type, media, filetype, filename } = options;
        const formData = new FormData();
        formData.append('media', media, {
            contentType: filetype,
            filename: filename, // 微信识别需要
        });
        const getLength = () => {
            return new Promise((resolve, reject) => {
                formData.getLength((err, length) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(length);
                    }
                });
            });
        };
        const contentLength = await getLength();
        const headers = formData.getHeaders();
        headers['Content-Length'] = contentLength;
        const myInit = {
            method: 'POST',
            headers,
        };
        Object.assign(myInit, {
            body: formData,
        });
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/media/upload?access_token=${token}&type=${type}`, myInit);
        return result;
    }
    // 获取临时素材
    async getTemporaryMaterial(options) {
        const { mediaId } = options;
        const myInit = {
            method: 'GET',
        };
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/media/get?access_token=${token}&media_id=${mediaId}`, myInit);
        if (this.isJson(result)) {
            return result;
        }
        const arrayBuffer = await result.arrayBuffer();
        return arrayBuffer;
    }
    async sendServeMessage(options) {
        const { openId, type } = options;
        const myInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        };
        switch (type) {
            case 'text': {
                Object.assign(myInit, {
                    body: JSON.stringify({
                        touser: openId,
                        msgtype: 'text',
                        text: {
                            content: options.content,
                        },
                    }),
                });
                break;
            }
            case 'image': {
                Object.assign(myInit, {
                    body: JSON.stringify({
                        touser: openId,
                        msgtype: 'image',
                        image: {
                            media_id: options.mediaId,
                        },
                    }),
                });
                break;
            }
            case 'news': {
                Object.assign(myInit, {
                    body: JSON.stringify({
                        touser: openId,
                        msgtype: 'link',
                        link: {
                            title: options.title,
                            description: options.description,
                            url: options.url,
                            thumb_url: options.picurl,
                        },
                    }),
                });
                break;
            }
            case 'mp': {
                Object.assign(myInit, {
                    body: JSON.stringify({
                        touser: openId,
                        msgtype: 'miniprogrampage',
                        miniprogrampage: {
                            title: options.data.title,
                            pagepath: options.data.pagepath,
                            thumb_media_id: options.data.thumbnailId,
                        },
                    }),
                });
                break;
            }
            default: {
                assert(false, '当前消息类型暂不支持');
            }
        }
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${token}`, myInit);
        const { errcode } = result;
        if (errcode === 0) {
            return Object.assign({ success: true }, result);
        }
        return Object.assign({ success: false }, result);
    }
    async getAllPrivateTemplate() {
        const myInit = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const token = await this.getAccessToken();
        const result = (await this.access(`https://api.weixin.qq.com/wxaapi/newtmpl/gettemplate?access_token=${token}`, myInit));
        return result.data;
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
    async getURLScheme(options) {
        const { jump_wxa, expiresAt, expireType = 0, expireInterval } = options;
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/wxa/generatescheme?access_token=${token}`, {
            method: 'POST',
            body: JSON.stringify({
                jump_wxa: jump_wxa,
                is_expire: true,
                expire_type: expireType,
                expire_time: expiresAt,
                expire_interval: expireInterval,
            }),
        });
        return result;
    }
}

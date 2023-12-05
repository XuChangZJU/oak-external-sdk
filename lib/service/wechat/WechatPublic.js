"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WechatPublicInstance = void 0;
const tslib_1 = require("tslib");
require('../../utils/fetch');
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const buffer_1 = require("buffer");
const url_1 = tslib_1.__importDefault(require("url"));
const form_data_1 = tslib_1.__importDefault(require("../../utils/form-data"));
const Exception_1 = require("oak-domain/lib/types/Exception");
const assert_1 = require("oak-domain/lib/utils/assert");
class WechatPublicInstance {
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
            throw new Exception_1.OakNetworkException(`访问wechatPublic接口失败，「${url}」`);
        }
        const { headers, status } = response;
        if (![200, 201].includes(status)) {
            throw new Exception_1.OakServerProxyException(`访问wechatPublic接口失败，「${url}」,「${status}」`);
        }
        const contentType = headers['Content-Type'] || headers.get('Content-Type');
        // 微信 get_material api contentType是没有的
        if (contentType?.includes('application/json')) {
            const json = await response.json();
            if (typeof json.errcode === 'number' && json.errcode !== 0) {
                if ([40001, 42001].includes(json.errcode)) {
                    return this.refreshAccessToken(url, init);
                }
                throw new Exception_1.OakExternalException('wechatPublic', json.errcode, json.errmsg);
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
                    throw new Exception_1.OakExternalException('wechatPublic', json.errcode, json.errmsg);
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
        const result = await this.access(`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${this.appId}&secret=${this.appSecret}&code=${code}&grant_type=authorization_code`);
        const { access_token, openid, unionid, scope, refresh_token, is_snapshotuser, expires_in, } = typeof result === 'string' ? JSON.parse(result) : result; // 这里微信返回的数据有时候竟然是text/plain
        return {
            accessToken: access_token,
            openId: openid,
            unionId: unionid,
            scope: scope,
            refreshToken: refresh_token,
            isSnapshotUser: !!is_snapshotuser,
            atExpiredAt: Date.now() + expires_in * 1000,
            rtExpiredAt: Date.now() + 30 * 86400 * 1000,
        };
    }
    async refreshUserAccessToken(refreshToken) {
        const result = await this.access(`https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=${this.appId}&grant_type=refresh_token&refresh_token=${refreshToken}`);
        const { access_token, refresh_token, expires_in, scope } = result;
        return {
            accessToken: access_token,
            refreshToken: refresh_token,
            atExpiredAt: Date.now() + expires_in * 1000,
            scope: scope,
        };
    }
    async getUserInfo(accessToken, openId) {
        const result = await this.access(`https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${openId}&lang=zh_CN`);
        const { nickname, sex, headimgurl } = result;
        return {
            nickname: nickname,
            gender: sex === 1 ? 'male' : sex === 2 ? 'female' : undefined,
            avatar: headimgurl,
        };
    }
    async createTag(params) {
        const myInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tag: params }),
        };
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/tags/create?access_token=${token}`, myInit);
        const { tag } = result;
        if (tag) {
            return Object.assign({ success: true }, result);
        }
        return Object.assign({ success: false }, result);
    }
    async getTags() {
        const myInit = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/tags/get?access_token=${token}`, myInit);
        return result;
    }
    async editTag(tag) {
        const myInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tag }),
        };
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/tags/update?access_token=${token}`, myInit);
        return result;
    }
    async deleteTag(tag) {
        const myInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tag }),
        };
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/tags/delete?access_token=${token}`, myInit);
        return result;
    }
    async getTagUsers(tagid) {
        const myInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tagid, next_openid: '' }),
        };
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/user/tag/get?access_token=${token}`, myInit);
        return result;
    }
    async batchtagging(openid_list, tagid) {
        const myInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ openid_list, tagid }),
        };
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/tags/members/batchtagging?access_token=${token}`, myInit);
        return result;
    }
    async batchuntagging(openid_list, tagid) {
        const myInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ openid_list, tagid }),
        };
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/tags/members/batchuntagging?access_token=${token}`, myInit);
        return result;
    }
    async getUsers(nextOpenId) {
        const myInit = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/user/get?access_token=${token}${nextOpenId ? `&next_openid=${nextOpenId}` : ''}`, myInit);
        return result;
    }
    async getUserTags(openid) {
        const myInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ openid }),
        };
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/tags/getidlist?access_token=${token}`, myInit);
        return result;
    }
    async getSubscribedUserInfo(openid) {
        const myInit = {
            methods: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/user/info?access_token=${token}&openid=${openid}&lang=zh_CN`, myInit);
        return result;
    }
    async getCurrentMenu() {
        const myInit = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/get_current_selfmenu_info?access_token=${token}`, myInit);
        return result;
    }
    async getMenu() {
        const myInit = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/menu/get?access_token=${token}`, myInit);
        return result;
    }
    async createMenu(menuConfig) {
        const myInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(menuConfig),
        };
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${token}`, myInit);
        return result;
    }
    async createConditionalMenu(menuConfig) {
        const myInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(menuConfig),
        };
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/menu/addconditional?access_token=${token}`, myInit);
        return result;
    }
    async deleteConditionalMenu(menuId) {
        const myInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                menuid: menuId,
            }),
        };
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/menu/delconditional?access_token=${token}`, myInit);
        return result;
    }
    async deleteMenu() {
        const myInit = {
            method: 'GET',
        };
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/menu/delete?access_token=${token}`, myInit);
        return result;
    }
    async refreshAccessToken(url, init) {
        const result = this.externalRefreshFn
            ? await this.externalRefreshFn(this.appId)
            : await this.access(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appId}&secret=${this.appSecret}`);
        const { access_token, expires_in } = result;
        this.accessToken = access_token;
        // 生成下次刷新的定时器
        console.log((expires_in - 10) * 1000);
        this.refreshAccessTokenHandler = setTimeout(() => {
            this.refreshAccessToken();
        }, (expires_in - 10) * 1000);
        if (url) {
            const url2 = new url_1.default.URL(url);
            url2.searchParams.set('access_token', access_token);
            return this.access(url2.toString(), init);
        }
    }
    async getQrCode(options) {
        const { sceneId, sceneStr, expireSeconds, isPermanent } = options;
        if (!sceneId && !sceneStr) {
            (0, assert_1.assert)(false, 'Missing sceneId or sceneStr');
        }
        const scene = sceneId
            ? {
                scene_id: sceneId,
            }
            : {
                scene_str: sceneStr,
            };
        let actionName = sceneId ? 'QR_SCENE' : 'QR_STR_SCENE';
        let myInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                expire_seconds: expireSeconds,
                action_name: actionName,
                action_info: {
                    scene,
                },
            }),
        };
        if (isPermanent) {
            actionName = sceneId ? 'QR_LIMIT_SCENE' : 'QR_LIMIT_STR_SCENE';
            myInit = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action_name: actionName,
                    action_info: {
                        scene,
                    },
                }),
            };
        }
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=${token}`, myInit);
        return {
            ticket: result.ticket,
            url: result.url,
            expireSeconds: result.expire_seconds,
        };
    }
    async sendTemplateMessage(options) {
        const { openId, templateId, url, data, miniProgram, clientMsgId } = options;
        const myInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                touser: openId,
                template_id: templateId,
                url,
                miniProgram,
                client_msg_id: clientMsgId,
                data,
            }),
        };
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${token}`, myInit);
        const { errcode } = result;
        if (errcode === 0) {
            return Object.assign({ success: true }, result);
        }
        return Object.assign({ success: false }, result);
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
                        msgtype: 'news',
                        news: {
                            articles: [
                                {
                                    title: options.title,
                                    description: options.description,
                                    url: options.url,
                                    picurl: options.picurl,
                                },
                            ],
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
                            appid: options.data.appId,
                            pagepath: options.data.pagepath,
                            thumb_media_id: options.data.thumbnailId,
                        },
                    }),
                });
                break;
            }
            default: {
                (0, assert_1.assert)(false, '当前消息类型暂不支持');
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
    async batchGetArticle(options) {
        const { offset, count, noContent } = options;
        const myInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                offset,
                count,
                no_content: noContent,
            }),
        };
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/freepublish/batchget?access_token=${token}`, myInit);
        return result;
    }
    async getArticle(options) {
        const { articleId } = options;
        const myInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                article_id: articleId,
            }),
        };
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/freepublish/getarticle?access_token=${token}`, myInit);
        return result;
    }
    // 创建永久素材
    async createMaterial(options) {
        const { type, media, description, filetype, filename, fileLength } = options;
        const formData = new form_data_1.default();
        formData.append('media', media, {
            contentType: filetype,
            filename: filename,
            knownLength: fileLength,
        });
        if (type === 'video') {
            formData.append('description', JSON.stringify(description));
        }
        const headers = formData.getHeaders();
        const myInit = {
            method: 'POST',
            headers,
        };
        Object.assign(myInit, {
            body: formData,
        });
        const token = await this.getAccessToken();
        const result = (await this.access(`https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=${token}&type=${type}`, myInit));
        return result;
    }
    //创建图文消息内的图片获取URL
    async createImgInNewsMaterial(options) {
        const { media, filetype, filename, fileLength } = options;
        const formData = new form_data_1.default();
        formData.append('media', media, {
            contentType: filetype,
            filename: filename,
            knownLength: fileLength,
        });
        const headers = formData.getHeaders();
        const myInit = {
            method: 'POST',
            headers,
        };
        Object.assign(myInit, {
            body: formData,
        });
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token=${token}`, myInit);
        return result;
    }
    //创建临时素材
    async createTemporaryMaterial(options) {
        const { type, media, filetype, filename, fileLength } = options;
        const formData = new form_data_1.default();
        formData.append('media', media, {
            contentType: filetype,
            filename: filename,
            knownLength: fileLength,
        });
        const headers = formData.getHeaders();
        const myInit = {
            method: 'POST',
            headers,
        };
        Object.assign(myInit, {
            body: formData,
        });
        const token = await this.getAccessToken();
        const result = (await this.access(`https://api.weixin.qq.com/cgi-bin/media/upload?access_token=${token}&type=${type}`, myInit));
        return result;
    }
    // 获取素材列表
    async batchGetMaterialList(options) {
        const { offset, count, type } = options;
        const myInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type,
                offset,
                count,
            }),
        };
        const token = await this.getAccessToken();
        const result = (await this.access(`https://api.weixin.qq.com/cgi-bin/material/batchget_material?access_token=${token}`, myInit));
        return result;
    }
    // 获取永久素材
    async getMaterial(options) {
        const { mediaId } = options;
        const myInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                media_id: mediaId,
            }),
        };
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/material/get_material?access_token=${token}`, myInit);
        if (this.isJson(result)) {
            return result;
        }
        const arrayBuffer = await result.arrayBuffer();
        return arrayBuffer;
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
    // 获取素材总数
    async getMaterialCount() {
        const myInit = {
            methods: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const token = await this.getAccessToken();
        const result = (await this.access(`https://api.weixin.qq.com/cgi-bin/material/get_materialcount?access_token=${token}`, myInit));
        return result;
    }
    // 删除永久素材
    async deleteMaterial(options) {
        const { mediaId } = options;
        const myInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                media_id: mediaId,
            }),
        };
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/material/del_material?access_token=${token}`, myInit);
        return result;
    }
    async getTicket() {
        const myInit = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const token = await this.getAccessToken();
        const result = (await this.access(`https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${token}&type=jsapi`, myInit));
        const { ticket } = result;
        return ticket;
    }
    async getAllPrivateTemplate() {
        const myInit = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const token = await this.getAccessToken();
        const result = (await this.access(`https://api.weixin.qq.com/cgi-bin/template/get_all_private_template?access_token=${token}`, myInit));
        return result.template_list;
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
    randomString() {
        let len = 16;
        let $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
        /** **默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
        let maxPos = $chars.length;
        let pwd = '';
        for (let i = 0; i < len; i++) {
            pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    }
    async signatureJsSDK(options) {
        const url = options.url;
        const noncestr = this.randomString();
        const timestamp = parseInt((Date.now() / 1000).toString(), 10);
        const jsapi_ticket = await this.getTicket();
        const contentArray = {
            noncestr,
            jsapi_ticket,
            timestamp,
            url,
        };
        let zhimaString = '';
        Object.keys(contentArray)
            .sort()
            .forEach((ele, idx) => {
            if (idx > 0) {
                zhimaString += '&';
            }
            zhimaString += ele;
            zhimaString += '=';
            zhimaString += contentArray[ele];
        });
        return {
            signature: crypto_1.default
                .createHash('sha1')
                .update(zhimaString)
                .digest('hex'),
            noncestr,
            timestamp,
            appId: this.appId,
        };
    }
}
exports.WechatPublicInstance = WechatPublicInstance;

require('../../fetch');
import crypto from 'crypto';
import { Buffer } from 'buffer';
import URL from 'url';
export class WechatPublicInstance {
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
        if (process.env.NODE_ENV === 'development' && mockData) {
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
                    return this.refreshAccessToken(url, init);
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
    async createTag(tag) {
        const myInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tag }),
        };
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/tags/create?access_token=${token}`, undefined, myInit);
        const { errcode } = result;
        if (errcode === 0) {
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
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/tags/get?access_token=${token}`, undefined, myInit);
        return result;
    }
    async editTag(tag) {
    }
    async getCurrentMenu() {
        const myInit = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/get_current_selfmenu_info?access_token=${token}`, undefined, myInit);
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
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/menu/get?access_token=${token}`, undefined, myInit);
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
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${token}`, undefined, myInit);
        const { errcode } = result;
        if (errcode === 0) {
            return Object.assign({ success: true }, result);
        }
        return Object.assign({ success: false }, result);
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
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/menu/addconditional?access_token=${token}`, undefined, myInit);
        const { errcode } = result;
        if (errcode === 0) {
            return Object.assign({ success: true }, result);
        }
        return Object.assign({ success: false }, result);
    }
    async deleteConditionalMenu(menuid) {
        const myInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                menuid
            }),
        };
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/menu/delconditional?access_token=${token}`, undefined, myInit);
        const { errcode } = result;
        if (errcode === 0) {
            return Object.assign({ success: true }, result);
        }
        return Object.assign({ success: false }, result);
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
            const url2 = new URL.URL(url);
            url2.searchParams.set('access_token', access_token);
            return this.access(url2.toString(), {}, init);
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
        if (data.watermark.appid !== this.appId) {
            throw new Error('Illegal Buffer');
        }
        return data;
    }
    async getQrCode(options) {
        const { sceneId, sceneStr, expireSeconds, isPermanent } = options;
        if (!sceneId && !sceneStr) {
            throw new Error('Missing sceneId or sceneStr');
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
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=${token}`, 
        // {
        //     ticket: `ticket${Date.now()}`,
        //     url: `http://mock/q/${sceneId ? sceneId : sceneStr}`,
        //     expireSeconds: expireSeconds,
        // },
        myInit);
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
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${token}`, 
        // {
        //     errcode: 0,
        //     errmsg: 'ok',
        //     msgid: Date.now(),
        // },
        myInit);
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
                throw new Error('当前消息类型暂不支持');
            }
        }
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${token}`, 
        // {
        //     errcode: 0,
        //     errmsg: 'ok',
        // },
        myInit);
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
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/freepublish/batchget?access_token=${token}`, undefined, myInit);
        const { errcode } = result;
        if (!errcode) {
            return result;
        }
        throw new Error(JSON.stringify(result));
    }
    async getArticle(options) {
        const { article_id } = options;
        const myInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                article_id,
            }),
        };
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/freepublish/getarticle?access_token=${token}`, undefined, myInit);
        const { errcode } = result;
        if (!errcode) {
            return result;
        }
        throw new Error(JSON.stringify(result));
    }
    // 创建永久素材
    async createMaterial(options) {
        const { type, media, description } = options;
        const myInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const formData = new FormData();
        formData.append('media', media);
        if (type === 'video') {
            const formData2 = new FormData();
            formData2.append('description', JSON.stringify(description));
            Object.assign(myInit, {
                body: JSON.stringify({
                    type,
                    media: formData,
                    description: formData2,
                }),
            });
        }
        else {
            Object.assign(myInit, {
                body: JSON.stringify({
                    type,
                    media: formData,
                }),
            });
        }
        ;
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=${token}`, undefined, myInit);
        const { errcode } = result;
        if (!errcode) {
            return result;
        }
        throw new Error(JSON.stringify(result));
    }
    //创建图文消息内的图片获取URL
    async createImgInNewsMaterial(options) {
        const { media } = options;
        const formData = new FormData();
        formData.append('media', media);
        const myInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        };
        Object.assign(myInit, {
            body: JSON.stringify({
                media: formData,
            }),
        });
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token=${token}`, undefined, myInit);
        const { errcode } = result;
        if (!errcode) {
            return result;
        }
        throw new Error(JSON.stringify(result));
    }
    //创建临时素材
    async createTemporaryMaterial(options) {
        const { type, media } = options;
        const myInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const formData = new FormData();
        formData.append('media', media);
        Object.assign(myInit, {
            body: JSON.stringify({
                type,
                media: formData,
            }),
        });
        const token = await this.getAccessToken();
        const result = await this.access(`https https://api.weixin.qq.com/cgi-bin/media/upload?access_token=${token}`, undefined, myInit);
        const { errcode } = result;
        if (!errcode) {
            return result;
        }
        throw new Error(JSON.stringify(result));
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
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/material/batchget_material?access_token=${token}`, undefined, myInit);
        const { errcode } = result;
        if (!errcode) {
            return result;
        }
        throw new Error(JSON.stringify(result));
    }
    // 获取永久素材
    async getMaterial(options) {
        const { type, media_id } = options;
        const myInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                media_id
            }),
        };
        let imgFile;
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/material/get_material?access_token=${token}`, undefined, myInit);
        if ('errcode' in result) {
            throw new Error(JSON.stringify(result));
        }
        else {
            return result;
        }
    }
    // 获取临时素材
    async getTemporaryMaterial(options) {
        const { media_id } = options;
        const myInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                media_id
            }),
        };
        const token = await this.getAccessToken();
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/media/get?access_token=${token}`, undefined, myInit);
        if ('errcode' in result) {
            throw new Error(JSON.stringify(result));
        }
        else {
            return result;
        }
    }
    async getTicket() {
        const myInit = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const token = await this.getAccessToken();
        const result = (await this.access(`https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${token}&type=jsapi`, 
        // {
        //     ticket: `ticket${Date.now()}`,
        //     expires_in: 30,
        // },
        myInit));
        const { ticket } = result;
        return ticket;
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
            signature: crypto
                .createHash('sha1')
                .update(zhimaString)
                .digest('hex'),
            noncestr,
            timestamp,
            appId: this.appId,
        };
    }
}

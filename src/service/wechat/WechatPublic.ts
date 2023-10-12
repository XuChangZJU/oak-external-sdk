require('../../fetch');
import crypto from 'crypto';
import { Buffer } from 'buffer';
import URL from 'url';
import FormData from 'form-data';
import {
    OakExternalException,
    OakNetworkException,
    OakServerProxyException,
} from 'oak-domain/lib/types/Exception';
import { assert } from 'oak-domain/lib/utils/assert';

// 目前先支持text和news, 其他type文档：https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Service_Center_messages.html
// type ServeMessageType = 'text' | 'news' | 'mpnews' | 'mpnewsarticle' | 'image' | 'voice' | 'video' | 'music' | 'msgmenu';/

type TextServeMessageOption = {
    openId: string;
    type: 'text';
    content: string;
};

type ImageServeMessageOption = {
    openId: string;
    type: 'image';
    mediaId: string;
};

type NewsServeMessageOption = {
    openId: string;
    type: 'news';
    title: string;
    description?: string;
    url: string;
    picurl?: string;
};

type MpServeMessageOption = {
    openId: string;
    type: 'mp';
    data: {
        title: string;
        appId: string;
        pagepath: string;
        thumbnailId: string;
    };
};

type ServeMessageOption = TextServeMessageOption | NewsServeMessageOption | MpServeMessageOption | ImageServeMessageOption;

type MediaType = 'image' | 'voice' | 'video' | 'thumb';

export class WechatPublicInstance {
    appId: string;
    appSecret?: string;

    private accessToken?: string;
    private refreshAccessTokenHandler?: any;
    private externalRefreshFn?: (appId: string) => Promise<string>;

    constructor(
        appId: string,
        appSecret?: string,
        accessToken?: string,
        externalRefreshFn?: (appId: string) => Promise<string>
    ) {
        this.appId = appId;
        this.appSecret = appSecret;

        this.externalRefreshFn = externalRefreshFn;
        if (!appSecret && !externalRefreshFn) {
            assert(false, 'appSecret和externalRefreshFn必须至少支持一个');
        }

        if (accessToken) {
            this.accessToken = accessToken;
        } else {
            this.refreshAccessToken();
        }
    }

    private async getAccessToken() {
        while (true) {
            if (this.accessToken) {
                return this.accessToken;
            }

            await new Promise((resolve) => setTimeout(() => resolve(0), 500));
        }
    }

    private async access(
        url: string,
        init?: RequestInit,
        mockData?: any
    ): Promise<any> {
        if (process.env.NODE_ENV === 'development' && mockData) {
            return mockData;
        }

        let response: Response;
        try {
            response = await global.fetch(url, init);
        } catch (err) {
            throw new OakNetworkException(
                `访问wechatPublic接口失败，「${url}」`
            );
        }

        const { headers, status } = response;
        if (![200, 201].includes(status)) {
            throw new OakServerProxyException(
                `访问wechatPublic接口失败，「${url}」,「${status}」`
            );
        }
        const contentType =
            (headers as any)['Content-Type'] || headers.get('Content-Type')!;
        if (contentType.includes('application/json')) {
            const json = await response.json();
            if (typeof json.errcode === 'number' && json.errcode !== 0) {
                if ([40001, 42001].includes(json.errcode)) {
                    return this.refreshAccessToken(url, init);
                }
                throw new OakExternalException(
                    'wechatPublic',
                    json.errcode,
                    json.errmsg
                );
            }
            return json;
        }
        if (
            contentType.includes('text') ||
            contentType.includes('xml') ||
            contentType.includes('html')
        ) {
            const data = await response.text();
            // 某些接口返回contentType为text/plain, 里面text是json结构
            const isJson = this.isJson(data);
            if (isJson) {
                const json = JSON.parse(data);
                if (typeof json.errcode === 'number' && json.errcode !== 0) {
                    if ([40001, 42001].includes(json.errcode)) {
                        return this.refreshAccessToken(url, init);
                    }
                    throw new OakExternalException(
                        'wechatPublic',
                        json.errcode,
                        json.errmsg
                    );
                }
                return json;
            }

            return data;
        }
        if (contentType.includes('application/octet-stream')) {
            return await response.arrayBuffer();
        }

        return response;
    }

    async code2Session(code: string) {
        const result = await this.access(
            `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${this.appId}&secret=${this.appSecret}&code=${code}&grant_type=authorization_code`
        );
        const {
            access_token,
            openid,
            unionid,
            scope,
            refresh_token,
            is_snapshotuser,
            expires_in,
        } = typeof result === 'string' ? JSON.parse(result) : result; // 这里微信返回的数据有时候竟然是text/plain

        return {
            accessToken: access_token as string,
            openId: openid as string,
            unionId: unionid as string,
            scope: scope as string,
            refreshToken: refresh_token as string,
            isSnapshotUser: !!is_snapshotuser,
            atExpiredAt: Date.now() + expires_in * 1000,
            rtExpiredAt: Date.now() + 30 * 86400 * 1000,
        };
    }

    async refreshUserAccessToken(refreshToken: string) {
        const result = await this.access(
            `https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=${this.appId}&grant_type=refresh_token&refresh_token=${refreshToken}`
        );
        const { access_token, refresh_token, expires_in, scope } = result;
        return {
            accessToken: access_token as string,
            refreshToken: refresh_token as string,
            atExpiredAt: Date.now() + expires_in * 1000,
            scope: scope as string,
        };
    }

    async getUserInfo(accessToken: string, openId: string) {
        const result = await this.access(
            `https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${openId}&lang=zh_CN`
        );
        const { nickname, sex, headimgurl } = result;
        return {
            nickname: nickname as string,
            gender: sex === 1 ? 'male' : sex === 2 ? 'female' : undefined,
            avatar: headimgurl as string,
        };
    }

    async createTag(params: { name: string }) {
        const myInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tag: params }),
        };
        const token = await this.getAccessToken();
        const result = await this.access(
            `https://api.weixin.qq.com/cgi-bin/tags/create?access_token=${token}`,
            myInit
        );
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
        const result = await this.access(
            `https://api.weixin.qq.com/cgi-bin/tags/get?access_token=${token}`,
            myInit
        );
        return result;
    }

    async editTag(tag: { id: number; name: string }) {
        const myInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tag }),
        };
        const token = await this.getAccessToken();
        const result = await this.access(
            `https://api.weixin.qq.com/cgi-bin/tags/update?access_token=${token}`,
            myInit
        );
        return result;
    }

    async deleteTag(tag: { id: number }) {
        const myInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tag }),
        };
        const token = await this.getAccessToken();
        const result = await this.access(
            `https://api.weixin.qq.com/cgi-bin/tags/delete?access_token=${token}`,
            myInit
        );
        return result;
    }

    async getTagUsers(tagid: number) {
        const myInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tagid, next_openid: '' }),
        };
        const token = await this.getAccessToken();
        const result = await this.access(
            `https://api.weixin.qq.com/cgi-bin/user/tag/get?access_token=${token}`,
            myInit
        );
        return result;
    }

    async batchtagging(openid_list: string[], tagid: number) {
        const myInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ openid_list, tagid }),
        };
        const token = await this.getAccessToken();
        const result = await this.access(
            `https://api.weixin.qq.com/cgi-bin/tags/members/batchtagging?access_token=${token}`,
            myInit
        );
        return result;
    }

    async batchuntagging(openid_list: string[], tagid: number) {
        const myInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ openid_list, tagid }),
        };
        const token = await this.getAccessToken();
        const result = await this.access(
            `https://api.weixin.qq.com/cgi-bin/tags/members/batchuntagging?access_token=${token}`,
            myInit
        );
        return result;
    }

    async getUsers(nextOpenId: string) {
        const myInit = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const token = await this.getAccessToken();
        const result = await this.access(
            `https://api.weixin.qq.com/cgi-bin/user/get?access_token=${token}${
                nextOpenId ? `&next_openid=${nextOpenId}` : ''
            }`,
            myInit
        );
        return result;
    }

    async getUserTags(openid: string) {
        const myInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ openid }),
        };
        const token = await this.getAccessToken();
        const result = await this.access(
            `https://api.weixin.qq.com/cgi-bin/tags/getidlist?access_token=${token}`,
            myInit
        );
        return result;
    }

    async getSubscribedUserInfo(openid: string) {
        const myInit = {
            methods: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const token = await this.getAccessToken();
        const result = await this.access(
            `https://api.weixin.qq.com/cgi-bin/user/info?access_token=${token}&openid=${openid}&lang=zh_CN`,
            myInit
        );
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
        const result = await this.access(
            `https://api.weixin.qq.com/cgi-bin/get_current_selfmenu_info?access_token=${token}`,
            myInit
        );
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
        const result = await this.access(
            `https://api.weixin.qq.com/cgi-bin/menu/get?access_token=${token}`,
            myInit
        );
        return result;
    }

    async createMenu(menuConfig: any) {
        const myInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(menuConfig),
        };
        const token = await this.getAccessToken();
        const result = await this.access(
            `https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${token}`,
            myInit
        );
        return result;
    }

    async createConditionalMenu(menuConfig: any) {
        const myInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(menuConfig),
        };
        const token = await this.getAccessToken();
        const result = await this.access(
            `https://api.weixin.qq.com/cgi-bin/menu/addconditional?access_token=${token}`,
            myInit
        );
        return result;
    }

    async deleteConditionalMenu(menuId: number) {
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
        const result = await this.access(
            `https://api.weixin.qq.com/cgi-bin/menu/delconditional?access_token=${token}`,
            myInit
        );
        return result;
    }

    async deleteMenu() {
        const myInit = {
            method: 'GET',
        };
        const token = await this.getAccessToken();
        const result = await this.access(
            `https://api.weixin.qq.com/cgi-bin/menu/delete?access_token=${token}`,
            myInit
        );
        return result;
    }

    private async refreshAccessToken(url?: string, init?: RequestInit) {
        const result = this.externalRefreshFn
            ? await this.externalRefreshFn(this.appId)
            : await this.access(
                  `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appId}&secret=${this.appSecret}`
              );
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

    async getQrCode(options: {
        sceneId?: number;
        sceneStr?: string;
        expireSeconds?: number;
        isPermanent?: boolean;
    }) {
        const { sceneId, sceneStr, expireSeconds, isPermanent } = options;
        if (!sceneId && !sceneStr) {
            assert(false, 'Missing sceneId or sceneStr');
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
        const result = await this.access(
            `https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=${token}`,
            myInit
        );

        return {
            ticket: result.ticket,
            url: result.url,
            expireSeconds: result.expire_seconds,
        };
    }
    async sendTemplateMessage(options: {
        openId: string;
        templateId: string;
        url?: string;
        data: Object;
        miniProgram?: {
            appid: string;
            pagepath: string;
        };
        clientMsgId?: string;
    }) {
        const { openId, templateId, url, data, miniProgram, clientMsgId } =
            options;
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
        const result = await this.access(
            `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${token}`,
            myInit
        );
        const { errcode } = result;
        if (errcode === 0) {
            return Object.assign({ success: true }, result);
        }
        return Object.assign({ success: false }, result);
    }
    async sendServeMessage(options: ServeMessageOption) {
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
                assert(false, '当前消息类型暂不支持');
            }
        }
        const token = await this.getAccessToken();
        const result = await this.access(
            `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${token}`,
            myInit
        );
        const { errcode } = result;
        if (errcode === 0) {
            return Object.assign({ success: true }, result);
        }
        return Object.assign({ success: false }, result);
    }
    async batchGetArticle(options: {
        offset?: number;
        count: number;
        noContent?: 0 | 1;
    }) {
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
        const result = await this.access(
            `https://api.weixin.qq.com/cgi-bin/freepublish/batchget?access_token=${token}`,
            myInit
        );
        return result;
    }

    async getArticle(options: { articleId: string }) {
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
        const result = await this.access(
            `https://api.weixin.qq.com/cgi-bin/freepublish/getarticle?access_token=${token}`,
            myInit
        );
        return result;
    }

    // 创建永久素材
    async createMaterial(options: {
        type: MediaType;
        media: any;
        filename: string;
        filetype: string;
        description?: { title: string; introduction: string };
    }) {
        const { type, media, description, filetype, filename } = options;

        const formData = new FormData();
        formData.append('media', media, {
            contentType: filetype, // 微信识别需要
            filename: filename, // 微信识别需要
        });
        if (type === 'video') {
            formData.append('description', JSON.stringify(description));
        }

        const getLength = () => {
            return new Promise((resolve, reject) => {
                formData.getLength((err, length) => {
                    if (err) {
                        reject(err);
                    } else {
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
        const result = await this.access(
            `https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=${token}&type=${type}`,
            myInit
        );
        return result;
    }

    //创建图文消息内的图片获取URL
    async createImgInNewsMaterial(options: {
        media: any;
        filename: string;
        filetype: string;
    }) {
        const { media, filetype, filename } = options;
        const formData = new FormData();
        formData.append('media', media, {
            contentType: filetype, // 微信识别需要
            filename: filename, // 微信识别需要
        });
        const getLength = () => {
            return new Promise((resolve, reject) => {
                formData.getLength((err, length) => {
                    if (err) {
                        reject(err);
                    } else {
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
        const result = await this.access(
            `https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token=${token}`,
            myInit
        );
        return result;
    }

    //创建临时素材
    async createTemporaryMaterial(options: {
        type: MediaType;
        media: any;
        filename: string;
        filetype: string;
    }) {
        const { type, media, filetype, filename } = options;
        const formData = new FormData();
        formData.append('media', media, {
            contentType: filetype, // 微信识别需要
            filename: filename, // 微信识别需要
        });
        const getLength = () => {
            return new Promise((resolve, reject) => {
                formData.getLength((err, length) => {
                    if (err) {
                        reject(err);
                    } else {
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
        const result = await this.access(
            `https://api.weixin.qq.com/cgi-bin/media/upload?access_token=${token}&type=${type}`,
            myInit
        );
        return result;
    }

    // 获取素材列表
    async batchGetMaterialList(options: {
        type: 'image' | 'video' | 'voice' | 'news';
        offset?: number;
        count: number;
    }) {
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
        const result = await this.access(
            `https://api.weixin.qq.com/cgi-bin/material/batchget_material?access_token=${token}`,
            myInit
        );
        return result;
    }

    // 获取永久素材
    async getMaterial(options: { mediaId: string }) {
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
        const result = await this.access(
            `https://api.weixin.qq.com/cgi-bin/material/get_material?access_token=${token}`,
            myInit
        );
        return result;
    }

    // 获取临时素材
    async getTemporaryMaterial(options: { mediaId: string }) {
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
        const result = await this.access(
            `https://api.weixin.qq.com/cgi-bin/media/get?access_token=${token}`,
            myInit
        );
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
        const result = (await this.access(
            `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${token}&type=jsapi`,
            myInit
        )) as {
            ticket: string;
            expires_in: number;
        };

        const { ticket } = result;

        return ticket;
    }

    isJson(data: string) {
        try {
            JSON.parse(data);
            return true;
        } catch (e) {
            return false;
        }
    }

    decryptData(
        sessionKey: string,
        encryptedData: string,
        iv: string,
        signature: string
    ) {
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

    private randomString() {
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
    async getAllPrivateTemplate() {
        const myInit = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const token = await this.getAccessToken();
        const result = await this.access(
            `https://api.weixin.qq.com/cgi-bin/template/get_all_private_template?access_token=${token}`,
            myInit
        );
        return result;
    }
    async signatureJsSDK(options: { url: string }) {
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
                zhimaString += contentArray[ele as keyof typeof contentArray];
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
require('../../fetch');
import crypto from 'crypto';
import { Buffer } from 'buffer';
// 目前先支持text和news, 其他type文档：https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Service_Center_messages.html
// type ServeMessageType = 'text' | 'news' | 'mpnews' | 'mpnewsarticle' | 'image' | 'voice' | 'video' | 'music' | 'msgmenu';/
type TextServeMessageOption = {
    openId: string;
    type: 'text';
    content: string;
};
type NewsServeMessageOption = {
    openId: string;
    type: 'news';
    title: string;
    description?: string;
    url: string;
    picurl?: string;
};

type ServeMessageOption = TextServeMessageOption | NewsServeMessageOption;

export class WechatPublicInstance {
    appId: string;
    appSecret: string;

    accessToken?: string;
    refreshAccessTokenHandler?: any;

    constructor(appId: string, appSecret: string) {
        this.appId = appId;
        this.appSecret = appSecret;

        this.refreshAccessToken();
    }

    private async getAccessToken() {
        while (true) {
            if (this.accessToken) {
                return this.accessToken;
            }

            await new Promise((resolve) => setTimeout(() => resolve(0), 500));
        }
    }

    private async access(url: string, mockData: any, init?: RequestInit) {
        if (process.env.NODE_ENV === 'development') {
            return mockData;
        }
        const response = await fetch(url, init);

        const { headers, status } = response;
        if (![200, 201].includes(status)) {
            throw new Error(`微信服务器返回不正确应答：${status}`);
        }
        const contentType =
            (headers as any)['Content-Type'] || headers.get('Content-Type')!;
        if (contentType.includes('application/json')) {
            const json = await response.json();
            if (typeof json.errcode === 'number' && json.errcode !== 0) {
                throw new Error(
                    `调用微信接口返回出错，code是${json.errcode}，信息是${json.errmsg}`
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
            return data;
        }
        if (contentType.includes('application/octet-stream')) {
            return await response.arrayBuffer();
        }

        return response;
    }

    async code2Session(code: string) {
        const result = await this.access(
            `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${this.appId}&secret=${this.appSecret}&code=${code}&grant_type=authorization_code`,
            { session_key: 'aaa', openid: code, unionid: code }
        );
        const { session_key, openid, unionid } =
            typeof result === 'string' ? JSON.parse(result) : result; // 这里微信返回的数据有时候竟然是text/plain

        return {
            sessionKey: session_key as string,
            openId: openid as string,
            unionId: unionid as string,
        };
    }

    private async refreshAccessToken() {
        const result = await this.access(
            `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appId}&secret=${this.appSecret}`,
            { access_token: 'mockToken', expires_in: 3600 * 1000 }
        );
        const { access_token, expires_in } = result;
        this.accessToken = access_token;
        // 生成下次刷新的定时器
        this.refreshAccessTokenHandler = setTimeout(() => {
            this.refreshAccessToken();
        }, (expires_in - 10) * 1000);
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

        if (data.watermark.appid !== this.appId) {
            throw new Error('Illegal Buffer');
        }

        return data;
    }

    async getQrCode(options: {
        sceneId?: number;
        sceneStr?: string;
        expireSeconds?: number;
        isPermanent?: boolean;
    }) {
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
        const result = await this.access(
            `https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=${token}`,
            {
                ticket: `ticket${Date.now()}`,
                url: `http://mock/q/${sceneId ? sceneId : sceneStr}`,
                expireSeconds: expireSeconds,
            },
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
            {
                errcode: 0,
                errmsg: 'ok',
                msgid: Date.now(),
            },
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
            default: {
                throw new Error('当前消息类型暂不支持');
            }
        }
        const token = await this.getAccessToken();
        const result = await this.access(
            `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${token}`,
            {
                errcode: 0,
                errmsg: 'ok',
            },
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
            {
                total_count: 1,
                item_count: 1,
                item: [
                    {
                        article_id: 'test',
                        content: {
                            news_item: [
                                {
                                    title: '测试文章',
                                    author: '测试作者',
                                    digest: '测试摘要',
                                    content: '测试内容',
                                    content_source_url: '',
                                    thumb_media_id: 'TEST_MEDIA_ID',
                                    show_cover_pic: 1,
                                    need_open_comment: 0,
                                    only_fans_can_comment: 0,
                                    url: 'TEST_ARTICLE_URL',
                                    is_deleted: false,
                                },
                            ],
                        },
                        update_time: Date.now(),
                    },
                ],
            },
            myInit
        );
        const { errcode } = result;
        if (!errcode) {
            return result;
        }
        throw new Error(JSON.stringify(result));
    }
}

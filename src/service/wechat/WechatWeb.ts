require('../../fetch');
import crypto from 'crypto';
import { Buffer } from 'buffer';
import {
    OakExternalException,
    OakNetworkException,
    OakServerProxyException,
} from 'oak-domain/lib/types/Exception';
import { assert } from 'oak-domain/lib/utils/assert';

export class WechatWebInstance {
    appId: string;
    appSecret?: string;

    accessToken?: string;
    refreshAccessTokenHandler?: any;
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
            throw new OakNetworkException(`访问wechat接口失败，「${url}」`);
        }

        const { headers, status } = response;
        if (![200, 201].includes(status)) {
            throw new OakServerProxyException(
                `访问wechat接口失败，「${url}」,「${status}」`
            );
        }
        const contentType =
            (headers as any)['Content-Type'] || headers.get('Content-Type')!;
        if (contentType?.includes('application/json')) {
            const json = await response.json();
            if (typeof json.errcode === 'number' && json.errcode !== 0) {
                if ([40001, 42001].includes(json.errcode)) {
                    return this.refreshAccessToken();
                }
                throw new OakExternalException(
                    'wechat',
                    json.errcode,
                    json.errmsg
                );
            }
            return json;
        }
        if (
            contentType?.includes('text') ||
            contentType?.includes('xml') ||
            contentType?.includes('html')
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
                        'wechat',
                        json.errcode,
                        json.errmsg
                    );
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

    async code2Session(code: string) {
        const result = await this.access(
            `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${this.appId}&secret=${this.appSecret}&code=${code}&grant_type=authorization_code`,
            undefined,
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

    private async refreshAccessToken(url?: string, init?: RequestInit) {
        const result = this.externalRefreshFn
            ? await this.externalRefreshFn(this.appId)
            : await this.access(
                  `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appId}&secret=${this.appSecret}`,
                  undefined,
                  { access_token: 'mockToken', expires_in: 600 }
              );
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

    private isJson(data: string) {
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
}

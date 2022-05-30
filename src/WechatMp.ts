import crypto from 'crypto';
import  { Buffer } from 'buffer';

export class WechatMpInstance {
    appId: string;
    appSecret: string;

    accessToken?: string;
    refreshAcessTokenHandler?: any;

    constructor(appId: string, appSecret: string) {
        this.appId = appId;
        this.appSecret = appSecret;

        this.refreshAccessToken();
    }

    private async access(url: string, init?: RequestInit) {
        const response = await global.fetch(url, init);
        
        const { headers, status } = response;
        if (![200, 201].includes(status)) {
            throw new Error(`微信服务器返回不正确应答：${status}`);
        }
        const contentType = (headers as any)['Content-Type'] || headers.get('Content-Type')!;
        if (contentType.includes('application/json')) {
            const json = await response.json();
            if (typeof json.errcode === 'number' && json.errcode !== 0) {
                throw new Error(`调用微信接口返回出错，code是${json.errcode}，信息是${json.errmsg}`);
            }
            return json;
        }
        if (
            contentType.includes('text')
            || contentType.includes('xml')
            || contentType.includes('html')
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
        const result = await this.access(`https://api.weixin.qq.com/sns/jscode2session?appid=${this.appId}&secret=${this.appSecret}&js_code=${code}&grant_type=authorization_code`);        
        const { session_key, openid, unionid } = JSON.parse(result);    // 这里微信返回的数据竟然是text/plain

        return {
            sessionKey: session_key as string,
            openId: openid as string,
            unionId: unionid as string,
        };
    }

    private async refreshAccessToken() {
        const result = await this.access(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appId}&secret=${this.appSecret}`);
        const { access_token, expires_in } = result;
        this.accessToken = access_token;
        // 生成下次刷新的定时器
        this.refreshAcessTokenHandler = setTimeout(() => {
            this.refreshAccessToken();
        }, (expires_in - 10) * 1000);
    }


    decryptData(sessionKey: string, encryptedData: string, iv: string, signature: string) {
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

    async getMpUnlimitWxaCode({ scene, page, envVersion, width, autoColor, lineColor, isHyaline }: {
        scene: string;
        page: string;
        envVersion?: string;
        width?: number;
        autoColor?: boolean;
        lineColor?: {
            r: number;
            g: number;
            b: number;
        };
        isHyaline?: true;
    }) {
        const result = await this.access(`https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${this.accessToken}`, {
            method: 'POST',
            headers: {
                'Content-type': "application/json",
                'Accept': 'image/jpg',
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
            })
        });
        return (await result.arrayBuffer()) as ArrayBuffer;
    }
};
export class WechatMpInstance {
    appId: string;
    appSecret: string;

    constructor(appId: string, appSecret: string) {
        this.appId = appId;
        this.appSecret = appSecret;
    }

    async code2Session(code: string) {        
        const result = await global.fetch(`https://api.weixin.qq.com/sns/jscode2session?appid=${this.appId}&secret=${this.appSecret}&js_code=${code}&grant_type=authorization_code`);
        const json = await result.json();
        const { session_key, openid, unionid } = json;

        return {
            sessionKey: session_key as string,
            openId: openid as string,
            unionId: unionid as string,
        };
    }
};
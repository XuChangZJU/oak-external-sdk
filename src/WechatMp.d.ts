export declare class WechatMpInstance {
    appId: string;
    appSecret: string;
    constructor(appId: string, appSecret: string);
    code2Session(code: string): Promise<{
        sessionKey: string;
        openId: string;
        unionId: string;
    }>;
}

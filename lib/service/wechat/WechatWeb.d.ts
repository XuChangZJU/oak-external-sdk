export declare class WechatWebInstance {
    appId: string;
    appSecret: string;
    accessToken?: string;
    refreshAccessTokenHandler?: any;
    constructor(appId: string, appSecret: string);
    private getAccessToken;
    private access;
    code2Session(code: string): Promise<{
        sessionKey: string;
        openId: string;
        unionId: string;
    }>;
    private refreshAccessToken;
    decryptData(sessionKey: string, encryptedData: string, iv: string, signature: string): any;
}

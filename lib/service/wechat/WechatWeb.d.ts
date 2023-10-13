export declare class WechatWebInstance {
    appId: string;
    appSecret?: string;
    accessToken?: string;
    refreshAccessTokenHandler?: any;
    private externalRefreshFn?;
    constructor(appId: string, appSecret?: string, accessToken?: string, externalRefreshFn?: (appId: string) => Promise<string>);
    private getAccessToken;
    private access;
    code2Session(code: string): Promise<{
        sessionKey: string;
        openId: string;
        unionId: string;
    }>;
    private refreshAccessToken;
    private isJson;
    decryptData(sessionKey: string, encryptedData: string, iv: string, signature: string): any;
}

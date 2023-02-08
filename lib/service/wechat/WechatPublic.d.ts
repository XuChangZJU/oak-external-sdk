declare type TextServeMessageOption = {
    openId: string;
    type: 'text';
    content: string;
};
declare type NewsServeMessageOption = {
    openId: string;
    type: 'news';
    title: string;
    description?: string;
    url: string;
    picurl?: string;
};
declare type ServeMessageOption = TextServeMessageOption | NewsServeMessageOption;
export declare class WechatPublicInstance {
    appId: string;
    appSecret: string;
    private accessToken?;
    private refreshAccessTokenHandler?;
    constructor(appId: string, appSecret: string);
    private getAccessToken;
    private access;
    code2Session(code: string): Promise<{
        accessToken: string;
        openId: string;
        unionId: string;
        scope: string;
        refreshToken: string;
        isSnapshotUser: boolean;
        atExpiredAt: number;
        rtExpiredAt: number;
    }>;
    refreshUserAccessToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        atExpiredAt: number;
        scope: string;
    }>;
    getUserInfo(accessToken: string, openId: string): Promise<{
        nickname: string;
        gender: string | undefined;
        avatar: string;
    }>;
    private refreshAccessToken;
    decryptData(sessionKey: string, encryptedData: string, iv: string, signature: string): any;
    getQrCode(options: {
        sceneId?: number;
        sceneStr?: string;
        expireSeconds?: number;
        isPermanent?: boolean;
    }): Promise<{
        ticket: any;
        url: any;
        expireSeconds: any;
    }>;
    sendTemplateMessage(options: {
        openId: string;
        templateId: string;
        url?: string;
        data: Object;
        miniProgram?: {
            appid: string;
            pagepath: string;
        };
        clientMsgId?: string;
    }): Promise<any>;
    sendServeMessage(options: ServeMessageOption): Promise<any>;
    batchGetArticle(options: {
        offset?: number;
        count: number;
        noContent?: 0 | 1;
    }): Promise<any>;
}
export {};

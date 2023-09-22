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
type ServeMessageOption = TextServeMessageOption | NewsServeMessageOption | MpServeMessageOption;
export declare class WechatPublicInstance {
    appId: string;
    appSecret?: string;
    private accessToken?;
    private refreshAccessTokenHandler?;
    private externalRefreshFn?;
    constructor(appId: string, appSecret?: string, accessToken?: string, externalRefreshFn?: (appId: string) => Promise<string>);
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
    createTag(tag: {
        name: string;
    }): Promise<any>;
    getTags(): Promise<any>;
    editTag(tag: {}): Promise<void>;
    getCurrentMenu(): Promise<any>;
    getMenu(): Promise<any>;
    createMenu(menuConfig: any): Promise<any>;
    createConditionalMenu(menuConfig: any): Promise<any>;
    deleteConditionalMenu(menuid: number): Promise<any>;
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
    getArticle(options: {
        article_id: string;
    }): Promise<any>;
    createMaterial(options: {
        type: 'image' | 'voice' | 'video' | 'thumb';
        media: File;
        description?: {
            title: string;
            introduction: string;
        };
    }): Promise<any>;
    createImgInNewsMaterial(options: {
        media: File;
    }): Promise<any>;
    createTemporaryMaterial(options: {
        type: 'image' | 'voice' | 'video' | 'thumb';
        media: File;
    }): Promise<any>;
    batchGetMaterialList(options: {
        type: 'image' | 'video' | 'voice' | 'news';
        offset?: number;
        count: number;
    }): Promise<any>;
    getMaterial(options: {
        type: 'image' | 'video' | 'voice' | 'news';
        media_id: string;
    }): Promise<any>;
    getTemporaryMaterial(options: {
        media_id: string;
    }): Promise<any>;
    getTicket(): Promise<string>;
    private randomString;
    signatureJsSDK(options: {
        url: string;
    }): Promise<{
        signature: string;
        noncestr: string;
        timestamp: number;
        appId: string;
    }>;
}
export {};

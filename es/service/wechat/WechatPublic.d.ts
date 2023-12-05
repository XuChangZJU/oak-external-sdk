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
    createTag(params: {
        name: string;
    }): Promise<any>;
    getTags(): Promise<any>;
    editTag(tag: {
        id: number;
        name: string;
    }): Promise<any>;
    deleteTag(tag: {
        id: number;
    }): Promise<any>;
    getTagUsers(tagid: number): Promise<any>;
    batchtagging(openid_list: string[], tagid: number): Promise<any>;
    batchuntagging(openid_list: string[], tagid: number): Promise<any>;
    getUsers(nextOpenId: string): Promise<any>;
    getUserTags(openid: string): Promise<any>;
    getSubscribedUserInfo(openid: string): Promise<any>;
    getCurrentMenu(): Promise<any>;
    getMenu(): Promise<any>;
    createMenu(menuConfig: any): Promise<any>;
    createConditionalMenu(menuConfig: any): Promise<any>;
    deleteConditionalMenu(menuId: number): Promise<any>;
    deleteMenu(): Promise<any>;
    private refreshAccessToken;
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
        articleId: string;
    }): Promise<any>;
    createMaterial(options: {
        type: MediaType;
        media: any;
        filename: string;
        filetype: string;
        fileLength: number;
        description?: {
            title: string;
            introduction: string;
        };
    }): Promise<{
        media_id: string;
        url: string;
    }>;
    createImgInNewsMaterial(options: {
        media: any;
        filename: string;
        filetype: string;
        fileLength: number;
    }): Promise<any>;
    createTemporaryMaterial(options: {
        type: MediaType;
        media: any;
        filename: string;
        filetype: string;
        fileLength: number;
    }): Promise<{
        type: string;
        media_id: string;
        created_at: number;
    }>;
    batchGetMaterialList(options: {
        type: 'image' | 'video' | 'voice' | 'news';
        offset?: number;
        count: number;
    }): Promise<{
        total_count: number;
        item_count: number;
        item: {
            media_id: string;
            update_time: number;
            name?: string;
            url?: string;
            content?: {
                news_item: {
                    title: string;
                    thumb_media_id: string;
                    show_cover_pic: string;
                    author: string;
                    digest: string;
                    content: string;
                    url: string;
                    content_source_url: string;
                }[];
            };
        }[];
    }>;
    getMaterial(options: {
        mediaId: string;
    }): Promise<any>;
    getTemporaryMaterial(options: {
        mediaId: string;
    }): Promise<any>;
    getMaterialCount(): Promise<{
        voice_count: number;
        video_count: number;
        image_count: number;
        news_count: number;
    }>;
    deleteMaterial(options: {
        mediaId: string;
    }): Promise<any>;
    getTicket(): Promise<string>;
    getAllPrivateTemplate(): Promise<{
        template_id: string;
        title: string;
        primary_industry: string;
        deputy_industry: string;
        content: string;
        example: string;
    }[]>;
    private isJson;
    decryptData(sessionKey: string, encryptedData: string, iv: string, signature: string): any;
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

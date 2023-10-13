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
        appId?: string;
        pagepath: string;
        thumbnailId: string;
    };
};
type MediaType = 'image' | 'voice' | 'video' | 'thumb';
type ServeMessageOption = TextServeMessageOption | NewsServeMessageOption | MpServeMessageOption | ImageServeMessageOption;
export declare class WechatMpInstance {
    appId: string;
    appSecret?: string;
    private accessToken?;
    private refreshAccessTokenHandler?;
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
    decryptData(sessionKey: string, encryptedData: string, iv: string, signature: string): any;
    getMpUnlimitWxaCode({ scene, page, envVersion, width, autoColor, lineColor, isHyaline, }: {
        scene: string;
        page: string;
        envVersion?: 'release' | 'trial' | 'develop';
        width?: number;
        autoColor?: boolean;
        lineColor?: {
            r: number;
            g: number;
            b: number;
        };
        isHyaline?: true;
    }): Promise<ArrayBuffer>;
    getUserPhoneNumber(code: string): Promise<{
        phoneNumber: string;
        purePhoneNumber: string;
        countryCode: number;
        watermark: {
            timestamp: number;
            appid: string;
        };
    }>;
    /**
     * 发送订阅消息
     * @param param0
     * @returns
     * https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/mp-message-management/subscribe-message/sendMessage.html
     */
    sendSubscribedMessage({ templateId, page, openId, data, state, lang, }: {
        templateId: string;
        page?: string;
        openId: string;
        data: object;
        state?: 'developer' | 'trial' | 'formal';
        lang?: 'zh_CN' | 'zh_TW' | 'en_US' | 'zh_HK';
    }): Promise<any>;
    createTemporaryMaterial(options: {
        type: MediaType;
        media: any;
        filename: string;
        filetype: string;
    }): Promise<any>;
    sendServeMessage(options: ServeMessageOption): Promise<any>;
    private isJson;
}
export {};

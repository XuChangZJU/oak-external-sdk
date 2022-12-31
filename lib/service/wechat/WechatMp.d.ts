export declare class WechatMpInstance {
    appId: string;
    appSecret: string;
    private accessToken?;
    private refreshAccessTokenHandler?;
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
    getMpUnlimitWxaCode({ scene, page, envVersion, width, autoColor, lineColor, isHyaline }: {
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
    }): Promise<ArrayBuffer>;
}

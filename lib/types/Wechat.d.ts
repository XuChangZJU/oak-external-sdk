/**
 *  微信服务器向应用服务器推送的公众号消息或事件
 * https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Receiving_standard_messages.html
 * https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Receiving_event_pushes.html
 * https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Template_Message_Interface.html#%E4%BA%8B%E4%BB%B6%E6%8E%A8%E9%80%81
 *
 * 微信推送的数据格式是xml，需要自主转化成json对象
 */
export type WechatPublicEventData = {
    ToUserName: string;
    FromUserName: string;
    CreateTime: number;
    MsgID: string;
    MsgType: 'text' | 'image' | 'voice' | 'video' | 'location' | 'link' | 'event';
    Event?: 'subscribe' | 'unsubscribe' | 'SCAN' | 'LOCATION' | 'CLICK' | 'VIEW' | 'TEMPLATESENDJOBFINISH';
    EventKey?: string;
    Ticket?: string;
    Latitude?: string;
    Longitude?: string;
    Precision?: string;
    Status?: string;
    Content?: string;
    MsgDataId?: string;
    PicUrl?: string;
    MediaId?: string;
    Format?: string;
    Recognition?: string;
    ThumbMediaId?: string;
    Location_X?: number;
    Location_Y?: number;
    Scale?: number;
    Label?: string;
    Title?: string;
    Description?: string;
    Url?: string;
    Idx?: number;
};
export declare type WechatMpEventData = {
    ToUserName: string;
    FromUserName: string;
    CreateTime: number;
    MsgID: string;
    MsgType: 'text' | 'image' | 'miniprogrampage' | 'event';
    Content?: string;
    PicUrl?: string;
    Title?: string;
    AppId?: string;
    PagePath?: string;
    ThumbUrl?: string;
    ThumbMediaId?: string;
};

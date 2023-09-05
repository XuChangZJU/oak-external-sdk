/**
 *  微信服务器向应用服务器推送的公众号消息或事件
 * https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Receiving_standard_messages.html
 * https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Receiving_event_pushes.html
 * https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Template_Message_Interface.html#%E4%BA%8B%E4%BB%B6%E6%8E%A8%E9%80%81
 *
 * 微信推送的数据格式是xml，需要自主转化成json对象
 */
export declare type WechatPublicEventData = {
    ToUserName: string;
    FromUserName: string;
    CreateTime: string;
    MsgType: string;
    Event: string;
    Content: string;
    EventKey: string;
    MsgID: string;
    Status: string;
};

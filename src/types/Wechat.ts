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
    MsgType:
        | 'text'
        | 'image'
        | 'voice'
        | 'video'
        | 'location'
        | 'link'
        | 'event'; // 消息类型; event接收事件推送
    // 接收事件
    Event?:
        | 'subscribe'
        | 'unsubscribe'
        | 'SCAN'
        | 'LOCATION'
        | 'CLICK'
        | 'VIEW'
        | 'TEMPLATESENDJOBFINISH'; // MsgType是event
    EventKey?: string; // 事件KEY值，subscribe: qrscene_为前缀，后面为二维码的参数值; SCAN: 一个32位无符号整数，即创建二维码时的二维码scene_id; CLICK: 自定义菜单接口中KEY值对应; VIEW: 设置的跳转URL;
    Ticket?: string; // subscribe 二维码的ticket，可用来换取二维码图片
    Latitude?: string; // LOCATION 地理位置纬度
    Longitude?: string; // LOCATION 地理位置经度
    Precision?: string; // LOCATION 地理位置精度

    // 接收模版消息回调
    Status?: string; // 模版消息回调 发送状态

    // 接收客服消息
    Content?: string; // 文本消息内容
    MsgDataId?: string; // 消息的数据ID（消息如果来自文章时才有）
    PicUrl?: string; //图片链接（由系统生成）
    MediaId?: string; // 图片消息媒体id、语音消息媒体id、视频消息媒体id
    Format?: string; // 语音格式
    Recognition?: string; // 语音识别结果
    ThumbMediaId?: string; // 视频消息缩略图的媒体id

    Location_X?: number; // 地理位置纬度
    Location_Y?: number; // 地理位置经度
    Scale?: number; // 地图缩放大小
    Label?: string; // 地理位置信息

    Title?: string; // link 消息标题
    Description?: string; // link 消息描述
    Url?: string; // link 消息链接
    Idx?: number; // link 多图文时第几篇文章，从1开始（消息如果来自文章时才有）
};

// 接收客服消息
export declare type WechatMpEventData = {
    ToUserName: string;
    FromUserName: string;
    CreateTime: number;
    MsgID: string;
    MsgType: 'text' | 'image' | 'miniprogrampage' | 'event'; // event 用户在小程序“客服会话按钮”进入客服会话
    Event?: 'user_enter_tempsession'; //进入会话事件
    SessionFrom?: string;

    Content?: string; // 文本消息内容
    MediaId?: string; // 图片消息媒体id
    PicUrl?: string; //图片链接（由系统生成）
    Title?: string; // 标题
    AppId?: string; // 小程序appid
    PagePath?: string; // 小程序页面路径
    ThumbUrl?: string; // 封面图片的临时cdn链接
    ThumbMediaId?: string; // 封面图片的临时素材id
};
import { WechatMpInstance, WechatSDK } from '../src/index';
// 测试数据自主填写
/////////////////////////////////////////////////
const APP_ID = '';
const ACCESS_TOKEN = '';
/////////////////////////////////////////////////
const wechatMpInstance = WechatSDK.getInstance(APP_ID, 'wechatMp', undefined, ACCESS_TOKEN, () => {
    throw new Error('测试下不支持刷新，请手动修改测试文件中的ACCESS_TOKEN值');
}) as WechatMpInstance;


// 测试发订阅消息
/////////////////////////////////////////////////
const OPEN_ID = 'oE8wP5QJM7cedDn_aax_nFtI5TsY';
const TEMPLATE_ID = 'Gwimox87AyoFRbf30xPaZrz0z_3bmDY-NrH3WyxswdU';
const DATA = {
    thing1: {
        value: '测试活动',
    },
    thing2: {
        value: '测试奖励',
    },
    thing3: {
        value: '温馨提示',
    }
};
/////////////////////////////////////////////////
async function testSendSubscribedMessage() {
    const result = await wechatMpInstance.sendSubscribedMessage({
        templateId: TEMPLATE_ID,
        openId: OPEN_ID,
        data: DATA,
        state: 'developer',
    });
    console.log(result);
}

testSendSubscribedMessage();



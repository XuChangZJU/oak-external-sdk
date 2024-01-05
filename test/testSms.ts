

//测试天翼云发短信
import { CTYunSmsInstance, SmsSdk } from '../src/index';

const accessKey = '';
const securityKey = '';

async function sendSms() {
    const instance = SmsSdk.getInstance(
        'ctyun',
        accessKey,
        securityKey,
        'sms-global.ctapi.ctyun.cn'
    ) as CTYunSmsInstance;

   const data = await instance.sendSms({
       phoneNumber: '13372548015',
       templateCode: 'SMS64124870510',
       templateParam: { code: '1111' },
       signName: '天翼云测试',
   });

    console.log(data);
}

async function syncTemplate() {
    const instance = SmsSdk.getInstance(
        'ctyun',
        accessKey,
        securityKey,
        'sms-global.ctapi.ctyun.cn'
    ) as CTYunSmsInstance;

    const data = await instance.syncTemplate({
        pageIndex: 1,
        pageSize: 50
    });

    console.log(data);
}

// sendSms()
// syncTemplate();



import crypto from 'crypto';
import { OakNetworkException, } from 'oak-domain/lib/types/Exception';
function format(date, layout) {
    function pad(num, digit) {
        const d = digit || 2;
        let result = num.toString();
        while (result.length < d) {
            result = '0' + result;
        }
        return result;
    }
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hour = d.getHours();
    const minute = d.getMinutes();
    const second = d.getSeconds();
    const millisecond = d.getMilliseconds();
    let result = layout || 'YYYYMMDDTHHmmss';
    result = result
        .replace(/YYYY/g, year.toString())
        .replace(/MM/g, pad(month))
        .replace(/DD/g, pad(day))
        .replace(/HH/g, pad(hour))
        .replace(/mm/g, pad(minute))
        .replace(/ss/g, pad(second))
        .replace(/SSS/g, pad(millisecond, 3));
    return result;
}
export class CTYunSmsInstance {
    accessKey;
    securityKey;
    endpoint;
    constructor(accessKey, securityKey, endpoint) {
        this.accessKey = accessKey;
        this.securityKey = securityKey;
        this.endpoint = endpoint || 'sms-global.ctapi.ctyun.cn';
    }
    async sendSms(params) {
        const { phoneNumber, templateParam = {}, templateCode, signName, } = params;
        const sendSmsRequest = {
            action: 'SendSms',
            phoneNumber,
            templateParam: JSON.stringify(templateParam),
            templateCode: templateCode,
            signName: signName,
        };
        try {
            const data = await this.access(`https://${this.endpoint}/sms/api/v1`, sendSmsRequest);
            return data;
        }
        catch (error) {
            throw error;
        }
    }
    async syncTemplate(params) {
        const { pageIndex, pageSize } = params;
        const request = {
            action: 'QuerySmsTemplateList',
            pageIndex,
            pageSize,
        };
        try {
            const data = await this.access(`https://${this.endpoint}/sms/api/v1`, request);
            return data;
        }
        catch (err) {
            throw err;
        }
    }
    async access(url, body, method) {
        // SETUP2:构造时间戳
        const timestamp = format(new Date(), 'YYYYMMDDTHHmmss') + 'Z';
        // SETUP3:构造请求流水号
        const requestId = crypto.randomUUID();
        // SETUP4:构造待签名字符串
        const headerStr = `ctyun-eop-request-id:${requestId}\neop-date:${timestamp}\n\n`;
        const calculateContentHash = this.sha256(JSON.stringify(body));
        const rawString = `${headerStr}\n${calculateContentHash}`;
        // SETUP5:构造签名
        const signTime = this.hmacsha256(timestamp, this.securityKey);
        const signAK = this.hmacsha256(this.accessKey, Buffer.from(signTime, 'hex'));
        const signDate = this.hmacsha256(timestamp.slice(0, 8), Buffer.from(signAK, 'hex'));
        const sign = this.hmacsha256(rawString, Buffer.from(signDate, 'hex'));
        const signature = Buffer.from(sign, 'hex').toString('base64');
        // SETUP:6 构造请求头
        const signatureHeader = `${this.accessKey} Headers=ctyun-eop-request-id;eop-date Signature=${signature}`;
        const headers = {
            'Content-Type': 'application/json',
            'eop-date': timestamp,
            'Eop-Authorization': signatureHeader,
            'ctyun-eop-request-id': requestId,
        };
        let response;
        try {
            response = await fetch(url, {
                method: method || 'POST',
                headers,
                body: JSON.stringify(body),
            });
        }
        catch (err) {
            // fetch返回异常一定是网络异常
            throw new OakNetworkException();
        }
        return response.json();
    }
    hmacsha256(data, key) {
        const hmac = crypto
            .createHmac('sha256', key)
            .update(data)
            .digest('hex');
        return hmac;
    }
    sha256(data) {
        return crypto.createHash('SHA256').update(data).digest('hex');
    }
}

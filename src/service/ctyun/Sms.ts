import crypto from 'crypto';
import { Buffer } from 'buffer';
import * as querystring from 'querystring';
import {
    OakExternalException,
    OakNetworkException,
} from 'oak-domain/lib/types/Exception';


type SendSmsRequest = {
    phoneNumber: string; // 接收短信的手机号码。格式：国内短信：无任何前缀的11位手机号码，例如1381111****。多个手机号码使用英文","隔开，最多支持一次提交200个手机号码。
    templateCode: string;
    signName: string;
    templateParam?: Record<string, string>;
    extendCode?: string;
    sessionId?: string;
};

type SendSmsResponse = {
    code: 'OK' | string;
    message: string;
    requestId: string;
};

type DescribeSmsTemplateListRequest = {
    pageIndex: number;
    pageSize: number;
};

type DescribeSmsTemplateListResponse = {
    code: 'OK' | string;
    message: string;
    requestId: string;
    total: number;
    data: {
        reason: string;
        createTime: Date;
        updateTime: Date;
        example: string;
        remark: string;
        status: 0 | 1 | 2; // 0: 未审核；1：审核通过；2：审核未通过
        templateCode: string;
        templateType: 1 | 2; // 短信类型。1：验证码；2：短信通知；
        templateName: string;
        templateContent: string;
        templateStatus: 0 | 1 | 2; // 0: 未审核；1：审核通过；2：审核未通过
    }[];
};

function format(date: Date, layout: string) {
    function pad(num: number, digit?: number) {
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
    accessKey: string;
    securityKey: string;
    endpoint: string;

    constructor(accessKey: string, securityKey: string, endpoint: string) {
        this.accessKey = accessKey;
        this.securityKey = securityKey;
        this.endpoint = endpoint || 'sms-global.ctapi.ctyun.cn';
    }

    async sendSms(params: SendSmsRequest) {
        const {
            phoneNumber,
            templateParam = {},
            templateCode,
            signName,
        } = params;
        const sendSmsRequest = {
            action: 'SendSms',
            phoneNumber,
            templateParam: JSON.stringify(templateParam),
            templateCode: templateCode,
            signName: signName,
        };
        try {
            const data = await this.access(
                `https://${this.endpoint}/sms/api/v1`,
                sendSmsRequest
            );
            return data as SendSmsResponse;
        } catch (error) {
            throw error;
        }
    }

    async syncTemplate(params: DescribeSmsTemplateListRequest) {
        const { pageIndex, pageSize } = params;
        const request = {
            action: 'QuerySmsTemplateList',
            pageIndex,
            pageSize,
        };
        try {
            const data = await this.access(
                `https://${this.endpoint}/sms/api/v1`,
                request
            );
            return data as DescribeSmsTemplateListResponse;
        } catch (err) {
            throw err;
        }
    }

    private async access(
        url: string,
        body: Record<string, any>,
        method?: RequestInit['method']
    ) {
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
        const signAK = this.hmacsha256(
            this.accessKey,
            Buffer.from(signTime, 'hex')
        );
        const signDate = this.hmacsha256(
            timestamp.slice(0, 8),
            Buffer.from(signAK, 'hex')
        );
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
        let response: Response;
        try {
            response = await fetch(url, {
                method: method || 'POST',
                headers,
                body: JSON.stringify(body),
            });
        } catch (err) {
            // fetch返回异常一定是网络异常
            throw new OakNetworkException();
        }

        return response.json();
    }

    private hmacsha256(data: any, key: Buffer | string) {
        const hmac = crypto.createHmac('sha1', key).update(data).digest('hex');
        return hmac;
    }

    private sha256(data: string) {
        return crypto.createHash('SHA256').update(data).digest('hex');
    }
}

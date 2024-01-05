import Dysmsapi20170525, * as $Dysmsapi20170525 from '@alicloud/dysmsapi20170525';
import OpenApi, * as $OpenApi from '@alicloud/openapi-client';
import Util, * as $Util from '@alicloud/tea-util';
import * as $tea from '@alicloud/tea-typescript';

type SendSmsRequest = {
    phoneNumbers: string[];
    templateCode: string;
    signName: string;
    templateParam?: Record<string, string>;
    smsUpExtendCode?: string;
    outId?: string;
};

type SendSmsResponse = {
    Code: 'OK' | string;
    Message: string;
    BizId: string;
    RequestId: string;
};

type DescribeSmsTemplateListRequest = {
    PageIndex: number;
    PageSize: number;
};


export class AliSmsInstance {
    accessKeyId: string;
    accessKeySecret: string;
    endpoint: string;
    client: Dysmsapi20170525;

    constructor(
        accessKeyId: string,
        accessKeySecret: string,
        endpoint?: string
    ) {
        this.accessKeyId = accessKeyId;
        this.accessKeySecret = accessKeySecret;
        this.endpoint = endpoint || 'dysmsapi.aliyuncs.com'; // 目前国内终端域名相同
        let config = new $OpenApi.Config({
            // 必填，您的 AccessKey ID
            accessKeyId: accessKeyId,
            // 必填，您的 AccessKey Secret
            accessKeySecret: accessKeySecret,
            endpoint: this.endpoint,
        });
        this.client = new Dysmsapi20170525(config);
    }

    async sendSms(params: SendSmsRequest) {
        const {
            phoneNumbers,
            templateParam = {},
            templateCode,
            signName,
        } = params;
        let sendSmsRequest = new $Dysmsapi20170525.SendSmsRequest({
            phoneNumbers:
                phoneNumbers instanceof Array
                    ? phoneNumbers.join(',')
                    : phoneNumbers,
            templateParam: JSON.stringify(templateParam),
            templateCode: templateCode,
            signName: signName,
        });
        try {
            const data = await this.client.sendSmsWithOptions(
                sendSmsRequest,
                new $Util.RuntimeOptions({})
            );
            const { statusCode, body } = data;
            if (statusCode != 200) {
                throw new Error(`sendSms接口返回状态码错误，为${statusCode}`);
            }
            return body;
        } catch (error) {
            throw error;
        }
    }
    async syncTemplate(params: DescribeSmsTemplateListRequest) {
        const { PageIndex, PageSize } = params;

        try {
            let querySmsTemplateListRequest =
                new $Dysmsapi20170525.QuerySmsTemplateListRequest({
                    PageIndex,
                    PageSize,
                });
            const result = await this.client.querySmsTemplateListWithOptions(
                querySmsTemplateListRequest,
                new $Util.RuntimeOptions({})
            );
            const { statusCode, body } = result;
            if (statusCode != 200) {
                throw new Error(
                    `syncTemplate接口返回状态码错误，为${statusCode}`
                );
            }
            return body;
        } catch (err) {
            throw err;
        }
    }
}

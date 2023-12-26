
/**
 * 此处记录ctyun操作权限名称，更多操作权限参考下方链接
 * https://www.ctyun.cn/document/10306929/10136179
 */
export type Action = '*' | 'PutObject' | 'GetObject' | 'DeleteObject' | 'ListBucket';

export type ReqOptionProps = {
    path: string;
    host: string;
    date: string;
    headers: any
    method: 'DELETE' | "GET" | "POST" | "PUT",
}

export type CTYunZone = 'hazz' | 'lnsy' | 'sccd' | 'xjwlmq' | 'gslz' | 'sdqd' | 'gzgy' | 'hbwh' | 'xzls' | 'ahwh' | 'gdsz' | 'jssz' | 'sh2';

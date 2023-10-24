require('../../utils/fetch');
import {
    OakExternalException,
    OakNetworkException,
    OakServerProxyException,
} from 'oak-domain/lib/types/Exception';

export class AmapInstance {
    key: string;
    constructor(key: string) {
        this.key = key;
    }
    async getDrivingPath(data: {
        from: [number, number];
        to: [number, number];
    }) {
        const { from, to } = data;
        const url = `http://restapi.amap.com/v3/direction/driving?origin=${from[0].toFixed(
            6
        )},${from[1].toFixed(6)}&destination=${to[0].toFixed(
            6
        )},${to[1].toFixed(6)}&strategy=10&key=${this.key}`;
        let response: Response;
        try {
            response = await global.fetch(url);
        } catch (err) {
            throw new OakNetworkException(`访问amap接口失败，「${url}」`);
        }
        const jsonData = await response.json();
        if (jsonData.status !== '1') {
            throw new OakExternalException(
                'amap',
                jsonData.infocode,
                jsonData.info
            );
        }
        return jsonData;
    }

    async regeo(data: { longitude: number; latitude: number }) {
        const { longitude, latitude } = data;
        const url = `https://restapi.amap.com/v3/geocode/regeo?location=${longitude},${latitude}&key=${this.key}`;
        let response: Response;
        try {
            response = await global.fetch(url);
        } catch (err) {
            throw new OakNetworkException(`访问amap接口失败，「${url}」`);
        }
        const jsonData = await response.json();
        if (jsonData.status !== '1') {
            throw new OakExternalException(
                'amap',
                jsonData.infocode,
                jsonData.info
            );
        }
        return jsonData;
    }

    async ipLoc(data: { ip: string }) {
        const { ip } = data;
        const url = `https://restapi.amap.com/v3/ip?key=${this.key}&ip=${ip}`;
        let response: Response;
        try {
            response = await global.fetch(url);
        } catch (err) {
            throw new OakNetworkException(`访问amap接口失败，「${url}」`);
        }
        const jsonData = await response.json();
        if (jsonData.status !== '1') {
            throw new OakExternalException(
                'amap',
                jsonData.infocode,
                jsonData.info
            );
        }
        return jsonData;
    }

    async getDistrict(data: { keywords: string; subdistrict: string }) {
        const { keywords, subdistrict } = data;
        const url = `https://restapi.amap.com/v3/config/district?keywords=${keywords}&subdistrict=${subdistrict}&key=${this.key}`;
        let response: Response;
        try {
            response = await global.fetch(url);
        } catch (err) {
            throw new OakNetworkException(`访问amap接口失败，「${url}」`);
        }
        const jsonData = await response.json();
        if (jsonData.status !== '1') {
            throw new OakExternalException(
                'amap',
                jsonData.infocode,
                jsonData.info
            );
        }
        return jsonData;
    }

    async geocode(data: { address: string }) {
        const { address } = data;
        const url = `https://restapi.amap.com/v3/geocode/geo?address=${address}&key=${this.key}`;
        let response: Response;
        try {
            response = await global.fetch(url);
        } catch (err) {
            throw new OakNetworkException(`访问amap接口失败，「${url}」`);
        }
        const jsonData = await response.json();
        if (jsonData.status !== '1') {
            throw new OakExternalException(
                'amap',
                jsonData.infocode,
                jsonData.info
            );
        }
        return jsonData;
    }
}

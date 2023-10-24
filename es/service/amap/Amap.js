require('../../utils/fetch');
import { OakExternalException, OakNetworkException, } from 'oak-domain/lib/types/Exception';
export class AmapInstance {
    key;
    constructor(key) {
        this.key = key;
    }
    async getDrivingPath(data) {
        const { from, to } = data;
        const url = `http://restapi.amap.com/v3/direction/driving?origin=${from[0].toFixed(6)},${from[1].toFixed(6)}&destination=${to[0].toFixed(6)},${to[1].toFixed(6)}&strategy=10&key=${this.key}`;
        let response;
        try {
            response = await global.fetch(url);
        }
        catch (err) {
            throw new OakNetworkException(`访问amap接口失败，「${url}」`);
        }
        const jsonData = await response.json();
        if (jsonData.status !== '1') {
            throw new OakExternalException('amap', jsonData.infocode, jsonData.info);
        }
        return jsonData;
    }
    async regeo(data) {
        const { longitude, latitude } = data;
        const url = `https://restapi.amap.com/v3/geocode/regeo?location=${longitude},${latitude}&key=${this.key}`;
        let response;
        try {
            response = await global.fetch(url);
        }
        catch (err) {
            throw new OakNetworkException(`访问amap接口失败，「${url}」`);
        }
        const jsonData = await response.json();
        if (jsonData.status !== '1') {
            throw new OakExternalException('amap', jsonData.infocode, jsonData.info);
        }
        return jsonData;
    }
    async ipLoc(data) {
        const { ip } = data;
        const url = `https://restapi.amap.com/v3/ip?key=${this.key}&ip=${ip}`;
        let response;
        try {
            response = await global.fetch(url);
        }
        catch (err) {
            throw new OakNetworkException(`访问amap接口失败，「${url}」`);
        }
        const jsonData = await response.json();
        if (jsonData.status !== '1') {
            throw new OakExternalException('amap', jsonData.infocode, jsonData.info);
        }
        return jsonData;
    }
    async getDistrict(data) {
        const { keywords, subdistrict } = data;
        const url = `https://restapi.amap.com/v3/config/district?keywords=${keywords}&subdistrict=${subdistrict}&key=${this.key}`;
        let response;
        try {
            response = await global.fetch(url);
        }
        catch (err) {
            throw new OakNetworkException(`访问amap接口失败，「${url}」`);
        }
        const jsonData = await response.json();
        if (jsonData.status !== '1') {
            throw new OakExternalException('amap', jsonData.infocode, jsonData.info);
        }
        return jsonData;
    }
    async geocode(data) {
        const { address } = data;
        const url = `https://restapi.amap.com/v3/geocode/geo?address=${address}&key=${this.key}`;
        let response;
        try {
            response = await global.fetch(url);
        }
        catch (err) {
            throw new OakNetworkException(`访问amap接口失败，「${url}」`);
        }
        const jsonData = await response.json();
        if (jsonData.status !== '1') {
            throw new OakExternalException('amap', jsonData.infocode, jsonData.info);
        }
        return jsonData;
    }
}

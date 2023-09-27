"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmapInstance = void 0;
require('../../fetch');
const Exception_1 = require("oak-domain/lib/types/Exception");
class AmapInstance {
    key;
    constructor(key) {
        this.key = key;
    }
    async getDrivingPath(data) {
        const { from, to } = data;
        const url = `http://restapi.amap.com/v3/direction/driving?origin=${from[0].toFixed(6)},${from[1].toFixed(6)}&destination=${to[0].toFixed(6)},${to[1].toFixed(6)}&strategy=10&key=${this.key}`;
        const result = await global.fetch(url);
        const jsonData = await result.json();
        if (jsonData.status !== '1') {
            throw new Exception_1.OakExternalException('amap', jsonData.infocode, jsonData.info);
        }
        return jsonData;
    }
    async regeo(data) {
        const { longitude, latitude } = data;
        const result = await global.fetch(`https://restapi.amap.com/v3/geocode/regeo?location=${longitude},${latitude}&key=${this.key}`);
        const jsonData = await result.json();
        if (jsonData.status !== '1') {
            throw new Exception_1.OakExternalException('amap', jsonData.infocode, jsonData.info);
        }
        return jsonData;
    }
    async ipLoc(data) {
        const { ip } = data;
        const url = `https://restapi.amap.com/v3/ip?key=${this.key}&ip=${ip}`;
        const result = await global.fetch(url);
        const jsonData = await result.json();
        if (jsonData.status !== '1') {
            throw new Exception_1.OakExternalException('amap', jsonData.infocode, jsonData.info);
        }
        return jsonData;
    }
    async getDistrict(data) {
        const { keywords, subdistrict } = data;
        const url = `https://restapi.amap.com/v3/config/district?keywords=${keywords}&subdistrict=${subdistrict}&key=${this.key}`;
        const result = await global.fetch(url);
        const jsonData = await result.json();
        if (jsonData.status !== '1') {
            throw new Exception_1.OakExternalException('amap', jsonData.infocode, jsonData.info);
        }
        return jsonData;
    }
    async geocode(data) {
        const { address } = data;
        const url = `https://restapi.amap.com/v3/geocode/geo?address=${address}&key=${this.key}`;
        const result = await global.fetch(url);
        const jsonData = await result.json();
        if (jsonData.status !== '1') {
            throw new Exception_1.OakExternalException('amap', jsonData.infocode, jsonData.info);
        }
        return jsonData;
    }
}
exports.AmapInstance = AmapInstance;

import { Path, Point } from 'oak-domain/src/types/Geo';

export class AmapInstance {
    key: string;
    constructor(key: string) {
        this.key = key;
    }
    async getDrivingPath(data: Path) {
        const from = data[0];
        const to = data[1]
        const url = `http://restapi.amap.com/v3/direction/driving?origin=${from[0].toFixed(6)},${from[1].toFixed(6)}&destination=${to[0].toFixed(6)},${to[1].toFixed(6)}&strategy=10&key=${KEY}`;
        const result = await global.fetch(url);
        const jsonData = await result.json();
        if (jsonData.status !== '1') {
            throw new Error(JSON.stringify(jsonData));
        }
        return Promise.resolve(jsonData);
    }

    async regeo(location: Point) {
        const locationStr = location.join();
        const result = await global.fetch(`https://restapi.amap.com/v3/geocode/regeo?location=${locationStr}&key=${this.key}`);
        const jsonData = await result.json();
        if (jsonData.status !== '1') {
            throw new Error(JSON.stringify(jsonData));
        }
        return Promise.resolve(jsonData);
    }

    async ipLoc(ip: string) {
        const url = `https://restapi.amap.com/v3/ip?key=${this.key}&ip=${ip}`;
        const result = await global.fetch(url);
        const jsonData = await result.json();
        if (jsonData.status !== '1') {
            throw new Error(JSON.stringify(jsonData));
        }
        return Promise.resolve(jsonData);
    }

    async getDistrict(keywords:string, subdistrict:string) {
        const url = `https://restapi.amap.com/v3/config/district?keywords=${keywords}&subdistrict=${subdistrict}&key=${KEY}`;

        const result = await global.fetch(url);
            const jsonData = await result.json();
            if (jsonData.status !== '1') {
                throw new Error(JSON.stringify(jsonData));
            }
            return Promise.resolve(jsonData);
    }

    async geocode(address:string) {
        const url = `https://restapi.amap.com/v3/geocode/geo?address=${address}&key=${KEY}`;

        const result = await global.fetch(url);
        const jsonData = await result.json();
        if (jsonData.status !== '1') {
            throw new Error(JSON.stringify(jsonData));
        }
        return Promise.resolve(jsonData);
    }
}
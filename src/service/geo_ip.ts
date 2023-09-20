import Qqwry from "lib-qqwry/lib/qqwry";

const qq = new Qqwry(true, process.env.QQWRY_DATA_PATH);
qq.speed();

export type IPGeoInfo = {
    ip: string;
    country: string;
    area: string;
};


export async function locate_ips(ips: string[]): Promise<IPGeoInfo[]> {

    return await Promise.all(ips.map(locate_ip));
}

export async function locate_ip(ip: string): Promise<IPGeoInfo> {

    return new Promise((resolve) => {
        qq.speed();
        const rst = qq.searchIP(ip);
        if (rst === null) return resolve({
            ip,
            country: 'Unknown',
            area: 'Unknown'
        });

        const obj =
            {
                ip,
                country: rst.Country,
                area: rst.Area
            };

        if (!obj.area || obj.area.includes("CZ88.NET")) obj.area = "Unknown";

        resolve(obj);
    });
}
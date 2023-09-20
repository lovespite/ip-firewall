import {NextApiRequest, NextApiResponse} from "next";
import {locate_ip} from "@/service/geo_ip";
import {is_valid_ip} from "@/service/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const {
        query: {
            ip
        }
    } = req;

    if (typeof ip !== "string") return res.status(400).json({message: 'ip is required'} as any);
    if (!is_valid_ip(ip)) return res.status(400).json({message: 'ip is invalid'} as any);

    try {
        const rst = await locate_ip(ip);

        if (rst === null) return res.status(404).json({message: 'Not found'} as any);

        res.status(200).json({
            success: true,
            geo_info: rst.country + ', ' + rst.area
        });

    } catch (e) {

        console.error(e);
        return res.status(500).json({message: 'Server error'});
    }
}

import {NextApiRequest, NextApiResponse} from "next";
import {is_valid_ip} from "@/service/utils";
import {locate_ips} from "@/service/geo_ip";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== "POST") return res.status(405).json({message: 'Method not allowed'} as any);

    const ip_array = req.body;

    if (!Array.isArray(ip_array) ) return res.status(400).json({message: 'ip array is required'} as any);

    const rst = await locate_ips(ip_array.filter(is_valid_ip));

    res.status(200).json(rst);
}
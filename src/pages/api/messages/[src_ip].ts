import {NextApiRequest, NextApiResponse} from "next";
import db_connect from "@/service/io";
import Message, {Messages} from "@/models/Message";
import {locate_ip} from "@/service/geo_ip";
import {is_valid_ip} from "@/service/utils";
import {MessageResult} from "@/types/MessagePrototype";

export default async function handler(req: NextApiRequest, res: NextApiResponse<MessageResult>) {

    const {
        query: {src_ip},
    } = req;

    try {

        if (!src_ip) return res.status(400).json({message: 'src_ip is required'} as any);
        if (typeof src_ip !== "string") return res.status(400).json({message: 'src_ip is invalid'} as any);
        if (!is_valid_ip(src_ip)) return res.status(400).json({message: 'ip is invalid'} as any);

        await db_connect();
        const messages = await Message
            .findOne({src_ip})
            .lean<Messages>();

        if (!messages) return res.status(404).json({message: 'Not found'} as any);

        const geo_info = await locate_ip(src_ip);

        messages.country = geo_info?.country || 'Unknown';
        messages.area = geo_info?.area || 'Unknown';
        // @ts-ignore
        messages.key = src_ip;

        res.status(200).json({
            success: true,
            data: [messages],
            message: 'ok',
            total: 1,
        });

    } catch (e) {

        console.error(e);
        res.status(500).json({message: 'Server error'} as any);

    }
}
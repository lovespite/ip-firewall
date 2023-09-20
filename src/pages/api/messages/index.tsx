import {NextApiRequest, NextApiResponse} from "next";
import db_connect from "@/service/io";
import Message, {Messages} from "@/models/Message";
import {locate_ips} from "@/service/geo_ip";
import {geo_array_to_map} from "@/service/utils";
import {MessageResult} from "@/types/MessagePrototype";


export default async function handler(req: NextApiRequest, res: NextApiResponse<MessageResult>) {


    const {
        query: {skip, limit},
    } = req;

    try {

        await db_connect();

        const total = await Message.countDocuments();

        const messages = await Message
            .find()
            .sort({count: -1})
            .skip(Number(skip))
            .limit(Number(limit))
            .lean<Messages[]>();


        const ips = messages.map(x => x.src_ip);

        const geo_map = geo_array_to_map(await locate_ips(ips));

        for (const m of messages) {
            const geo = geo_map.get(m.src_ip);
            if (!geo) continue;
            m.country = geo.country;
            m.area = geo.area;
            // @ts-ignore
            m.key = m._id;
        }

        res.status(200).json({
            data: messages,
            total,
            success: true,
            message: `ok, ${messages.length} messages found`,
        });

    } catch (e) {

        console.error(e);
        res.status(500).json({
            success: false,
            message: 'Server error',
            data: [],
            total: 0,
        });

    }
}
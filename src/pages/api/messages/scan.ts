import {NextApiRequest, NextApiResponse} from "next";
import db_connect from "@/service/io";
import Message, {Messages} from "@/models/Message";
import {scan_log} from "@/service/scan";
import dayjs from "dayjs";
import {LogMessage} from "@/types/MessagePrototype";

export type ScanResult = {
    success: boolean;
    message: string;
    created: number;
    updated: number;
}

function group_by_ip(array: LogMessage[]) {
    const map: Map<string, LogMessage[]> = new Map();

    array.forEach((item) => {
        const collection = map.get(item.src_ip);

        if (!collection) {
            map.set(item.src_ip, [item]);
        } else {
            collection.push(item);
        }
    });

    return Array.from(map.values());
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    try {
        await db_connect();

        const messages = group_by_ip(await scan_log());

        console.log(messages.length + ' messages found');

        let updated = 0;
        let created = 0;

        await Promise.all(messages.map(async message => {

            message.sort((a, b) => Number(b.last_updated) - Number(a.last_updated)); // desc by last_updated

            const {src_ip, last_updated} = message[0];

            const data = message.map(x => x.data);

            const existing = await Message.findOne<Messages>({src_ip});

            if (existing) {

                if (Number(existing.last_updated) - Number(last_updated) >= 0) return; // 如果已经存在的数据比新的数据更新，就跳过

                existing.data = data.concat(existing.data);
                existing.last_updated = last_updated;
                existing.count += data.length;

                await existing.save();
                ++updated;
            } else {
                await Message.create({
                    src_ip,
                    last_updated,
                    data,
                });
                ++created;
            }
        }));

        res.status(200).json({
            success: true,
            message: 'ok, ' + created + ' created, ' + updated + ' updated',
            created,
            updated,
        });

    } catch (e) {

        console.error(e);
        res.status(500).json({message: 'Server error'});

    }

}
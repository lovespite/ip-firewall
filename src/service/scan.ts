import fs from 'fs';
import {LogMessage} from "@/types/MessagePrototype";
import {parse_line} from "@/service/utils";

export async function scan_log(): Promise<LogMessage[]> {

    const file = process.env.LOG_PATH!;

    const y = new Date().getFullYear();

    return new Promise((resolve, reject) => {
        fs.readFile(file, 'utf8', (err, data) => {
            if (err) reject(err);

            const lines = data.split('\n');

            const messages = lines
                .filter(line => line.includes('authentication failure'))
                .map(line => parse_line(line, y))
                .filter(Boolean);

            resolve(messages as LogMessage[]);
        });
    });
}


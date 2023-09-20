import {DetailedMessage, LogMessage} from "@/types/MessagePrototype";

const regex = /^(\w+ \d+ \d+:\d+:\d+) .* rhost=(\d+\.\d+\.\d+\.\d+)/;

 export function parse_line(line: string, year: number): LogMessage | null {

    // 使用正则表达式提取日期、时间和源 IP 地址
    const match = line.match(regex);

    // 检查是否有匹配项
    if (!match) return {
        src_ip: '[Unknown]',
        last_updated: new Date(),
        data: line,
    }

    const dateStr = match[1];

    const src_ip = match[2];

    const last_updated = new Date(dateStr);

    last_updated.setFullYear(year);

    // 返回包含日期、时间和源 IP 地址的对象
    return {
        src_ip,
        last_updated,
        data: line,
    } as LogMessage;

    // 如果没有匹配项，返回 null
}

// const DemoLine = "Sep 18 13:10:11 ecs-d74d auth: pam_unix(dovecot:auth): authentication failure; logname= uid=0 euid=0 tty=dovecot ruser=mail@lovespite.com rhost=112.199.95.199";
const regex_exact = /(\w+ \d+ \d+:\d+:\d+) (\S+) (\S+): (\S+\(\S+\)): authentication failure; logname=(\S*) uid=(\S+) euid=(\S+) tty=(\S+) ruser=(\S+) rhost=(\d+\.\d+\.\d+\.\d+)/;
//                              ^^^^^^^^^^^^^^^^^^^  ^^^   ^^^    ^^^^^^^^^                                     ^^^       ^^^        ^^^       ^^^         ^^^         ^^^^^^^^^^^^^^^^^
//                              DateTime              Mac.  Name   Source                                        LogName   UID        E-UID     TTY         R-User      R-Host
//                              [1]                   [2]   [3]    [4]                                           [5]       [6]        [7]       [8]         [9]         [10]

export function parse_line_exact(line: string): DetailedMessage {

    try {

        const [
            _,
            dateStr,
            machine,
            name,
            src,
            log_name,
            uid,
            e_uid,
            tty,
            r_user,
            src_ip
        ] = regex_exact.exec(line)!;

        const last_updated = new Date(dateStr);

        return {
            src_ip,
            last_updated,
            machine,
            src,
            log_name,
            uid,
            e_uid,
            tty,
            r_user,
            name,
            data: line,
            key: `${src_ip}-${last_updated.getTime()}`,
            date_str: dateStr,
        }

    } catch (e) {
        // console.error(e);
        return {
            src_ip: "[Unknown]",
            last_updated: new Date(),
            machine: "[Unknown]",
            src: "[Unknown]",
            log_name: "[Unknown]",
            uid: "[Unknown]",
            e_uid: "[Unknown]",
            tty: "[Unknown]",
            r_user: "[Unknown]",
            name: "[Unknown]",
            data: line,
            key: `[Unknown]-${new Date().getTime()}`,
            date_str: "[Unknown]",
        }
    }

}

const ip_tester = /^(\d{1,3}\.){3}\d{1,3}$/;

export function is_valid_ip(ip: string) {
    return ip_tester.test(ip);
}

type IPGeoInfoDataObj = {
    ip: string;
    country: string;
    area: string;
};

export function geo_array_to_map(arr: IPGeoInfoDataObj[]) {
    const map = new Map<string, IPGeoInfoDataObj>();

    for (const item of arr) {
        map.set(item.ip, item);
    }

    return map;
}
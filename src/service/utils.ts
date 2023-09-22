import {DetailedMessage, LogMessage} from "@/types/MessagePrototype";
import exp from "node:constants";

const regex = /^(\w+ \d+ \d+:\d+:\d+) .* rhost=(\d+\.\d+\.\d+\.\d+)/;

export function parse_line(line: string, year: number): LogMessage | null {

    // 使用正则表达式提取日期、时间和源 IP 地址
    const match = line.match(regex);

    // 检查是否有匹配项
    if (!match) {

        console.log("Dropped line: ", line);

        return null;

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

export function describe_date(d: any): string {
    const now = new Date();
    const date = new Date(d);
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    // 60秒以内
    if (seconds < 60) {
        return "刚刚";
    }

    // 10分钟以内
    if (minutes < 10) {
        return "几分钟前";
    }

    // 1小时以内
    if (minutes < 60) {
        return `${minutes}分钟前`;
    }

    // 当前日期和提供的日期是否是同一天
    const isSameDay = now.getDate() === date.getDate() &&
        now.getMonth() === date.getMonth() &&
        now.getFullYear() === date.getFullYear();

    if (isSameDay) {
        return `${hours}小时前`;
    }

    if (days === 1) {
        return "昨天";
    }

    if (days === 2) {
        return "前天";
    }

    if (days > 2 && days <= 7) {
        return `${days}天前`;
    }

    return toDateTimeString(date);
}

export function toDateTimeString(d: any): string {
    const date = new Date(d);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
}

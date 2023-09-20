import {Messages} from "@/models/Message";

export type LogMessage = {
    src_ip: string;
    last_updated: Date;
    data: string;
}

// const DemoLine = "Sep 18 13:10:11 ecs-d74d auth: pam_unix(dovecot:auth): authentication failure; logname= uid=0 euid=0 tty=dovecot ruser=mail@lovespite.com rhost=112.199.95.199";
export interface DetailedMessage extends LogMessage {
    machine: string;
    name: string;
    src: string;
    log_name: string;
    uid: string;
    e_uid: string;
    tty: string;
    r_user: string;
    key: string;
    date_str: string;
}

export type MessageResult = {
    data: Messages[],
    total: number,
    success: boolean,
    message: string,
}
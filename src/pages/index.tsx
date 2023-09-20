import Head from 'next/head'
import axios from 'axios'
import {useEffect, useState} from "react";
import {Messages} from "@/models/Message";
import {App, Button, Empty, Input, Space, Table, TablePaginationConfig} from "antd";
import {ScanResult} from "@/pages/api/messages/scan";
import styles from "@/styles/Home.module.css"
import {CopyTwoTone} from "@ant-design/icons";
import {FilterValue, SorterResult, TableCurrentDataSource} from "antd/es/table/interface";
import {parse_line_exact} from "@/service/utils";
import {MessageResult} from "@/types/MessagePrototype";

interface TableParams {
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue>,
    sorter: SorterResult<Messages>,
}

const defaultPagination: TablePaginationConfig = {
    current: 1,
    pageSize: 20,
    total: 0,
    position: ['bottomCenter'],
};

export default function Home() {
    const {message} = App.useApp();

    const [busy, setBusy] = useState(false);
    const [searching, setSearching] = useState(false);
    const [list, setList] = useState<Messages[]>([]);
    const [pagination, setPagination] = useState<TablePaginationConfig>(defaultPagination);

    const load = (page: number | undefined, size: number | undefined, useCache: boolean = false) => {

        if (useCache) {
            const data = localStorage.getItem('messages');
            const pg = localStorage.getItem('page');
            if (data && pg) {
                setList(JSON.parse(data));
                setPagination(JSON.parse(pg));
                return;
            }
        }

        // setList([]);
        setBusy(true);

        page = page || 1;
        size = size || 20;

        axios.get<MessageResult>('/api/messages', {
            params: {
                skip: ((page || 1) - 1) * size,
                limit: size || 20,
            }
        })
            .then(res => {

                const data = res.data.data;

                const pg = {
                    ...pagination,
                    current: page,
                    pageSize: size,
                    total: res.data.total,
                }

                setList(data);
                setPagination(pg);
                localStorage.setItem('messages', JSON.stringify(data));
                localStorage.setItem('page', JSON.stringify(pg));

                //
                // message.success(res.data.message);

            })
            .catch(e => {

                message.error(e.message);

            })
            .finally(() => setBusy(false));

    };

    const update = () => {

        setBusy(true);

        axios.get<ScanResult>('/api/messages/scan').then(res => {
            const data = res.data;

            if (data.success) {

                message.success(data.message);
                load(1, pagination.pageSize, false);

            } else {

                message.error(data.message || "Failed to update logs.");
            }

        }).catch(e => {

            message.error(e.message);

        }).finally(() => setBusy(false));

    };

    const find = (ip: string) => {

        setBusy(true);
        setSearching(true);
        axios.get<MessageResult>('/api/messages/' + ip).then(res => {
            const data = res.data;

            if (data.success) setList(data.data);
            else setList([]);

        }).catch(e => {

            setList([]);

        }).finally(() => {
            setBusy(false);
            setSearching(false);
        });
    }

    const on_change = (
        paginationConfig: TablePaginationConfig,
        filters: Record<string, FilterValue | null>,
        sorter: SorterResult<Messages> | SorterResult<Messages>[],
        extra: TableCurrentDataSource<Messages>) => {

        if (paginationConfig.pageSize !== pagination.pageSize) setList([]);

        setPagination(paginationConfig || defaultPagination);
        load(paginationConfig.current, paginationConfig.pageSize)
    }

    useEffect(() => {
        // @ts-ignore
        window["axios"] = axios;
        load(pagination.current, pagination.pageSize);
    }, []);

    return (
        <>
            <Head>
                <title>Lovespite IP-Firewall</title>
                <meta name="description" content="IP Firewall Manage"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <main>
                <Space direction={"vertical"} style={{width: "100%"}}>
                    <Space direction={"horizontal"}>
                        <Input.Search
                            disabled={busy}
                            bordered={true}
                            placeholder={"Search IP"}
                            onSearch={e => {
                                if (e.trim()) find(e.trim());
                                else load(undefined, undefined, true);
                            }}
                            allowClear
                            loading={searching}
                        />
                        <Button type={"primary"} disabled={busy} onClick={update}>Update Now</Button>
                        <Button type={"link"} disabled={busy}
                                onClick={() => load(pagination.current, pagination.pageSize)}>Refresh</Button>
                    </Space>
                    <Table
                        bordered={true}
                        size={"small"}
                        style={{}}
                        dataSource={list}
                        pagination={pagination}
                        loading={busy}
                        onChange={on_change}
                        expandable={{expandedRowRender: x => <DataSpan data={x.data}/>}}
                    >
                        <Table.Column title="IP" width={240} dataIndex="src_ip" key={"ip"}
                                      render={x => <IpSpan ip={x}/>}/>
                        <Table.Column title="Total Count" dataIndex="count" key={"count"} align={"right"}/>
                        <Table.Column title="Country" dataIndex="country" key={"country"}/>
                        <Table.Column title="IP Ownership" dataIndex="area" key={"area"}/>
                        <Table.Column title="Time" dataIndex="last_updated" key={"datetime"} render={toDateTimeString}/>

                    </Table>
                </Space>
            </main>
        </>
    )
}

function IpSpan({ip}: { ip: string }) {
    const parts = ip.split('.');
    const {message} = App.useApp();
    return (<div data-ip={ip} className={styles.ip_div}>
        <span>{parts[0]}</span>
        <b>·</b>
        <span>{parts[1]}</span>
        <b>·</b>
        <span>{parts[2]}</span>
        <b>·</b>
        <span>{parts[3]}</span>
        <a onClick={() => {
            navigator.clipboard.writeText(ip).then(() => {
                message.success('Copied to clipboard.');
            }).catch(e => {
                message.error(e.message);
            });
        }}><CopyTwoTone/></a>
    </div>);
}

function DataSpan({data}: { data: string[] }) {
    const dataSet = data.map(parse_line_exact).filter(Boolean);
    return data && data.length > 0
        ? <Table size={"small"} dataSource={dataSet} bordered={true}>
            <Table.Column title={"DateTime"} key={"datetime"} dataIndex={"date_str"} />
            <Table.Column title={"Machine"} key={"mac"} dataIndex={"machine"}/>
            <Table.Column title={"Src Name"} key={"src_name"} dataIndex={"name"}/>
            <Table.Column title={"Source"} key={"src"} dataIndex={"src"}/>
            <Table.Column title={"UID"} key={"uid"} dataIndex={"uid"}/>
            <Table.Column title={"E-UID"} key={"e_uid"} dataIndex={"e_uid"}/>
            <Table.Column title={"TTY"} key={"tty"} dataIndex={"tty"}/>
            <Table.Column title={"R-USER"} key={"r_user"} dataIndex={"r_user"}/>

        </Table>
        : <Empty/>
}

const toDateTimeString = (d: any) => {
    const date = new Date(d);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
}

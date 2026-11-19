import type { ReactElement, ReactNode } from "react";

import { Alert } from "../alert/Alert.js";
import { Button } from "../button/Button.js";
import { Page } from "../page/Page.js";
import { Paginated, type Paging } from "../paginated/Paginated.js";
import { Paper } from "../paper/Paper.js";
import { Table } from "../table/Table.js";

export interface ResourceColumn<Row> {
    header: string;
    className?: string;
    cell: (row: Row) => ReactNode;
}

export function ResourceList<Row>({
    title,
    columns,
    rows,
    idOf,
    link,
    openLabel = "Edit",
    add,
    addLabel = "Add",
    addDisabled = false,
    failure = null,
    paging,
    empty = "Nothing here yet.",
    loadingLabel = "Loading…",
    above,
    below,
}: {
    title: string;
    columns: ResourceColumn<Row>[];
    rows: Row[] | null;
    idOf: (row: Row) => string;
    link: (row: Row, label: string) => ReactElement;
    openLabel?: string;
    add?: (label: string) => ReactElement;
    addLabel?: string;
    addDisabled?: boolean;
    failure?: string | null;
    paging?: Paging;
    empty?: ReactNode;
    loadingLabel?: string;
    above?: ReactNode;
    below?: ReactNode;
}) {
    const table = (list: Row[]) => (
        <Paper>
            <Table>
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={column.header}>{column.header}</th>
                        ))}
                        <th>
                            <span className="sr-only">{openLabel}</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {list.map((row) => (
                        <tr key={idOf(row)}>
                            {columns.map((column) => (
                                <td key={column.header} className={column.className}>
                                    {column.cell(row)}
                                </td>
                            ))}
                            <td className="text-right">
                                <Button asChild variant="outline" size="sm">
                                    {link(row, openLabel)}
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Paper>
    );
    const body = () => {
        if (failure !== null) return <Alert variant="destructive">{failure}</Alert>;
        if (rows === null) return <p className="text-muted-foreground">{loadingLabel}</p>;
        const shown = rows.length === 0 ? <div className="text-muted-foreground">{empty}</div> : table(rows);
        return paging === undefined ? shown : <Paginated paging={paging}>{shown}</Paginated>;
    };
    const addAction = () => {
        if (add === undefined) return undefined;
        if (addDisabled) return <Button disabled>{addLabel}</Button>;
        return <Button asChild>{add(addLabel)}</Button>;
    };
    return (
        <Page title={title} actions={addAction()}>
            {above}
            {body()}
            {below}
        </Page>
    );
}

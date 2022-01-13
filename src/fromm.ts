import { Table } from "./table";
import Query from "./Query"
import { Q, q } from "./sql";

import { Column } from "./column"

export type From<T> =
    {
        sql: Q;
        columns: {
            [U in keyof T]: {
                [Col in keyof T[U]]: Column<Exclude<T[U][Col], undefined>>
            }
        }
    }

export function FROMM<T>(table: Table<T>): Query<From<T>> {
    const key = Object.keys(table)[0]
    const x = {
        sql: q(key),
        columns: table,
    }
    // @ts-ignore
    return new Query(x)
}

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

export type Return<T> = Query<From<T>>
import { From } from "./from.d";
import { DisjointUnion, toObj } from "./helpers";
import { Condition, Join, Q } from "./sql";
import { Table } from "./table";
import { Column, Path, path } from "./column";

export type QSql = {
    sql: Q,
    columns: { [key: string]: { [key: string]: Column<any> } }
}

type TypedQsql<Columns> = {
    sql: Q,
    columns: Columns
}

type Rename<T, To extends string> =
    {
        [U in keyof T as `${To}`]: T[U]
    }

type FromAs<T, As extends string> =
    Rename<From<T>, As>

export function replaceValueWithPath(obj: { [key: string]: { [key: string]: any } }): { [key: string]: { [key: string]: Path } } {
    return toObj(Object.entries(obj).map(([key, value]) =>
        [key, toObj(Object.entries(value).map(([colKey, _]) => [colKey, path(`${key}.${colKey}`)]))]
    ))
}

export default class Query<A extends QSql> {

    query: A;

    constructor(query: A) {
        this.query = query
    }

    JOIN = <B>(table: Table<B>, on: (ab: DisjointUnion<A["columns"], From<B>["columns"]>) => Condition): Query<TypedQsql<DisjointUnion<A["columns"], From<B>["columns"]>>> => {

        const tableName = Object.keys(table)[0]

        const union = {
            ...table,
            ...this.query.columns,
        }

        const onInput = replaceValueWithPath(union)

        // @ts-ignore
        const onResult = on(onInput)

        const join: Join = {
            table: tableName,
            on: onResult,
            as: null,
        }
        // @ts-ignore
        return new Query({ sql: { ...this.query.sql, joins: [...this.query.sql.joins, join] }, columns: union })
    }

    /*
    JOIN_AS = <B, As extends string>(table: Table<B>, as: As, on: (ab: DisjointUnion<A, FromAs<B, As>>) => Condition): Query<DisjointUnion<A, FromAs<B, As>>> => {
        // @ts-ignore
        return {}
    }
    */

    WHERE = (condition: (a: A["columns"]) => Condition): Query<A> => {
        const conditionInput = replaceValueWithPath(this.query.columns)
        const conditionResult: Condition = condition(conditionInput)
        // @ts-ignore
        return new Query({ sql: { ...this.query.sql, where: conditionResult }, columns: this.query.columns })
    }

    GROUP_BY = (pick: (a: A["columns"]) => Column<any>[]): Query<A> => {
        const pickInput = replaceValueWithPath(this.query.columns)
        const pickResult: Column<any>[] = pick(pickInput)
        // @ts-ignore
        return new Query({ sql: { ...this.query.sql, groupBy: pickResult }, columns: this.query.columns })
    }
}
import { Column } from "./column"
import { IsUniqueTuple, toObj } from "./helpers"
import Query, { QSql } from "./Query"

type SelectableColumn<A, Db> = {
    column: Column<Db>,
    name: A,
}

type SelectableColumns<T> = {
    [U in keyof T]: {
        [Col in keyof T[U]]: (T[U][Col] extends Column<infer Db> ? SelectableColumn<Col, Db> : never)
    }
}

type SelectName<Array extends any[]> =
    Array["length"] extends 0 ? [] :
    Array extends [infer First, ...infer Rest] ?
    (First extends { name: string } ? [First["name"], ...SelectName<Rest>] : never)
    : never

type CheckResult<Result extends [any, ...any[]]> =
    IsUniqueTuple<SelectName<Result>> extends true ? Result : never

export function SELECT<A extends QSql, Result extends [SelectableColumn<any, any>, ...SelectableColumn<any, any>[]]>(fields: (a: SelectableColumns<A["columns"]>) => Result, q: Query<A>): CheckResult<Result> {
    const fieldsInput = toObj(Object.entries(q.query.columns).map(([key, value]) =>
        [key, toObj(Object.entries(value).map(([colKey, column]) => [colKey, { column, name: colKey }]))]
    ))
    // @ts-ignore
    const fieldsResult = fields(fieldsInput)
    return fieldsResult
}
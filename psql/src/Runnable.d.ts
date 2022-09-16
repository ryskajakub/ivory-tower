import { Column } from "./column"
import { TsType } from "./Column"

export type ResultRow<T> =
    {
        [U in keyof T]: T[U] extends Column<infer DbType, any> ? TsType<DbType> : never
    }

export type QueryAndParams<A, HasResult> = {
    params: any[],
    query: string,
} &
(HasResult extends true ? {
    transformer: (row: any) => ResultRow<A>
} : {})

export interface Runnable<A, HasResult> {
    getQueryAndParams(): QueryAndParams<A, HasResult>
}

export type Result<Row, HasResult> = HasResult extends true ? Row[] : void
import { TsType } from "./Column"
import { Column } from "./column"

export type Ran<T> = ({
    [U in keyof T]: T[U] extends Column<infer DbType, any> ? TsType<DbType> : never
})[]
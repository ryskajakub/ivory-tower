export type Numeric = "smallint" | "integer" | "bigint"

export type Textual = "text"

export type TsType<DbType> = DbType extends Numeric ? (number | "auto") :
    DbType extends Textual ? string : never

export type Check<DbType> = TsType<DbType> extends never ? never : DbType

export type TableType<T> =
    {
        [U in keyof T]: {
            [Col in keyof T[U]]: (null extends T[U][Col] ? { nullable: true } : {}) &
            (undefined extends T[U][Col] ? { default: TsType<T[U][Col]> } : {}) &
            { type: Check<T[U][Col]> }
        }
    }
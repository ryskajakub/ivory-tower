import { Temporal, Textual, Numeric } from "./Column"
import { ExpandType } from "./Helpers"

export type DefaultType<DbType> = DbType extends Numeric ? (number | "auto") :
    DbType extends Textual ? string : never

type ColumnType<DbType> =
    DbType extends Numeric ? number :
    DbType extends Textual ? string :
    DbType extends Temporal ? Date :
    never

type UndefinedOptional<Obj> = ExpandType<{
    [Key in keyof Obj as undefined extends Obj[Key] ? Key : never]?: Obj[Key]
} & {
        [Key in keyof Obj as undefined extends Obj[Key] ? never : Key]: Obj[Key]
    }>

export type InsertTsType<DbType> = (null | undefined) extends DbType ? (null | undefined | ColumnType<DbType>) :
    null extends DbType ? (null | ColumnType<DbType>) :
    undefined extends DbType ? (undefined | ColumnType<DbType>) :
    ColumnType<DbType>

export type Check<DbType> = DefaultType<DbType> extends never ? never : DbType

export type TableType<T> =
    {
        [U in keyof T]: {
            [Col in keyof T[U]]: (null extends T[U][Col] ? { nullable: true } : {}) &
            (undefined extends T[U][Col] ? { default: DefaultType<T[U][Col]> } : {}) &
            { type: Check<T[U][Col]> }
        }
    }

export type InsertType<T> =
    UndefinedOptional<({
        [U in keyof T as "first"]: {
            [Col in keyof T[U]]: InsertTsType<T[U][Col]>
        }
    })["first"]>
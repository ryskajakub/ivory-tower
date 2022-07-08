import { Temporal, Textual, Numeric, TsType, Integer } from "./Column"
import { ExpandType, IsUniqueTuple } from "./Helpers"
import { Insert } from "./insert"

export interface Serial { 
    type: "serial"
}

type T1 = 3 extends Serial ? true : false

export type DefaultType<DbType> = DbType extends Integer ? (string | Serial) : string

type UndefinedOptional<Obj> = ExpandType<{
    [Key in keyof Obj as undefined extends Obj[Key] ? Key : never]?: Obj[Key]
} & {
        [Key in keyof Obj as undefined extends Obj[Key] ? never : Key]: Obj[Key]
    }>

export type InsertTsType<DbType> = (null | undefined) extends DbType ? (null | undefined | TsType<DbType>) :
    null extends DbType ? (null | TsType<DbType>) :
    undefined extends DbType ? (undefined | TsType<DbType>) :
    TsType<DbType>

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

type MkTuple<Keys extends any[], T extends Record<string, any>> =
    Keys["length"] extends 0 ? [] :
    (
        Keys extends [infer First extends string, ...infer Rest extends string[]] ?
        (
            [T[First], ...MkTuple<Rest, T>]
        )
        : never
    )

export type MutableArray<T extends readonly any[]> =
    T extends readonly [infer First, ...infer Rest] ? [First, ...Rest] : never

type TT = MutableArray<readonly ("abc"| "def")[]>

export type InsertKeys<Keys extends readonly (keyof T)[], T extends Record<string, any>> = 
    IsUniqueTuple<MutableArray<Keys>> extends true ? 
    (
        AllUsed<MutableArray<Keys>, T> extends true ?
        (
            Insert<MkTuple<MutableArray<Keys>, T>>
        )
        : never
    ) : never

type Rec = Readonly<{
    abc: number,
    def: string,
    xyz: boolean,
}>

type T = InsertKeys<readonly ["abc", "xyz"], Rec>

type F = { xyz: "xxx" }

type AllUsedWithUnion<KeysUnion, T extends Record<string, any>> = 
    {} extends {
        [K in keyof T as undefined extends T[K] ? never : ( K extends KeysUnion ? never : K )]: T[K]
    } ? true : false

type TupleToUnion<T> =
    T extends []
      ? never
      : (T extends [infer First, ...infer Rest]
            ? First | TupleToUnion<Rest>
            : never);

type AllUsed<Keys, T extends Record<string, any>> = AllUsedWithUnion<TupleToUnion<Keys>, T>

type TTTTT = AllUsed<["wtf", "lol", "mmm"], { abc: number | undefined, mmm: 333, wtf: 555 , bla: 666}>

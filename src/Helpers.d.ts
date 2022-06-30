import { Aggregable, Aggregated, Selectable } from "./Column"
import { NamedColumn, Column } from "./column"
import { OrderingElement } from "./orderBy"

type Disjoint<A, B> = Extract<A, B> extends never ? true : false

export type ExpandType<T> = {} & {
    [K in keyof T]: T[K]
}

export type DisjointUnion<Obj1, Obj2> = Obj1 extends Record<string, any> ? (
    Obj2 extends Record<string, any> ? (
        Disjoint<keyof Obj1, keyof Obj2> extends true ? (Obj1 & Obj2) : never
    ) : never
) : never

export type AnyIntersection<A, B> = Extract<A, B> extends never ? false : true

export type IfAnyIntersection<A, B, IfTrue> = AnyIntersection<A, B> extends never ? never : IfTrue

type BNotContainsA<A, B extends any[]> = B["length"] extends 0 ?
    true :
    B extends [infer First, ...infer Rest] ?
    (A extends First ? false : BNotContainsA<A, Rest>)
    : never

export type IsUniqueTuple<A extends any[]> =
    A["length"] extends 0 ? true :
    A extends [infer First, ...infer Rest] ?
    (BNotContainsA<First, Rest> extends true ? IsUniqueTuple<Rest> : false)
    : never

export type UniqueNames<NCs extends NamedColumn<any, any, any>[]> =
    IsUniqueTuple<NamedColumnToString<NCs>> extends true ? true : false

export type AllSelectableOrAggregable<NCs extends NamedColumn<any, any, any>[]> =
    NCs extends [NamedColumn<any, Aggregated, any>, ...NamedColumn<any, Aggregated, any>[]] ? true :
    NCs extends [NamedColumn<any, Selectable, any>, ...NamedColumn<any, Selectable, any>[]] ? true :
    false

export type NamedFroms<T> = {
    [U in keyof T]: {
        [Col in keyof T[U]]: T[U][Col] extends Column<infer DbType, infer State> ?
        Col extends string ?
        U extends string ?
        NamedColumn<DbType, State, `${U}.${Col}`> : never : never : never
    }
}

export type NamedColumnToString<NCs extends NamedColumn<any, any, any>[]> =
    NCs["length"] extends 0 ? [] : (NCs extends [infer NC, ...infer Rest] ?
        Rest extends NamedColumn<any, any, any>[] ?
        NC extends NamedColumn<any, any, infer Name> ? [Name, ...NamedColumnToString<Rest>] : never : never : never)

export type GroupByResult<T, V extends NamedColumn<any, any, any>[]> =
    {
        [U in keyof T]: {
            [Col in keyof T[U]]: T[U][Col] extends NamedColumn<infer DbType, any, infer Name> ?
            Name extends `${infer Table}.${infer Col}` ?
            (BNotContainsA<Name, NamedColumnToString<V>> extends true ? NamedColumn<DbType, Aggregable, Col> : NamedColumn<DbType, Aggregated, Col>)
            : never
            : never
        }
    }

export type MakeObj<T extends any[], Acc> = 
    T["length"] extends 0 ? Acc : 
    T extends [infer Col, ...infer Rest] ? 
        Col extends NamedColumn<infer DbType, infer State, infer Name> ? (MakeObj<Rest, Acc & {
            [K in Name]: Column<DbType, State>
        }>) : never : never

export type Select<T extends NamedColumn<any, any, any>[]> = 
    AllSelectableOrAggregable<T> extends true ? (UniqueNames<T> extends true ? ExpandType<MakeObj<T, {}>> : never) : never

type NamedColumns = [NamedColumn<any, any, "lol.lll">, NamedColumn<any, any, "p.xxx">]

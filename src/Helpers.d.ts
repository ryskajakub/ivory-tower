import { Aggregable, Aggregated, Selectable } from "./Column"
import { NamedColumn, Column } from "./column"

type Disjoint<A, B> = Extract<A, B> extends never ? true : false

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

/*
type All<ExpectedState, NCs extends NamedColumn<any, any, any>[]> =
NCs["length"] extends 0 ? true : (NCs extends [infer X, ...infer Xs] ?
    (X extends NamedColumn<any, infer State, any> ? (
        State extends ExpectedState ?
        (Xs extends NamedColumn<any, any, any>[] ?
            All<ExpectedState, Xs> : never) : false)
        : never)
    : never)

export type AllSelectableOrAggregable<NCs extends NamedColumn<any, any, any>[]> =
NCs["length"] extends 1 ? true : NCs extends [infer X, ...infer Xs] ? X extends
NamedColumn<any, infer ExpectedState, any> ? ( Xs extends NamedColumn<any, any, any>[], All<ExpectedState, Xs>) : never : never
*/

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

export type Select<T extends NamedColumn<any, any, any>[]> = 
    AllSelectableOrAggregable<T> extends true ? (UniqueNames<T> extends true ? T : never) : never

type NamedColumns = [NamedColumn<any, any, "lol.lll">, NamedColumn<any, any, "p.xxx">]

type NCCC = NamedColumnToString<NamedColumns>

type GGG = GroupByResult<{ a1: { c1: NamedColumn<any, any, "p.xxx">, c2: NamedColumn<any, any, "p.yyy"> } }, NamedColumns>

type XXX = AllSelectableOrAggregable<[NamedColumn<any, "selectable", "lol">, NamedColumn<any, "aggregated", "lol">]>

type T = "agg" | "lol"

type X = T extends "agg" ? true : false
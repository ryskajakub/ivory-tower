import { Selectable } from "./Column"
import { Column, NamedColumn } from "./column"
import { From } from "./from"
import { SubQuery } from "./orderBy";
import { Table } from "./table";

export type FromTableOrQuery<T> =
    T extends Table<infer TableType> ? FromTable<TableType> : (
        T extends SubQuery<infer Name, infer Columns> ? (
            Name extends string ?
            FromQuery<Name, Columns>
            : true
        )
        : ""
    )

export type MakeObj<T extends any[], Acc> =
    T["length"] extends 0 ? Acc :
    T extends [infer Col, ...infer Rest] ?
    Col extends NamedColumn<infer DbType, infer Type, infer Name> ? (MakeObj<Rest, Acc & {
        [K in Name]: Column<DbType, Type>
    }>) : never : never

export type FromQuery<Name extends string, Columns> =
    {
        [N in Name]: Columns
    }

export type FromTable<T extends { [key1: string]: { [key2: string]: { type: any } } }> =
    {
        [U in keyof T]: {
            [Col in keyof T[U]]: Column<Exclude<T[U][Col]["type"], undefined>, Selectable>
        }
    }

export type FromTableAs<T extends { [key1: string]: { [key2: string]: { type: any } } }, As extends string> =
    {
        [U in keyof T as As]: {
            [Col in keyof T[U]]: Column<Exclude<T[U][Col]["type"], undefined>, Selectable>
        }
    }

export type RenameFrom<T extends FromTable<any>, As extends string> =
    T extends FromTable<infer U> ?
    FromTableAs<U, As>
    : never

export type MakeSelectable<T extends FromTable<any>> =
    {
        [U in keyof T]: {
            [Col in keyof T[U]]:
            Col extends string ?
            T[U][Col] extends Column<infer DbType, infer State> ?
            NamedColumn<DbType, State, `${Col}`> : never : never
        }
    }

export type SelectablePreGroup<From1 extends From<any, any>> =
    From1 extends From<infer T, infer U> ? MakeSelectable<T & U> : never
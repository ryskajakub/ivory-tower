import { Selectable } from "./Column"
import { Column, NamedColumn } from "./column"
import { From } from "./from"
import { JoinPhase, JoinPhaseAs } from "./joinPhase";
import { SubQuery } from "./orderBy";
import { Table } from "./table";

export type FromTableOrQuery<T> =
    T extends Table<infer TableType> ? FromTable<TableType> : (
        T extends SubQuery<infer Name, infer Columns> ? (
            Name extends string ?
            FromQuery<Name, Columns>
            : never
        )
        : never
    )

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

export type JoinTableOrQuery<T, U, TOrQ> =
    TOrQ extends Table<infer TD> ?
    (T extends FromTable<any> ?
        U extends FromTable<any> ?
        JoinPhaseAs<T, U, FromTable<TD>> : never : never) :
    (
        TOrQ extends SubQuery<infer Name, infer Columns> ?
        Name extends string ?
        JoinPhase<T, U, FromQuery<Name, Columns>>
        : never
        : never
    )
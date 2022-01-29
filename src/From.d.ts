import { DbType, Selectable } from "./Column"
import { Column, NamedColumn } from "./column"
import { From } from "./from"
import { JoinPhase, JoinPhaseAs } from "./joinPhase";
import { FinalOrderingElement, SubQuery } from "./orderBy";
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

export type Nullify<T> =
    {
        [U in keyof T]: {
            [Col in keyof T[U]]: T[U][Col] extends Column<infer DbType, infer State> ?
            Column<DbType | null, State> : never
        }
    }

export type FromQuery<Name extends string, Columns> =
    {
        [N in Name]: Columns
    }

export type FromTable<T> =
    {
        [U in keyof T]: {
            [Col in keyof T[U]]: Column<Exclude<T[U][Col], undefined>, Selectable>
        }
    }

export type FromTableAs<T, As extends string> =
    {
        [U in keyof T as As]: T[U]
    }

export type RenameFrom<T, As extends string> =
    FromTableAs<T, As>

export type MakeSelectable<T> =
    {
        [U in keyof T]: {
            [Col in keyof T[U]]:
            Col extends string ?
            T[U][Col] extends Column<infer DbType, infer State> ?
            NamedColumn<DbType, State, `${Col}`> : never : never
        }
    }

export type SelectablePreGroup<From1 extends From<any, any, any>> =
    From1 extends From<infer T, infer U, any> ? MakeSelectable<T & U> : never

export type JoinTableOrQuery<T, U, TOrQ, IsLeftJoin, Lateral extends boolean> =
    TOrQ extends Table<infer TD> ?
    (T extends FromTable<any> ?
        U extends FromTable<any> ?
        JoinPhaseAs<T, U, IsLeftJoin extends true ? Nullify<FromTable<TD>> : FromTable<TD>, Lateral> : never : never) :
    (
        TOrQ extends SubQuery<infer Name, infer Columns> ?
        Name extends string ?
        JoinPhase<T, U, IsLeftJoin extends true ? Nullify<FromQuery<Name, Columns>> : FromQuery<Name, Columns>, Lateral>
        : never
        : never
    )

export type On<PreviousFrom, CurrentFrom, CurrentJoin, Lateral extends boolean> =
    Lateral extends true ?
    DisjointUnion<PreviousFrom, DisjointUnion<CurrentFrom, CurrentJoin>> :
    DisjointUnion<CurrentFrom, CurrentJoin> 

export type JoinType = "left" | "inner"

export type MakeOrderingElements<T> =
    {
        [Col in keyof T]: FinalOrderingElement
    }
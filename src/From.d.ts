import { Selectable } from "./Column"
import { Column, NamedColumn } from "./column"
import { From } from "./from"

export type FromTable<T extends { [key1: string]: { [key2:string] : { type: any } } }> =
    {
        [U in keyof T]: {
            [Col in keyof T[U]]: Column<Exclude<T[U][Col]["type"], undefined> , Selectable>
        }
    }

export type FromTableAs<T extends { [key1: string]: { [key2:string] : { type: any } } }, As extends string> =
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
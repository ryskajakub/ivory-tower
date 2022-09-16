import { NamedColumn, Column } from "./column"
import { TsDbTypesComparable } from "./Expression"
import { IsOneElementObject } from "./Helpers"
import { Query } from "./orderBy"

export type MapColumn<C, DbType, State extends ColumnState> =
    C extends NamedColumn<any, any, infer Name> ? NamedColumn<DbType, State, Name>
        : Column<DbType, State>

export type Aggregable = "aggregable"

export type Aggregated = "aggregated"

export type Selectable = "selectable"

export type SingleState = Aggregated | Selectable

export type ColumnState = Aggregable | SingleState

export type Parametrized = true | false

export type Integer = "smallint" | "integer" | "bigint"

export type Float = "real" | "double" | "numeric"

export type Numeric = Integer | Float

export type Text = "text"

export type DbDate = "date"

export type Time = "time"

export type Timestamp = "timestamp"

export type Boolean = "boolean"

export type Temporal = DbDate | Time | Timestamp

export type Textual = Text

export type Interval = "interval"

export type Money = "money"

export type All = Boolean | Numeric | Textual | Temporal | Interval | Money

type TsType<Db> = Db extends Numeric ? number :
    Db extends Temporal ? Date :
    Db extends Textual ? string :
    Db

type DbType<Ts> = Ts extends number ? "smallint" | "integer" :
    Ts extends string ? "text" :
    never

type ColumnTypesComparable<A, B> = A | B extends Boolean | null ? true : 
    A | B extends Numeric | null ? true :
    A | B extends Textual | null ? true :
    A | B extends Temporal | null ? true :
    A | B extends Interval | null ? true :
    A | B extends Money | null ? true : false

export type ColumnDirection = "default" | "ASC" | "DESC"

export type InResult<T, Op1ColumnType, Op1State extends ColumnState> = 
    T extends Query<infer Cols> ? (
        IsOneElementObject<Cols> extends true ? (Cols[keyof Cols] extends Column<infer Op2ColumnType, any> ? (
            ColumnTypesComparable<Op1ColumnType, Op2ColumnType> extends true ? Column<Boolean, Op1State> : never
        ) : never) : never
    ) : (
        T extends Array<infer TsType> ? 
        (
            TsDbTypesComparable<TsType, Op1ColumnType> extends true ? Column<Boolean, Op1State> : never
        ) : (
            T extends infer TsType ? 
            TsDbTypesComparable<TsType, Op1ColumnType> extends true ? Column<Boolean, Op1State> : never
            : never
        )
    )

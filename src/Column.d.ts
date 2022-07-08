import { NamedColumn, Column } from "./column"

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
    never

type DbType<Ts> = Ts extends number ? "smallint" | "integer" :
    Ts extends string ? "text" :
    never

export type ColumnDirection = "default" | "ASC" | "DESC"
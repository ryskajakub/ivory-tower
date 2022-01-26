import { NamedColumn, Column } from "./column"

export type Literal = {
    type: "literal",
    value: any
}

export type Path = {
    type: "path",
    value: string,
}

export type ColumnValue = Literal | Path

export type MapColumn<C, DbType, State extends ColumnState> =
    C extends NamedColumn<any, any, infer Name> ? NamedColumn<DbType, State, Name>
        : Column<DbType, State>

export type Aggregable = "aggregable"

export type Aggregated = "aggregated"

export type Selectable = "selectable"

export type SingleState = Aggregated | Selectable

export type ColumnState = Aggregable | SingleState

export type Parametrized = true | false

export type Numeric = "smallint" | "integer"

export type Text = "text"

export type Textual = Text

type TsType<Db> = Db extends "smallint" ? number :
    Db extends "integer" ? number :
    Db extends "text" ? string :
    never

type DbType<Ts> = Ts extends number ? "smallint" | "integer" :
    Ts extends string ? "text" :
    never

export type ColumnDirection = "default" | "ASC" | "DESC"
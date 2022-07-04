import { ColumnDirection, SingleState } from "./Column"
import { Column } from "./column"
import { JoinType } from "./From"

export type Join = Readonly<{
    tableName: string,
    on: SqlExpression,
    as: string | null,
    type: JoinType,
}>

export type FromItem = Readonly<{
    from: string | SelectQuery,
    joins: readonly Join[],
}>

export type Field = Readonly<{
    expression: string,
    as: null | string
}>

export type Order = {
    field: string,
    direction: ColumnDirection,
}

export type SelectQuery = Readonly<{
    froms: readonly FromItem[],
    where: SqlExpression | null,
    groupBy: readonly string[],
    fields: readonly Field[],
    order: readonly Order[]
    limit: number | null,
    offset: number | null,
    as: string | null, 
}>

export type Operator = "eq" | "gt" | "lt" | "gte" | "lte" | "and" | "or"

export type Path = {
    type: "path",
    value: string,
}

export type Literal = {
    type: "literal",
    value: any
}

export type Negation = {
    type: "negation",
    arg: SqlExpression,
}

export type SqlExpression = Path | Literal | BinaryOperation | Negation

export type BinaryOperation = {
    type: "binary",
    operator: Operator,
    arg1: SqlExpression,
    arg2: SqlExpression,
}

export type Ordering = {
    field: Column<any, any>,
    type: "ASC" | "DESC"
}
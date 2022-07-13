import { ColumnDirection, SingleState } from "./Column"
import { Column } from "./column"
import { JoinType } from "./From"

export type JoinTable = {
    type: "JoinTable",
    tableName: string,
    as: string | null
}

export type JoinQuery = {
    type: "JoinQuery",
    query: SelectQuery,
}

export type JoinKind = JoinTable | JoinQuery

export type Join = Readonly<{
    kind: JoinKind,
    on: SqlExpression,
    type: JoinType,
}>

export type FromItem = Readonly<{
    from: string | SelectQuery,
    joins: readonly Join[],
}>

export type Field = Readonly<{
    expression: SqlExpression,
    as: null | string
}>

export type Order = {
    field: string,
    direction: ColumnDirection,
}

export type SelectQuery = Readonly<{
    froms: readonly FromItem[],
    where: SqlExpression | null,
    groupBy: readonly SqlExpression[],
    fields: readonly Field[],
    order: readonly Order[]
    limit: number | null,
    offset: number | null,
    as: string | null, 
}>

export type FunctionName = string

export type Operator = "eq" | "gt" | "lt" | "gte" | "lte" | "and" | "or"

export type Path = {
    type: "path",
    value: string,
}

export type Literal = {
    type: "literal",
    value: any,
    dbType: string | null,
}

export type Negation = {
    type: "negation",
    arg: SqlExpression,
}

export type SqlFunction = {
    type: "function",
    name: FunctionName,
    args: SqlExpression[],
}

export type AnyFormFunction = {
    type: "anyFormFunction",
    print: (args: SqlExpression[], printSqlExpression: ((e: SqlExpression) => string)) => string,
    args: SqlExpression[],
}

export type SqlExpression = Path | Literal | BinaryOperation | Negation | SqlFunction | AnyFormFunction

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
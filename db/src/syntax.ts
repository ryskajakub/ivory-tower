import { TupleToUnion } from "../../util/src/types"

export type ColumnDirection = "default" | "ASC" | "DESC"

// export type JoinType = "left" | "inner" | "right" | "full"
export type JoinType = "inner"

export type Using = {
    type: "using",
    joinColumns: string[],
}

export type On = {
    type: "on",
    expression: SqlExpression,
}

export type Clause = Using | On

export type ClauseJoin = {
    kind: "clause",
    type: JoinType,
    clause: On,
    as: string | null,
}

export type Natural = {
    kind: "natural",
    type: JoinType
}

export type Cross = { type: "cross" } 

export type JoinKind = ClauseJoin | Natural | Cross

export const CharOperators = ["=", ">=", "<>", "<=", ">", "<"] as const;

export type CharOperator = TupleToUnion<typeof CharOperators>
export type WordOperator = "AND" | "OR" | "IN"
export type Operator = CharOperator | WordOperator

export type FromTable = {
    type: "JoinTable",
    tableName: string,
    as: string | null
}

export type FromQuery = {
    type: "JoinQuery",
    query: SelectQuery | SelectQuery[],
}

export type FromSource = FromTable | FromQuery

export type JoinSyntax = Readonly<{
    source: FromSource,
    kind: ClauseJoin,
}>

export type FromItem = Readonly<{
    from: FromSource,
    joins: readonly JoinSyntax[],
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
    offset: number | null
}>

export function selectQuery(obj: Partial<SelectQuery>) {
    const q: SelectQuery = {
        froms: [],
        where: null,
        groupBy: [],
        fields: [],
        order: [],
        limit: null,
        offset: null,
        ...obj
    }
    return q
}

export type FunctionName = string

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

export type QueryExpression = {
    type: "queryExpression",
    query: SelectQuery,
}

export type SqlExpression = Path | Literal | BinaryOperation | Negation | SqlFunction | AnyFormFunction | QueryExpression

export type BinaryOperation = {
    type: "binary",
    operator: Operator,
    arg1: SqlExpression,
    arg2: SqlExpression,
}

export type Ordering = {
    field: string,
    type: "ASC" | "DESC"
}

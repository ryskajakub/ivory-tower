import { ColumnDirection, SingleState } from "./Column"
import { Column } from "./column"
import { JoinType } from "./From"

export type Join = Readonly<{
    tableName: string,
    on: Condition,
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
    where: Condition | null,
    groupBy: readonly string[],
    fields: readonly Field[],
    order: readonly Order[]
    limit: number | null,
    offset: number | null,
    as: string | null, 
}>

export type Eq = {
    type: "eq"
    arg1: Column<any, SingleState>,
    arg2: Column<any, SingleState>,
}

export type Gt = {
    type: "gt"
    arg1: Column<any, SingleState>,
    arg2: Column<any, SingleState>,
}

export type Condition = Eq | Gt

export type Ordering = {
    field: Column<any, any>,
    type: "ASC" | "DESC"
}
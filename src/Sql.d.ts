import { SingleState } from "./Column"
import { Column } from "./column"

export type Join = Readonly<{
    tableName: string,
    on: Condition,
    as: string | null,
}>

export type FromItem = Readonly<{
    tableName: string,
    joins: readonly Join[],
}>

export type PreSelect = Readonly<{
    froms: readonly FromItem[],
    where: Condition | null,
    groupBy: readonly string[],
}>

export type Eq = {
    type: "eq"
    arg1: Column<any, SingleState>,
    arg2: Column<any, SingleState>,
}

export type Condition = Eq

export type Ordering = {
    field: Column<any, any>,
    type: "ASC" | "DESC"
}
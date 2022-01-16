import { Column } from "./Column"

export type Join = Readonly<{
    tableName: string,
    on: Condition,
}>

export type FromItem = Readonly<{
    tableName: string,
    joins: Join[],
}>

export type Query = Readonly<{
    from: FromItem[],
    where: Condition | null,
}>

export type Eq = {
    type: "eq"
    arg1: Column<any>,
    arg2: Column<any>,
}

export type Condition = Eq
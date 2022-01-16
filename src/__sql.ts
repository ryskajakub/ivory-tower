// import { Column } from "./column"
// import { IfAnyIntersection } from "./helpers"

// export type Join = {
//     table: string,
//     on: Condition,
//     as: string | null,
// }

// export type Q = {
//     from: string,
//     joins: Join[],
//     where: Condition | null,
//     groupBy: Column<any>[],
// }

// export function q(table: string): Q {
//     return {
//         from: table,
//         joins: [],
//         where: null,
//         groupBy: [],
//     }
// }

// export type Condition = Eq

// export type Eq = {
//     type: "eq"
//     arg1: Column<any>,
//     arg2: Column<any>,
// }

// export function eq<A, B>(arg1: Column<A>, arg2: Column<B>): IfAnyIntersection<A, B, Eq> {
//     // @ts-ignore
//     return {
//         type: "eq",
//         arg1,
//         arg2,
//     }
// }

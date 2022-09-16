import { Column } from "../src/column";
import { Boolean, InResult } from "../src/Column";

type T1 = InResult<number[], "smallint", "selectable">
type T2 = InResult<number[], "text", "selectable">
type T3 = InResult<number[], "smallint", "aggregated">

// @ts-ignore
const booleanColumn: Column<Boolean, "selectable"> = null
// @ts-ignore
const booleanColumnAgg: Column<Boolean, "aggregated"> = null

// @ts-ignore
const funNever: (a: never) => never = null
type F<T> = (a: T) => any

const t1: T1 = booleanColumn
const t2: F<T2> = funNever
const t3: T3 = booleanColumnAgg
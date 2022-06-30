import { Aggregable, Numeric, Temporal } from "./Column";

import { Column } from "./column"

export type MaxType = Numeric | Text | Temporal

export type Max<T> = 
    T extends MaxType ? T : never

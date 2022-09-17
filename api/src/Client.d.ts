import { Endpoint } from "./api";

export type Objectify<Paths extends Endpoint<any, any>[]> =
    Paths["length"] extends 0 ? {} :
    Paths extends [infer Elem, ...infer Rest] ? { [] }

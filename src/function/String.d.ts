import { Column } from "../column";
import { ColumnState, Text } from "../Column";

type SubstringFor<T extends readonly any[], State extends ColumnState, U> =
    T extends readonly["FOR", number] ? Column<U, State> : unknown

export type SubstringResult<T extends readonly any[]> =
    T extends readonly[Column<infer T, infer State>, ...infer Rest] ?
        ( [T] extends [Text | null] ?
        (
            Rest extends readonly["FROM", number, ...infer Rest2] ? (
                Rest2["length"] extends 0 ? Column<T, State> : SubstringFor<Rest2, State, T> 
            ) : 
            (
                SubstringFor<Rest, State, T>
            )
        ) 
        : unknown
        )
    : 5

type TTT = import("./String").SubstringResult<readonly [Column<Text | null, "selectable">, "FROM", 3, "FOR", 2]>
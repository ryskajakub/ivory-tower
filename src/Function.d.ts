import { ColumnState, Selectable, SingleState, TsType } from "./Column";
import { Column } from "./column";
import { ExpandType, MakeObj } from "./Helpers";

export type JsonBuildObject<A extends readonly any[], Acc extends {} = {}, State extends ColumnState = "selectable"> =
    A["length"] extends 0 ? Column<ExpandType<Acc>, State> : (
        A["length"] extends 1 ? never : (
            A extends readonly [infer First extends string, infer Second, ...infer Rest] ? (
                Second extends Column<infer DbType, infer SecondElementState> ?
                    JsonBuildObject<Rest, Acc & {
                        [K in First]: TsType<DbType>
                    }, SecondElementState extends Selectable ? State : (
                        State extends Selectable ? SecondElementState : (
                            State extends SecondElementState ? State : never
                        )
                    )>
                : never
            ) : never
        )
    )

// type TTT = JsonBuildObject<readonly ["name", Column<"smallint", "selectable">, "age", Column<"text", "aggregable">]>
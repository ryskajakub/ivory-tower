import { TsType } from "./Column";
import { Column } from "./column";
import { ExpandType, MakeObj } from "./Helpers";

export type JsonBuildObject<A extends any[]> = 
    A["length"] extends 0 ? {} : (
        A["length"] extends 1 ? never : (
            A extends [infer First extends string, infer Second , ...infer Rest] ? (
                Second extends Column<infer DbType, any> ?
                ExpandType<{
                    [K in First]: TsType<DbType>
                } & JsonBuildObject<Rest>>
                : never
            ) : never
        )
    )

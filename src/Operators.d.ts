import { Aggregated, TsType } from "./Column";
import { Column } from "./column";
import { IfAnyIntersection } from "./Helpers";

type MixedTsDbBinOp<Ts, DbType, Op> =
    Ts extends TsType<DbType> ? Op : unknown

export type BoolOp<Arg1, Arg2, Op> =
    Arg1 extends Column<infer Arg1Type, any> ? 
        (Arg2 extends Column<infer Arg2Type, any> ?
            IfAnyIntersection<Arg1Type, Arg2Type, Op, unknown> : 
            MixedTsDbBinOp<Arg2, Arg1Type, Op>
        )
    : ( Arg2 extends Column<infer Arg2Type, any> ?
        MixedTsDbBinOp<Arg1, Arg2Type, Op> :
        IfAnyIntersection<Arg1, Arg2, Op, unknown>
    )
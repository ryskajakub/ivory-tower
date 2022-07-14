import { Aggregated, Boolean, ColumnState, SingleState, TsType } from "./Column";
import { Column } from "./column";
import { IfAnyIntersection } from "./Helpers";

type MixedTsDbBinOp<Ts, DbType, Op> =
    Ts extends TsType<DbType> ? Op : unknown

type Result<State1, State2 > =
    State1 extends "aggregable" ? never :
    State2 extends "aggregable" ? never: 
    State1 extends "aggregated" ? "aggregated": 
        State2 extends "aggregated" ? "aggregated" : "selectable"

export type BoolOp<Arg1, Arg2> =
    Arg1 extends Column<infer Arg1Type, infer Arg1State> ? 
        (Arg2 extends Column<infer Arg2Type, infer Arg2State> ?
            IfAnyIntersection<Arg1Type, Arg2Type, Column<Boolean, Result<Arg1State, Arg2State>>, unknown> : 
            MixedTsDbBinOp<Arg2, Arg1Type, Column<Boolean, Arg1State>>
        )
    : ( Arg2 extends Column<infer Arg2Type, infer Arg2State> ?
        MixedTsDbBinOp<Arg1, Arg2Type, Column<Boolean, Arg2State>> :
        IfAnyIntersection<Arg1, Arg2, Column<Boolean, "selectable">, unknown>
    )

export type BoolOpFlat<Arg1Type, Arg1State extends ColumnState, Arg2Type, Arg2State extends ColumnState> = BoolOp<Column<Arg1Type, Arg1State>, Column<Arg2Type, Arg2State>>

export type Op<DbType, State extends ColumnState, Operand> =
    Operand extends (TsType<DbType> | null) ? Column<"boolean", State> : Operand extends Column<infer DbType, infer State2> ? 
        Column<"boolean", State>
    : never
import { HKT } from "../../util/src/helpers";
import { DisjointUnion } from "../../util/src/types";
import { Expression } from "./column";
import { afterAs, From } from "./from";
import { FromSource, JoinSyntax, SelectQuery } from "./syntax";
import { AnyFrame } from "./table";

export type On<From, Join> = DisjointUnion<From, Join> 

interface AfterJoinAs extends HKT<{}> {
    readonly type: Omit<Join<{}, this["B"]>, "AS">
}

export class Join<fromFrames extends AnyFrame, joinFrame extends AnyFrame> {
    constructor (
        public sql: SelectQuery,
        public source: FromSource,
        public framesMap: fromFrames,
        public joinFrame: joinFrame,
    ) {}

    ON = (f: (q: On<fromFrames, joinFrame>) => Expression<"boolean">): Omit<From<DisjointUnion<fromFrames, joinFrame>, "AS">, "AS"> => {
        
        // @ts-ignore
        const union = {
            ...this.framesMap,
            ...this.joinFrame,
        }

        // @ts-ignore
        const onResult = f(unionAny)

        const joinSql: JoinSyntax = {
            source: this.source,
            kind: {
                type: "inner",
                kind: "clause",
                as: null,
                clause: {
                    type: "on",
                    // @ts-ignore
                    expression: onResult.sql
                }
            } 
        }


        const lastFrom = this.sql.froms[this.sql.froms.length - 1]
        const lastFromWithJoin = {
            ...lastFrom,
            joins: [...lastFrom.joins, joinSql]
        }
        const newSql: SelectQuery = {
            ...this.sql,
            froms: [...this.sql.froms.slice(-1), lastFromWithJoin] 
        }

        // @ts-ignore
        return new From(newSql, union)
    }

    AS = <name extends string>(name: name): afterAs<joinFrame, fromFrames, name, AfterJoinAs> => {

        const aliasedTable: AnyFrame = {
            ...this.joinFrame,
            name: name
        }

        // @ts-ignore
        return new Join(this.sql, this.source, this.framesMap, aliasedTable)
    }

}

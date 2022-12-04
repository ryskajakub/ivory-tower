import { DisjointUnion, Error, ExpandType, RenameSingleKeyObject as renameSingleKeyObject } from "../../util/src/types"
import { FromTable, selectQuery, SelectQuery } from "./syntax"
import { AnyFrame } from "./table"
import { HKT, Kind, TupleToUnion } from "../../util/src/helpers"
import { Join } from "./join"

const keys = ["CROSS_JOIN", "JOIN", "AS", "GROUP_BY", "HAVING", "UNION"] as const

type FromKeys = TupleToUnion<typeof keys>

export type PossibleGroupByItems<$FramesMap extends Record<string, Record<string, any>>> = {
    [K in keyof $FramesMap]: {
        [L in keyof $FramesMap[K]]: K extends string ? (L extends string ? `${K}.${L}` : never) : never
    }[keyof $FramesMap[K]] 
}[keyof $FramesMap][]

export type afterJoin<currentFrame extends {}, frames extends {}, otherFrame extends {}> = 
    DisjointUnion<currentFrame & frames, otherFrame> extends Error<any> ?
        Omit<From<otherFrame, currentFrame & frames>, Exclude<FromKeys, "AS">> :
        From<otherFrame, currentFrame & frames, never>

export type afterAs<currentFrame, frames, name extends string, withResult extends HKT> =
    DisjointUnion<renameSingleKeyObject<currentFrame, name>, frames> extends Error<infer E> ? 
    Error<[`Failed to rename the joined item to '${name}'`, ...E]> :
    Kind<withResult, DisjointUnion<renameSingleKeyObject<currentFrame, name>, frames>>

interface AfterFromAs extends HKT<{}> {
    readonly type: Omit<From<{}, this["B"]>, "AS" | "HAVING">
}

export class From<currentFrame extends {}, frames extends {}, OmittedMethods extends string = never> {
    constructor(
        public sql: SelectQuery,
        public currentFrame: currentFrame,
        public frames: frames,
    ) { }

    CROSS_JOIN = <joinFrame extends AnyFrame>(otherFrame: joinFrame): afterJoin<currentFrame, frames, joinFrame> => {
        // @ts-ignore
        return
    }

    JOIN = <joinFrame extends AnyFrame>(joinFrame: joinFrame): Join<currentFrame & frames, joinFrame> => {

        const joinKind: FromTable = {
            tableName: Object.keys(joinFrame)[0],
            type: "JoinTable",
            as: null,
        }

        // @ts-ignore
        return new Join(this.sql, joinKind, this.frames, joinFrame)
    }

    AS = <name extends string>(name: name): afterAs<currentFrame, frames, name, AfterFromAs> => {

        // @ts-ignore
        const value = Object.values(this.framesMap)[0]

        const newFramesMap = {
            [name]: value
        }

        // @ts-ignore
        return new From(this.sql, newFramesMap)
    }

    // GROUP_BY = <GroupByItems extends PossibleGroupByItems<FramesMap>>(items: GroupByItems) => {
    // }

    HAVING = () => {
    }

    UNION = () => {
    }

}

export function FROM<Frame extends AnyFrame>(frame: Frame): From<Frame, {}> {

    const joinKind: FromTable = {
        tableName: Object.keys(frame)[0],
        type: "JoinTable",
        as: null,
    }

    const sql: SelectQuery = selectQuery({
        froms: [{ from: joinKind, joins: [] }]
    })

    // @ts-ignore
    return new From(sql, frameMap)
}

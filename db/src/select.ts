import { AnyColumn } from "./column"
import { From } from "./from"
import { SelectQuery } from "./syntax"

export class Select<Columns> {
    constructor(public sql: SelectQuery, public columns: Columns) {
    }

    ORDER_BY = () => {}

    LIMIT = () => {}

    OFFSET = () => {}

}

export type MkColumn<$FramesMap> = {
    [K in keyof $FramesMap]: {
        [L in keyof $FramesMap[K]]: (K extends string ? (L extends string ? `${K}.${L}` : never) : never)
    }[keyof $FramesMap[K]] | (K extends string ? `${K}.*` : never)
}[keyof $FramesMap]

type PossibleFields<$FramesMap> = (MkColumn<$FramesMap> | ((x: $FramesMap) => AnyColumn))[] | "*"

export function SELECT<currentFrame extends {}, FramesMap extends {}, Selected extends PossibleFields<currentFrame & FramesMap>>(f: Selected, from: From<currentFrame, FramesMap>) {

    // const sql = selectable.getSql()

    // /** @type { NamedColumn<any, any, any>[] } */
    // const groupedColumns = mkGroupedColumns(selectable.getSelectable())
    // const columns = groupedColumns.reduce((previous, current) => {
    //     return {
    //         ...previous,
    //         [current.name]: new Column(current.dbType, current.state, current.value)
    //     }
    // }, {})

    // @ts-ignore
    return new Select(newSql, columns)
}

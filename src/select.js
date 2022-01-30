import { Column, NamedColumn } from "./column"
import { OrderBy } from "./orderBy"

/**
 * @template T
 * @template {[any, ...any[]]} U
 * @param { (ab: T) => U } mkGroupedColumns 
 * @param { import("./Select").Selectable<T> } selectable
 * @returns { import("./orderBy").OrderBy<import("./Helpers").Select<U>> }
 */
export function SELECT(mkGroupedColumns, selectable) {

    const sql = selectable.getSql()

    // console.log(selectable.getSelectable())
    // process.exit(1)

    /** @type { NamedColumn<any, any, any>[] } */
    const groupedColumns = mkGroupedColumns(selectable.getSelectable())
    const columns = groupedColumns.reduce((previous, current) => {
        return {
            ...previous,
            [current.name]: new Column(current.dbType, current.state, current.value)
        }
    }, {})

    /** @type { import("./Sql").Field[] } */
    const start = []

    const fields = groupedColumns.reduce((previous, current) => {

        const as = current.value.type === "path" ?
            current.value.value.endsWith(current.name) ? null : current.name : current.name

        /** @type {import("./Sql").Field} */
        const item = {
            expression: current.value.value,
            as: as
        }

        return [
            ...previous,
            item
        ]
    }, start)

    /** @type { import("./Sql").SelectQuery } */
    const newSql = {
        ...sql,
        fields,
    }

    // @ts-ignore
    return new OrderBy(newSql, columns)
}

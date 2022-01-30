import { toObj } from "./helpers"
import { Column, path } from "./column"
import { SubQuery } from "./orderBy"

/**
 * @returns {import("./Sql").SelectQuery}
 */
export function empty() {
    return {
        froms: [],
        where: null,
        groupBy: [],
        fields: [],
        order: [],
        offset: null,
        limit: null
    }
}

/**
 * @param {string | import("./Sql").SelectQuery} tableName 
 * @returns {import("./Sql").FromItem}
 */
export function fromItem(tableName) {
    return {
        from: tableName,
        joins: [],
    }
}

/**
 * @template A
 * @param {import("./column").Column<A, import("./Column").SingleState>} arg1 
 * @param {import("./column").Column<A, import("./Column").SingleState>} arg2 
 * @returns {import("./Sql").Eq}
 */
export function eq(arg1, arg2) {
    return {
        type: "eq",
        arg1,
        arg2,
    }
}

/**
 * @param {{ [key: string]: { [key: string]: { type: string } } }} obj 
 * @returns {{ [key: string]: { [key: string]: import("./column").Column<any, any> } }}
 */
export function replaceValueWithColumn(obj) {
    return toObj(Object.entries(obj).map(([key, value]) =>
        [key, toObj(Object.entries(value).map(([colKey, colValue]) => [colKey, 
            new Column(colValue.type, "selectable", path(`${key}.${colKey}`))
        ]))]
    ))
}
import { toObj } from "./helpers"
import { path } from "./column"

/**
 * @returns {import("./Sql").PreSelect}
 */
export function empty() {
    return {
        froms: [],
        where: null,
        groupBy: [],
    }
}

/**
 * @param {string} tableName 
 * @returns {import("./Sql").FromItem}
 */
export function fromItem(tableName) {
    return {
        tableName,
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
 * @param {{ [key: string]: { [key: string]: any } }} obj 
 * @returns {{ [key: string]: { [key: string]: import("./Column").Path } }}
 */
export function replaceValueWithPath(obj) {
    return toObj(Object.entries(obj).map(([key, value]) =>
        [key, toObj(Object.entries(value).map(([colKey, _]) => [colKey, path(`${key}.${colKey}`)]))]
    ))
}
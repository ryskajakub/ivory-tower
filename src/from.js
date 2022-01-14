import { q } from "./sql"
import Query from "./Query"

// export type Return<T> = Query<From<T>>

/**
 * @template T
 * @typedef { Query<import("./from.d").From<T>> } Return
 */

/**
 * @template T
 * @param {import("./table").Table<T>} table 
 * @returns {Return<T>}
 */
export function FROM(table) {
    const key = Object.keys(table)[0]
    const x = {
        sql: q(key),
        columns: table,
    }
    // @ts-ignore
    return new Query(x)
}
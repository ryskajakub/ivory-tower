import { toObj } from "./helpers"
import { path } from "./column"
import { fromItem } from "./sql";
import { JoinPhaseAs } from "./joinPhase"

/**
 * @param {{ [key: string]: { [key: string]: any } }} obj 
 * @returns {{ [key: string]: { [key: string]: import("./Column").Path } }}
 */
export function replaceValueWithPath(obj) {
    return toObj(Object.entries(obj).map(([key, value]) =>
        [key, toObj(Object.entries(value).map(([colKey, _]) => [colKey, path(`${key}.${colKey}`)]))]
    ))
}

/**
 * @template T
 * @typedef { import("./Table").TableType<T> } TableType
 */

/**
 * @template T
 * @param {import("./table").Table<T>} table 
 * @returns { From<{}, import("./From").FromType<T extends TableType<infer TT> ? TT : never>> }
 */
export function FROM(table) {
    /** @type {import("./From").FromType<T>} */
    // @ts-ignore
    const columns = replaceValueWithPath(table.def)
    // @ts-ignore
    return new From([], fromItem(table.name), {}, columns)
}

/**
 * @template {import("./From").FromType<any>} T
 * @template {import("./From").FromType<any>} U
 */
export class From {
    /**
     * @param {import("./Sql").FromItem[]} previousSqls
     * @param {import("./Sql").FromItem} currentSql
     * @param {T} previousFroms 
     * @param {U} currentFrom 
     */
    constructor(previousSqls, currentSql, previousFroms, currentFrom) {
        /** @readonly @protected */
        this.previousSqls = previousSqls
        /** @readonly @protected */
        this.currentSql = currentSql
        /** @readonly @protected */
        this.previousFroms = previousFroms
        /** @readonly @protected */
        this.currentFrom = currentFrom
    }

    /**
     * @template V
     * @param {import("./table").Table<V>} table 
     * @returns {JoinPhaseAs<T, U, import("./From").FromType<V>>}
     */
    JOIN = (table) => {
        /** @type {import("./From").FromType<V>} */
        // @ts-ignore
        const currentJoin = replaceValueWithPath(table.def)
        return new JoinPhaseAs(this.previousSqls, this.currentSql, this.previousFroms, this.currentFrom, table.name, currentJoin)
    }

    /**
     * @template V
     * @param {import("./table").Table<V>} table 
     * @returns {From<import("./Helpers").DisjointUnion<U, T>, import("./From").FromType<V>>}
     */
    item = (table) => {
        const f = FROM(table)
        const newPreviousFroms = {
            ...this.previousFroms,
            ...this.currentFrom,
        }
        const newPreviousSqls = [...this.previousSqls, this.currentSql]
        // @ts-ignore
        return new From(newPreviousFroms, f.currentFrom, newPreviousSqls, f.currentSql)
    }

    toString = () => {
        return {
            previousSqls: this.previousSqls,
            currentSql: this.currentSql,
            previousFroms: this.previousFroms,
            currentFrom: this.currentFrom,
        }
    }
}
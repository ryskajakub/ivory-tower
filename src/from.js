import { fromItem } from "./sql";
import { JoinPhaseAs } from "./joinPhase"
import { replaceValueWithPath } from "./sql";
import { GroupBy } from "./groupBy";

/**
 * @template T
 * @typedef { import("./Table").TableType<T> } TableType
 */

/**
 * @template {TableType<any>} T
 * @template Name
 * @template U
 * @template TableOrQuery
 * @param {TableOrQuery} table 
 * @returns { From<{}, import("./From").FromTableOrQuery<TableOrQuery>> }
 */
export function FROM(table) {
    // @ts-ignore
    const columns = replaceValueWithPath(table.def)
    // @ts-ignore
    return new From([], fromItem(table.name), {}, columns)
}

/**
 * @template T
 * @typedef { import("./Select").Selectable<T> } Selectable
 */

/**
 * @template {import("./From").FromTable<any>} T
 * @template {import("./From").FromTable<any>} U
 * @extends GroupBy<T, U>
 * @implements { Selectable<import("./From").MakeSelectable<T & U>> }
 */
export class From extends GroupBy {

    /**
     * @returns { import("./From").MakeSelectable<T & U> }
     */
    selectable = () => {
        // @ts-ignore
        return {}
    }

    /**
     * @param {import("./Sql").PreSelect} sql
     * @param {T} previousFroms 
     * @param {U} currentFrom 
     */
    constructor(sql, previousFroms, currentFrom) {
        super(sql, previousFroms, currentFrom)
    }

    //  * @returns {JoinPhaseAs<T, U, import("./From").FromTableOrQuery<TableOrQuery>>}

    /**
     * @template TableOrQuery
     * @param { TableOrQuery } table 
     * @returns { import("./From").JoinTableOrQuery<T, U, TableOrQuery, false> }
     */
    JOIN = (table) => {
        // @ts-ignore
        const currentJoin = replaceValueWithPath(table.def)
        // @ts-ignore
        return new JoinPhaseAs(this.sql, this.previousFroms, this.currentFrom, table.name, currentJoin, null)
    }

    /**
     * @template TableOrQuery
     * @param { TableOrQuery } table 
     * @returns { import("./From").JoinTableOrQuery<T, U, TableOrQuery, true> }
     */
    LEFT_JOIN = (table) => {
        // @ts-ignore
        return {};
    } 

    /**
     * @template {TableType<any>} V
     * @param {import("./table").Table<V>} table 
     * @returns {From<import("./Helpers").DisjointUnion<U, T>, import("./From").FromTable<V>>}
     */
    item = (table) => {
        const f = FROM(table)
        const newPreviousFroms = {
            ...this.previousFroms,
            ...this.currentFrom,
        }
        /** @type {import("./Sql").PreSelect} */
        const newSql = {
            ...this.sql,
            froms: [...this.sql.froms, ...f.sql.froms]
        }
        // @ts-ignore
        return new From(newSql, newPreviousFroms, f.currentFrom)
    }

    toString = () => {
        return {
            sql: this.sql,
            previousFroms: this.previousFroms,
            currentFrom: this.currentFrom,
        }
    }
}
import { empty, fromItem } from "./sql";
import { JoinPhaseAs } from "./joinPhase"
import { replaceValueWithPath } from "./sql";
import { Where } from "./groupBy";
import { Table } from "./table";

/**
 * @template T
 * @typedef { import("./Table").TableType<T> } TableType
 */

/**
 * @template TableOrQuery
 * @param {TableOrQuery} table 
 * @returns { From<{}, import("./From").FromTableOrQuery<TableOrQuery>, false> }
 */
export function FROM(table) {
    const [columns, name] = table instanceof Table ?
        [replaceValueWithPath(table.def), table.name] : [null, ""]
    /** @type { import("./Sql").SelectQuery } */
    const sql = {
        ...empty(),
        froms: [fromItem(name)]
    }
    // @ts-ignore
    return new From(sql, {}, columns)
}

/**
 * @template T
 * @typedef { import("./Select").Selectable<T> } Selectable
 */

/**
 * @template T
 * @template U
 * @template {boolean} Lateral
 * @extends Where<T, U>
 * @implements { Selectable<import("./From").MakeSelectable<T & U>> }
 */
export class From extends Where {

    /**
     * @returns { import("./From").MakeSelectable<T & U> }
     */
    selectable = () => {
        // @ts-ignore
        return {}
    }

    /**
     * @param {import("./Sql").SelectQuery} sql
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
     * @returns { import("./From").JoinTableOrQuery<T, U, TableOrQuery, false, Lateral> }
     */
    JOIN = (table) => {
        // @ts-ignore
        const currentJoin = replaceValueWithPath(table.def)
        // @ts-ignore
        return new JoinPhaseAs(this.sql, this.previousFroms, this.currentFrom, table.name, currentJoin, null, "inner")
    }

    /**
     * @template TableOrQuery
     * @param { TableOrQuery } table 
     * @returns { import("./From").JoinTableOrQuery<T, U, TableOrQuery, true, Lateral> }
     */
    LEFT_JOIN = (table) => {
        // @ts-ignore
        const currentJoin = replaceValueWithPath(table.def)
        // @ts-ignore
        return new JoinPhaseAs(this.sql, this.previousFroms, this.currentFrom, table.name, currentJoin, null, "left")
    }

    /**
     * @template TableOrQuery
     * @param {TableOrQuery} table 
     * @returns {From<import("./Helpers").DisjointUnion<U, T>, import("./From").FromTableOrQuery<TableOrQuery>,false>}
     */
    item = (table) => {
        const f = FROM(table)
        const newPreviousFroms = {
            ...this.previousFroms,
            ...this.currentFrom,
        }
        /** @type {import("./Sql").SelectQuery} */
        const newSql = {
            ...this.sql,
            froms: [...this.sql.froms, ...f.sql.froms]
        }
        // @ts-ignore
        return new From(newSql, newPreviousFroms, f.currentFrom)
    }

    /**
     * @template TableOrQuery
     * @param {TableOrQuery} table 
     * @returns {From<import("./Helpers").DisjointUnion<U, T>, import("./From").FromTableOrQuery<TableOrQuery>,true>}
     */
    LATERAL_item = (table) => {
        // @ts-ignore
        return {}
    }
}
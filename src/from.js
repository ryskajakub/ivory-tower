import { empty, replaceExpressionsWithPaths } from "./sql";
import { JoinPhase, JoinPhaseAs } from "./joinPhase"
import { replaceValueWithColumn } from "./sql";
import { Where } from "./groupBy";
import { SubQuery } from "./orderBy";
import { Column, NamedColumn } from "./column";
import { mapOneLevel } from "./helpers"

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

    if (table instanceof SubQuery) {
        const columns = replaceExpressionsWithPaths(table.getColumns())
        /** @type { import("./Sql").JoinQuery } */
        const joinKind = {
            type:"JoinQuery",
            query: table.getSql()
        }

        /** @type { import("./Sql").FromItem } */
        const fromItem = {
            from: joinKind,
            joins: []
        }

        const sql = { ...empty(), froms: [fromItem] }

        // @ts-ignore
        return new From(sql, {}, columns)
    } else {
        // @ts-ignore
        const columns = replaceValueWithColumn(table.def)
        /** @type { import("./Sql").JoinTable } */
        const joinKind = {
            // @ts-ignore
            tableName: table.name,
            type: "JoinTable",
            as: null,
        }

        /** @type { import("./Sql").FromItem } */
        const fromItem = {
            from: joinKind,
            joins: []
        }

        /** @type { import("./Sql").SelectQuery } */
        const sql = { ...empty(), froms: [fromItem]}

        // @ts-ignore
        return new From(sql, {}, columns)
    }

}

/**
 * @template T
 * @template U
 * @template {boolean} Lateral
 * @extends Where<T, U>
 */
export class From extends Where {

    /**
     * @param {import("./Sql").SelectQuery} sql
     * @param {T} previousFroms 
     * @param {U} currentFrom 
     */
    constructor(sql, previousFroms, currentFrom) {
        super(sql, previousFroms, currentFrom)
    }

    /**
     * @template TableOrQuery
     * @param { TableOrQuery } table 
     * @returns { import("./From").JoinTableOrQuery<T, U, TableOrQuery, false, Lateral> }
     */
    JOIN = (table) => {

        if (table instanceof SubQuery) {
            const currentJoin = replaceExpressionsWithPaths(table.getColumns())
            /** @type { import("./Sql").JoinQuery } */
            const joinKind = {
                type:"JoinQuery",
                query: table.getSql()
            }
            // @ts-ignore
            return new JoinPhase(this.sql, this.previousFroms, this.currentFrom, joinKind, currentJoin, null, "inner")
        } else {
            // @ts-ignore
            const currentJoin = replaceValueWithColumn(table.def)
            /** @type { import("./Sql").JoinTable } */
            const joinKind = {
                // @ts-ignore
                tableName: table.name,
                type: "JoinTable",
                as: null,
            }
            // @ts-ignore
            return new JoinPhaseAs(this.sql, this.previousFroms, this.currentFrom, joinKind, currentJoin, null, "inner")
        }

    }

    /**
     * @template TableOrQuery
     * @param { TableOrQuery } table 
     * @returns { import("./From").JoinTableOrQuery<T, U, TableOrQuery, true, Lateral> }
     */
    LEFT_JOIN = (table) => {
        // @ts-ignore
        const currentJoin = replaceValueWithColumn(table.def)
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
    LATERAL = (table) => {
        // @ts-ignore
        return this.item(table)
    }
}
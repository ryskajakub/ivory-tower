import { empty, fromItem } from "./sql";
import { JoinPhaseAs } from "./joinPhase"
import { replaceValueWithColumn } from "./sql";
import { Where } from "./groupBy";
import { Table } from "./table";
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
    /** @type { [any, import("./Sql").SelectQuery] } */
    const [columns, sql] = table instanceof Table ?
        [replaceValueWithColumn(table.def), { ...empty(), froms: [fromItem(table.name)] }] :
        table instanceof SubQuery ?
            [table.getColumns(), { ...empty(), froms: [fromItem(table.getSql())] }] : [{}, empty()]
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
    getSelectable = () => {

        /** @type { (name: string, c: Column<any, any>) => NamedColumn<any, any, any> } */
        const toNamedColumn = (name, c) => {
            return c.AS(name)
        }

        const unionOfColumns = {
            ...this.currentFrom,
            ...this.previousFroms,
        }

        const union = mapOneLevel(unionOfColumns, (_key, obj) => 
            mapOneLevel(obj, (name, c) => toNamedColumn(name, c))
        )

        // @ts-ignore
        return union
    }

    getSql = () => {
        return this.sql
    }

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
        const currentJoin = table instanceof SubQuery ?
            table.getColumns() :
            // @ts-ignore
            replaceValueWithColumn(table.def)
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
/**
 * @template T
 * @typedef {import("./Select").Selectable<T> } Selectable
 */

/**
 * @template T
 * @implements { Selectable<T> }
 */
export class Grouped {
    /**
     * @param {import("./Sql").SelectQuery} sql
     * @param {T} group
     */
    constructor(sql, group) {
        /** @readonly @public */
        this.sql = sql
        /** @readonly @protected */
        this.group = group
    }

    getSql = () => this.sql
    getSelectable = () => this.group 

    asString = () => {
        return JSON.stringify({
            sql: this.sql,
            currentFrom: this.group,
        }, undefined, 2)
    }
}
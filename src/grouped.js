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
     * @param {import("./Sql").PreSelect} sql
     * @param {T} group
     */
    constructor(sql, group) {
        /** @readonly @public */
        this.sql = sql
        /** @readonly @protected */
        this.group = group
    }

    /**
     * @returns { T }
     */
    selectable = () => {
        return this.group
    }
}
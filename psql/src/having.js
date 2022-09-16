import { Grouped } from "./grouped"

/**
 * @template T
 * @typedef {import("./Select").Selectable<T> } Selectable
 */

/**
 * @template T
 * @extends { Grouped<T> }
 */
export class Having extends Grouped {

    /**
     * @param {import("./Sql").SelectQuery} sql
     * @param {T} group
     */
    constructor(sql, group) {
        super(sql, group)
    }

}
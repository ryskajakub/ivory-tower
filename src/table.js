/**
 * @template T
 */
export class Table {
    /**
     * @param {import("./Table").TableType<T>} def
     */
    constructor(def) {
        const name = Object.keys(def)[0]
        /** @readonly */
        this.def = def
        /** @readonly */
        this.name = name
    }

}
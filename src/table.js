/**
 * @template {import("./Table").TableType<any>} T 
 */
export class Table {
    /**
     * @param {T} def
     */
    constructor(def) {
        const name = Object.keys(def)[0]
        /** @readonly */
        this.def = def
        /** @readonly */
        this.name = name
    }

}
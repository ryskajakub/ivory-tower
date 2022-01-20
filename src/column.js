/**
 * @template DbType
 * @template {import("./Column").ColumnState} State
 */
export class Column {
    /**
     * @param {DbType} t 
     * @param {State} u 
     * @param {import("./Column").ColumnValue} v 
     */
    constructor(t, u, v) {
        /* @readonly @protected */
        this.t = t
        /* @readonly @protected */
        this.u = u
        /* @readonly @protected */
        this.v = v
    }

    /**
     * @template {string} As
     * @param {As} as
     * @returns {NamedColumn<DbType, State, As>}
     */
    AS = (as) => {
        return new NamedColumn(this.t, this.u, this.v, as)
    }

    /**
     * @param {import("./Column").ColumnValue} value 
     * @returns { Column<DbType, State> }
     */
    replaceValue = (value) => {
        return new Column(this.t, this.u, value)
    }

}

/**
 * @template DbType
 * @template {import("./Column").ColumnState} State
 * @template {string} Name
 * @extends Column<DbType, State>
 */
export class NamedColumn extends Column {
    /**
     * @param {DbType} t 
     * @param {State} u 
     * @param {import("./Column").ColumnValue} v 
     * @param {Name} name
     */
    constructor(t, u, v, name) {
        super(t, u, v)
        /* @readonly */
        this.name = name
    }

    /**
     * @param {import("./Column").ColumnValue} value 
     * @returns { Column<DbType, State> }
     */
    replaceValue = (value) => {
        return new Column(this.t, this.u, value)
    }
}

/**
 * @param {string} value
 * @returns {import("./Column").Path}
 */
export function path(value) {
    return {
        type: "path",
        value,
    }
}

/**
 * @template T
 * @param {T} value 
 * @returns {import("./Column").Literal}
 */
export function literal(value) {
    return {
        type: "literal",
        value,
    }
}
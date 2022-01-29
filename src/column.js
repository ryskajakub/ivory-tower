/**
 * @template DbType
 * @template {import("./Column").ColumnState} State
 */
export class Column {
    /**
     * @param {DbType} dbType 
     * @param {State} state 
     * @param {import("./Column").ColumnValue} value 
     */
    constructor(dbType, state, value) {
        /* @readonly @protected */
        this.dbType = dbType
        /* @readonly @protected */
        this.state = state
        /* @readonly @protected */
        this.value = value
    }

    /**
     * @template {string} As
     * @param {As} as
     * @returns {NamedColumn<DbType, State, As>}
     */
    AS = (as) => {
        return new NamedColumn(this.dbType, this.state, this.value, as)
    }

    /**
     * @param {import("./Column").ColumnValue} value 
     * @returns { Column<DbType, State> }
     */
    replaceValue = (value) => {
        return new Column(this.dbType, this.state, value)
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
     * @param {DbType} dbType 
     * @param {State} state 
     * @param {import("./Column").ColumnValue} value 
     * @param {Name} name
     */
    constructor(dbType, state, value, name) {
        super(dbType, state, value)
        /* @readonly */
        this.name = name
    }

    /**
     * @param {import("./Column").ColumnValue} value 
     * @returns { Column<DbType, State> }
     */
    replaceValue = (value) => {
        return new Column(this.dbType, this.state, value)
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
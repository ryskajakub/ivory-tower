import { toObj } from "./helpers"
import { transformer } from "./run";
import { print } from "./sql";
import { walkSelectQuery } from "./walk";

export class FinalOrderingElement {
    /**
     * @param {import("./Column").ColumnDirection} direction
     * @param {import("./column").Column<any, any>} field 
     */
    constructor(field, direction) {
        /** @readonly */
        this.field = field;
        /** @readonly */
        this.direction = direction;
    }
}

export class OrderingElement extends FinalOrderingElement {
    /**
     * @param {import("./column").Column<any, any>} field 
     */
    constructor(field) {
        super(field, "default")
    }

    /**
     * @returns {FinalOrderingElement}
     */
    ASC = () => {
        return new FinalOrderingElement(this.field, "ASC")
    }

    /**
     * @returns {FinalOrderingElement}
     */
    DESC = () => {
        return new FinalOrderingElement(this.field, "DESC")
    }
}


/**
 * @template {string} Name
 * @template { { [key: string]: import("./column").Column<any, any> } } T
 */
export class SubQuery {
    /**
     * @param {import("./Sql").SelectQuery} sql
     * @param {T} columns 
     * @param {Name} name 
     */
    constructor(sql, columns, name) {
        /** @readonly @protected */
        this.sql = sql
        /** @readonly @protected */
        this.columns = columns
        /** @readonly @protected */
        this.name = name
    }

    getSql = () => {
        return this.sql
    }

    getName = () => {
        return this.name
    }

    getColumns = () => {
        return {
            [this.name]: this.columns
        }
    }

}

/**
 * @template { {[key: string]: import("./column").Column<any, any>} } T
 */
export class Query {

    /**
     * @param {import("./Sql").SelectQuery} sql
     * @param {T} columns 
     */
    constructor(sql, columns) {
        /** @readonly @protected */
        this.sql = sql
        /** @readonly @protected */
        this.columns = columns
    }

    /**
     * @template {string} Name
     * @param {Name} name 
     * @returns { SubQuery<Name, T> }
     */
    AS = (name) => {
        /** @type { import("./Sql").SelectQuery } */
        const newSql = {
            ...this.sql,
            as: name
        }
        return new SubQuery(newSql, this.columns, name)
    }

    getSql = () => {
        return this.sql
    }

    getColumns = () => {
        return this.columns
    }
}

/**
 * @template { {[key: string]: import("./column").Column<any, any>} } T
 * @extends Query<T>
 */
export class Offset extends Query {

    /**
     * @param {import("./Sql").SelectQuery} sql
     * @param {T} columns 
     */
    constructor(sql, columns) {
        super(sql, columns)
    }

    /**
     * @param {number} ab 
     * @returns {Query<T>}
     */
    OFFSET = (ab) => {
        const newSql = {
            ...this.sql,
            offset: ab
        }
        return new Query(newSql, this.columns)
    }
}

/**
 * @template { {[key: string]: import("./column").Column<any, any>} } T
 * @extends {Offset<T>}
 */
export class Limit extends Offset {

    /**
     * @param {import("./Sql").SelectQuery} sql
     * @param {T} columns 
     */
    constructor(sql, columns) {
        super(sql, columns)
    }

    /**
     * @param {number} ab 
     * @returns {Offset<T>}
     */
    LIMIT = (ab) => {
        const newSql = {
            ...this.sql,
            limit: ab
        }
        return new Offset(newSql, this.columns)
    }
}

/**
 * @template T
 * @typedef { import("./Runnable").Runnable<T, true> } Runnable
 */

/**
 * @template { {[key: string]: import("./column").Column<any, any>} } T
 * @extends Limit<T>
 * @implements { Runnable<T> }
 */
export class OrderBy extends Limit {

    /**
     * @param {import("./Sql").SelectQuery} sql
     * @param {T} columns 
     */
    constructor(sql, columns) {
        super(sql, columns)
    }

    /**
     * @returns { import("./Runnable").QueryAndParams<T, true> }
     */
    getQueryAndParams = () => {

        const walk = walkSelectQuery(this.sql)
        const sqlString = print(walk.sql);

        return {
            params: walk.params,
            query: sqlString,
            // @ts-ignore
            transformer: transformer,
        }
    }

    /**
     * @param {(x: import("./From").MakeOrderingElements<T>) => FinalOrderingElement[]} ab 
     * @returns {Limit<T>}
     */
    ORDER_BY = (ab) => {

        /** @type { {[key: string]: OrderingElement} } */
        const orderingElementsInput = toObj(Object.entries(this.columns).map(([colKey, colValue]) => [colKey, 
            new OrderingElement(colValue)
        ]))

        // @ts-ignore
        const orderingElements = ab(orderingElementsInput)
        /** @type { import("./Sql").Order[] } */
        const order = orderingElements.map(oe => ({ field: `${oe.field.value}`, direction: oe.direction }))

        const newSql = {
            ...this.sql,
            order
        }

        return new Limit(newSql, this.columns)
    }
}
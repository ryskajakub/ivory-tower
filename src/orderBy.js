import { toObj } from "./helpers"

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
 * @template {string | null} Name
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
}

/**
 * @template { {[key: string]: import("./column").Column<any, any>} } T
 * @extends { SubQuery<null, T> }
 */
export class Query extends SubQuery {

    /**
     * @param {import("./Sql").SelectQuery} sql
     * @param {T} columns 
     */
    constructor(sql, columns) {
        super(sql, columns, null)
    }

    /**
     * @template {string} Name
     * @param {Name} name 
     * @returns { SubQuery<Name, T> }
     */
    AS = (name) => {
        return new SubQuery(this.sql, this.columns, name)
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
        // @ts-ignore
        return {}
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
        // @ts-ignore
        return {};
    }
}

/**
 * @template { {[key: string]: import("./column").Column<any, any>} } T
 * @extends Limit<T>
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
        const order = orderingElements.map(oe => ({ field: `${oe.field.value.value}`, direction: oe.direction }))

        const newSql = {
            ...this.sql,
            order
        }

        return new Limit(newSql, this.columns)
    }
}
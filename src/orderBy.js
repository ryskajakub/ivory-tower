
export class FinalOrderingElement {
    /**
     * @param {import("./Column").ColumnDirection} direction
     * @param {import("./column").Column<any, any>} field 
     */
    constructor(field, direction) {
        /** @protected @readonly */
        this.field = field;
        /** @protected @readonly */
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
     * @param {Name} name 
     */
    constructor(name) {
        /** @readonly @protected */
        this.name = name
    }
}

/**
 * @template { {[key: string]: import("./column").Column<any, any>} } T
 * @extends { SubQuery<null, T> }
 */
export class Query extends SubQuery {

    constructor() {
        super(null)
    }

    /**
     * @template {string} Name
     * @param {Name} name 
     * @returns { SubQuery<Name, T> }
     */
    AS = (name) => {
        return new SubQuery(name)
    }
}

/**
 * @template { {[key: string]: import("./column").Column<any, any>} } T
 * @extends Query<T>
 */
export class Offset extends Query {
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
     * @param {(x: T) => FinalOrderingElement[]} ab 
     * @returns {Limit<T>}
     */
    ORDER_BY = (ab) => {
        // @ts-ignore
        return {};
    }
}
/**
 * @returns {import("./Sql").Query}
 */
export function empty() {
    return {
        from: [],
        where: null
    }
}

/**
 * @param {string} tableName 
 * @returns {import("./Sql").FromItem}
 */
export function fromItem(tableName) {
    return {
        tableName,
        joins: [],
    }
}

/**
 * @template A
 * @template B
 * @param {import("./Column").Column<A>} arg1 
 * @param {import("./Column").Column<B>} arg2 
 * @returns {import("./Sql").Eq}
 */
export function eq(arg1, arg2) {
    return {
        type: "eq",
        arg1,
        arg2,
    }
}

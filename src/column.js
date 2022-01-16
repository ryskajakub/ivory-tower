/**
 * @param {string} str 
 * @returns {import("./Column").Path}
 */
export function path(str) {
    return {
        type: "path",
        path: str,
    }
}

/**
 * @template T
 * @param {T} value 
 * @returns {import("./Column").Column<import("./Column").DbType<T>>}
 */
export function literal(value) {
    return {
        type: "literal",
        value,
    }
}
import { NamedColumn, Column } from "./column"

/**
 * @template T
 * @template { Column<T, import("./Column").Aggregable> } U
 * @param {U} column
 * @returns { import("./Column").MapColumn<U, T, import("./Column").Aggregated> }
 */
export function MAX(column) {
    // @ts-ignore
    return {}
}

/**
 * @template T
 * @template { Column<T, import("./Column").Aggregable> } U
 * @param {U} column
 * @returns { import("./Column").MapColumn<string, T, import("./Column").Aggregated> }
 */
export function ARRAY_AGG(column) {
    // @ts-ignore
    return {}
}

/**
 * @template { Column<string, import("./Column").Aggregable> } U
 * @template V
 * @template { Column<V, import("./Column").Aggregable> } W
 * @param {U} column1
 * @param {W} column2
 * @returns { Record<string, import("./Column").TsType<V>> }
 */
export function JSONB_OBJECT_AGG(column1, column2) {
    // @ts-ignore
    return {}
}

/**
 * @template T
 * @template { Column<T, import("./Column").Aggregable> } U
 * @param {U} column
 * @returns { T[] }
 */
export function JSON_AGG(column) {
    // @ts-ignore
    return {}
}

/**
 * @template { import("./Column").SingleState } V 
 * @template { Column<import("./Column").Textual, V> } T
 * @template { Column<import("./Column").Textual, V> } U
 * @param {T} column1
 * @param {U} column2
 * @returns { Column<import("./Column").Text, V> }
 */
export function concat(column1, column2) {
    // @ts-ignore
    return {}
}
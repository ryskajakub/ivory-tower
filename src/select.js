import { Having } from "./having";
import { From } from "./from"

/**
 * @template T
 * @template {[any, ...any[]]} U
 * @param { (ab: T) => U } mkGroupedColumns 
 * @param { import("./Select").Selectable<T> } selectable
 * @returns { import("./Helpers").Select<U> }
 */
export function SELECT(mkGroupedColumns, selectable) {
    // @ts-ignore
    return {}
}

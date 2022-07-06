import { Column } from "./column"

/**
 * @template A
 * @param { ...A } x
 * @returns { import("./Function").JsonBuildObject<A> }
 */
export function JSON_BUILD_OBJECT(...x) {
    const values = x.map((value, index) => {
        if (index % 2 === 0) {
            return `'${value}'`
        } else {
            const column = /** @type { Column<any, any> } */ ( /** @type { unknown } */ (value))
            return column.value.value
        }
    }).join(", ")

    const value = {
        type: "path",
        value: `JSON_BUILD_OBJECT(${values})`
    }

    // @ts-ignore
    const transformer = (obj) => {
        return [...Array(x.length / 2)].reduce((acc, i) => {
            const key = /** @type {string} */ ( /** @type {unknown} */(x[i * 2]))
            const column = /** @type {Column<any, any>} */ (/** @type {unknown} */ (x[i * 2 + 1]))
            const value = obj[key]
            return {
                ...acc,
                // @ts-ignore
                [key]: column.dbType(value)
            }
        }, {})
    }

    // @ts-ignore
    return new Column(transformer, "selectable", value)
}

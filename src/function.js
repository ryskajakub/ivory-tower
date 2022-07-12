import { Column } from "./column"

/**
 * @template {readonly any[]} A
 * @param { A } args
 * @returns { import("./Function").JsonBuildObject<A> }
 */
export function JSON_BUILD_OBJECT(args) {
    const values = args.map((value, index) => {
        if (index % 2 === 0) {
            /** @type {import("./Sql").Path} */
            const path = {
                type: "path",
                value: `'${value}'`
            }
            return path
        } else {
            const column = /** @type { Column<any, any> } */ ( /** @type { unknown } */ (value))
            return column.value
        }
    })

    /** @type {import("./Sql").SqlFunction} */
    const value = {
        type: "function",
        name: "JSON_BUILD_OBJECT",
        args: values,
    }

    // @ts-ignore
    const transformer = (obj) => {
        return [...Array(args.length / 2).keys()].reduce((acc, i) => {

            const key = /** @type {string} */ ( /** @type {unknown} */(args[i * 2]))
            const column = /** @type {Column<any, any>} */ (/** @type {unknown} */ (args[i * 2 + 1]))
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

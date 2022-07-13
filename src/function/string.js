import { Column } from "../column"
import { anyFormFunction } from "../sql"

/**
 * @template {readonly any[]} T
 * @param {T} array
 * @returns { import("./String").SubstringResult<T> }
 */
export function SUBSTRING(array) {

    /** @type { Column<import("../Column").Text, any> } */
    const column = array[0]

    // @ts-ignore
    /** @type { () => import("../Sql").SqlExpression } */
    const mkNewValue = () => {
        switch (array.length) {
            case 3: 
                /** @type {import("../Sql").SqlExpression} */
                const numberLit = {
                    type: "literal",
                    dbType: "integer",
                    value: array[2]
                }
                return anyFormFunction(/** @type {const} */ ([column.value, numberLit]))(
                    (args, print) => {
                        return `SUBSTRING(${print(args[0])} ${array[1]} ${print(args[1])})`
                    })
            case 5: 
                /** @type {import("../Sql").SqlExpression} */
                const numberLit1 = {
                    type: "literal",
                    dbType: "integer",
                    value: array[2]
                }
                /** @type {import("../Sql").SqlExpression} */
                const numberLit2 = {
                    type: "literal",
                    dbType: "integer",
                    value: array[4]
                }
                return anyFormFunction(/** @type {const} */ ([column.value, numberLit1, numberLit2]))(
                    (args, print) => {
                        return `SUBSTRING(${print(args[0])} FROM ${print(args[1])} FOR ${print(args[2])})`
                    })
        }
    }

    // @ts-ignore
    return new Column(column.dbType, column.state, mkNewValue())
}
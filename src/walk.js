import { Column } from "./column";
/**
 * @typedef {{ column: Column<any, any>, number: number, values: any[] }} WalkedColumn
 */

/**
 * @typedef {{ expression: import("./Sql").Condition, values: any[], number: number }} WalkedExpression
 */

/**
 * @param { import("./Sql").Condition } expression
 * @param { number} number
 * @returns { WalkedExpression }
 */
export function walkExpression(expression, number) {
    const exp1 = walkArg(expression.arg1, number)
    const exp2 = walkArg(expression.arg2, exp1.number)
    return {
        expression: {
            ...expression,
            arg1: exp1.column,
            arg2: exp2.column,
        },
        number: exp2.number,
        values: [...exp1.values, ...exp2.values]
    }
}

/**
 * @param {Column<any, any>} column 
 * @param {number} number
 * @returns {WalkedColumn}
 */
function walkArg(column, number) {
    switch (column.v.type) {
        case "literal":
            /** @type {import("./Column").Path} */
            const path = {
                type: "path",
                value: `$${number}`,
            }
            return {
                column: column.replaceValue(path),
                number: number + 1,
                values: [column.v]
            }
        case "path":
            return {
                column,
                number,
                values: []
            }
    }
}
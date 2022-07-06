import { toObj } from "./helpers"
import { Column, path } from "./column"

/**
 * @returns {import("./Sql").SelectQuery}
 */
export function empty() {
    return {
        froms: [],
        where: null,
        groupBy: [],
        fields: [],
        order: [],
        offset: null,
        limit: null,
        as: null,
    }
}

/**
 * @param {string | import("./Sql").SelectQuery} tableName 
 * @returns {import("./Sql").FromItem}
 */
export function fromItem(tableName) {
    return {
        from: tableName,
        joins: [],
    }
}

/**
 * @param { { [key: string]: { type: string } } } obj 
 * @param {string} key
 * @returns { { [key: string]: import("./column").Column<any, any> } }
 */
export function renameColumn(obj, key) {
    return toObj(Object.entries(obj).map(([colKey, colValue]) => [colKey,
        new Column((x) => x, "selectable", path(`${key}.${colKey}`))
    ]))
}

/**
 * @param {{ [key: string]: { [key: string]: { type: string } } }} obj 
 * @returns {{ [key: string]: { [key: string]: import("./column").Column<any, any> } }}
 */
export function replaceValueWithColumn(obj) {
    return toObj(Object.entries(obj).map(([key, value]) =>
        [key, renameColumn(value, key)]
    ))
}

/**
 * @param {import("./Sql").SqlExpression } condition 
 */
function printCondition(condition) {

    /** @type { (op: import("./Sql").Operator) => string } */
    const printOperator = (op) => {
        switch (op) {
            case "and": return "AND"
            case "or": return "OK"
            case "gt": return ">"
            case "gte": return ">="
            case "eq": return "="
            case "lt": return "<"
            case "lte": return "<="
        }
    }

    /** @type { (arg: import("./Sql").SqlExpression ) => string } */
    const value = (arg) => {
        switch (arg.type) {
            case "literal": return `${arg.value}`
            case "path": return arg.value
            case "binary": return `(${value(arg.arg1)} ${printOperator(arg.operator)} ${value(arg.arg2)})`
            case "negation": return `NOT ${value(arg)}`
        }
    }
    return value(condition)
}

/**
 * @param { import("./Sql").SelectQuery } sq 
 * @param {number} [indentParam]
 * @returns {string}
 */
export function print(sq, indentParam) {
    const indent = indentParam ? indentParam : 0
    const indentStr = [...Array(indent).keys()].map(_ => "\t").reduce((prev, current) => `${prev}${current}`, "")
    const fields = sq.fields.map(field => field.expression + (field.as === null ? "" : ` AS ${field.as}`))
        .reduce((prev, current) => `${prev}, ${current}`)
    const select = `SELECT ${fields}`
    const fromItems = sq.froms.map(fi => {
        const f1 = typeof fi.from === 'string' ?
            `${indentStr}\t${fi.from}` : `${indentStr}\t(\n${print(fi.from, indent + 2)}${indentStr}\t) AS ${fi.from.as}`
        /** @type {(joinType: import("./From").JoinType) => string} */
        const printJoinType = (joinType) => {
            switch (joinType) {
                case "left": return "LEFT JOIN"
                case "inner": return "JOIN"
            }
        }
        const joins = fi.joins.map(join => "\n" + indentStr + "\t" + printJoinType(join.type) + ` ${join.tableName}` + (join.as === null ? "" : ` AS ${join.as}` ) + (` ON ${printCondition(join.on)}`)).reduce((prev, current) => `${prev}${current}`, "")
        return `${f1}${joins}`
    }).reduce((prev, current) => `${prev},\n${current}`)

    /** @type {(direction: import("./Column").ColumnDirection) => string} */
    const printDirection = (direction) => {
        switch (direction) {
            case "default": return ""
            case "ASC": return " ASC"
            case "DESC": return " DESC"
        }
    }

    const from = `FROM\n${fromItems}`
    const where = sq.where === null ? null : (`WHERE ${printCondition(sq.where)}`)
    const groupBy = sq.groupBy.length === 0 ? null : `GROUP BY ${sq.groupBy.reduce((prev, current) => `${prev}, ${current}`)}`
    const order = sq.order.length === 0 ? null : `ORDER BY ${sq.order.map((ob) => ob.field + printDirection(ob.direction))}`
    const limit = sq.limit === null ? null : `LIMIT ${sq.limit}`
    const offset = sq.offset === null ? null : `OFFSET ${sq.offset}`
    /** @type { (string | null)[] } */
    const allElements = [select, from, where, groupBy, order, limit, offset]
    const string = allElements.filter(e => e !== null).map(e => `${indentStr}${e}\n`)
        .reduce((prev, current) => `${prev}${current}`)
    return string
}

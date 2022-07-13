import { toObj } from "./helpers"
import { Column } from "./column"

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
 * @param { { [key: string]: Column<any, any> } } obj 
 * @param {string} key
 * @returns { { [key: string]: import("./column").Column<any, any> } }
 */
export function expressionToPath(obj, key) {
    return toObj(Object.entries(obj).map(([colKey, column]) => {
        return [
            colKey,
            new Column(column.dbType, "selectable", path(`${key}.${colKey}`))
        ]
    }))
}

/**
 * @param { { [key: string]: Column<any, any> } } obj 
 * @param {string} key
 * @returns { { [key: string]: import("./column").Column<any, any> } }
 */
export function renameColumns(obj, key) {
    return toObj(Object.entries(obj).map(([colKey, column]) => {
        return [
            colKey,
            new Column(column.dbType, "selectable", path(`${key}.${colKey}`))
        ]
    }))
}

/**
 * @param { { [key: string]: { type: string } } } obj 
 * @param {string} key
 * @returns { { [key: string]: import("./column").Column<any, any> } }
 */
export function makeColumns(obj, key) {
    return toObj(Object.entries(obj).map(([colKey, colValue]) => { 
        const mkTransformer = () => {
            switch(colValue.type) {
                // @ts-ignore
                case "date": return ((x) => new Date(x))
                // @ts-ignore
                default: return ((x) => x)
            }
        }
        return [
            colKey,
            new Column(mkTransformer(), "selectable", path(`${key}.${colKey}`))
        ]
    }))
}

/**
 * @param {{ [key: string]: { [key: string]: { type: string } } }} obj 
 * @returns {{ [key: string]: { [key: string]: import("./column").Column<any, any> } }}
 */
export function replaceValueWithColumn(obj) {
    return toObj(Object.entries(obj).map(([key, value]) =>
        [key, makeColumns(value, key)]
    ))
}

/**
 * @param {{ [key: string]: { [key: string]: import("./column").Column<any, any> } }} obj 
 * @returns {{ [key: string]: { [key: string]: import("./column").Column<any, any> } }}
 */
export function replaceExpressionsWithPaths(obj) {
    return toObj(Object.entries(obj).map(([key, value]) =>
        [key, expressionToPath(value, key)]
    ))
}

/**
 * @param {import("./Sql").SqlExpression } condition 
 */
export function printCondition(condition) {

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
            case "function":
                const args = arg.args.map(a => value(a)).join(", ")
                return `${arg.name}(${args})`
            case "anyFormFunction": return arg.print(arg.args, value)
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
    const fields = sq.fields.map(field => printCondition(field.expression) + (field.as === null ? "" : ` AS ${field.as}`))
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

        /** @type {(joinKind: import("./Sql").JoinKind) => string } */
        const mkJoinKind = (joinKind) => {
            switch (joinKind.type) {
                case "JoinTable": 
                    return ` ${joinKind.tableName}` + (joinKind.as === null ? "" : ` AS ${joinKind.as}` )
                case "JoinQuery":
                    return `(\n${print(joinKind.query, indent + 2)}) AS ${joinKind.query.as}`

            }
        } 

        const joins = fi.joins.map(join => "\n" + indentStr + "\t" + printJoinType(join.type) + mkJoinKind(join.kind) + (` ON ${printCondition(join.on)}`)).reduce((prev, current) => `${prev}${current}`, "")
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
    const groupBy = sq.groupBy.length === 0 ? null : `GROUP BY ${sq.groupBy.map(item => printCondition(item)).reduce((prev, current) => `${prev}, ${current}`)}`
    const order = sq.order.length === 0 ? null : `ORDER BY ${sq.order.map((ob) => ob.field + printDirection(ob.direction))}`
    const limit = sq.limit === null ? null : `LIMIT ${sq.limit}`
    const offset = sq.offset === null ? null : `OFFSET ${sq.offset}`
    /** @type { (string | null)[] } */
    const allElements = [select, from, where, groupBy, order, limit, offset]
    const string = allElements.filter(e => e !== null).map(e => `${indentStr}${e}\n`)
        .reduce((prev, current) => `${prev}${current}`)
    return string
}

/**
 * @param { string } str
 * @returns { import("./Sql").SqlExpression }
 */
export function path(str) {
    return {
        type: "path",
        value: str
    }
}

/**
 * @template { any | (readonly any[]) } T
 * @param {T} args
 * @returns { ( print: ((args: T, printSqlExpression: ((e: import("./Sql").SqlExpression) => string)) => string) ) => import("./Sql").AnyFormFunction }
 */
export function anyFormFunction(args) {
    return (print) => {

        /** @type { (x: import("./walk").SqlExpression[]) => string } */
        // @ts-ignore
        const printTakingArray = Array.isArray(args) ? print : (x) => print(x[0])

        /** @type { import("./Sql").AnyFormFunction } */
        const result = {
            type: "anyFormFunction",
            // @ts-ignore
            print: printTakingArray,
            // @ts-ignore
            args
        }
        return result
    }
}

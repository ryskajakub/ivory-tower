// @ts-nocheck
import { AnyFormFunction, ColumnDirection, FromSource, JoinType, Operator, SelectQuery, SqlExpression } from "./syntax"

export function printSqlExpression(condition: SqlExpression) {

    // /** @type { (op: import("./Sql").Operator) => string } */
    const printOperator = (op: Operator) => {
        return op
    }

    // /** @type { (arg: import("./Sql").SqlExpression ) => string } */
    const value = (arg: SqlExpression): string => {
        switch (arg.type) {
            case "literal": return `${arg.value}`
            case "path": return arg.value
            case "binary": return `${value(arg.arg1)} ${printOperator(arg.operator)} ${value(arg.arg2)}`
            case "negation": return `NOT ${value(arg)}`
            case "function":
                const args = arg.args.map(a => value(a)).join(", ")
                return `${arg.name}(${args})`
            case "anyFormFunction": return arg.print(arg.args, value)
            case "queryExpression": return `(${print(arg.query)})`
        }
    }

    return value(condition)
}

export function print(sq: SelectQuery | SelectQuery[], indentParam?: number): string {
    const indent = indentParam ? indentParam : 0
    if(Array.isArray(sq)) {
        return sq.map(x => printSingle(x, indent)).reduce((x, y) => `${x}\nUNION ALL\n${y}`)
    } else {
        return printSingle(sq, indent)
    }
}

export function printSingle(sq: SelectQuery, indent: number): string {

    const mkIndentStr = (n: number) => [...Array(n).keys()].map(_ => "\t").reduce((prev, current) => `${prev}${current}`, "")
    const indentStr = mkIndentStr(indent)

    const fields = sq.fields.map(field => printSqlExpression(field.expression) + (field.as === null ? "" : ` AS ${field.as}`))
        .reduce((prev, current) => `${prev}, ${current}`)
    const select = `SELECT ${fields}`
    const fromItems = sq.froms.map(fi => {

        // /** @type {(joinKind: import("./Sql").JoinKind) => string } */
        const mkJoinKind = (joinKind: FromSource): string => {
            switch (joinKind.type) {
                case "JoinTable": 
                    return ` ${joinKind.tableName}` + (joinKind.as === null ? "" : ` AS ${joinKind.as}` )
                case "JoinQuery":
                    const asClause = Array.isArray(joinKind.query) ? `` : ` AS ${joinKind.query.as}`
                    return `(\n${print(joinKind.query, indent + 1)}${indentStr})${asClause}`
            }
        } 

        const f1 = mkJoinKind(fi.from)
        // const f1 = typeof fi.from === 'string' ?
        //     `${indentStr}\t${fi.from}` : `${indentStr}\t(\n${print(fi.from, indent + 2)}${indentStr}\t) AS ${fi.from.as}`
        // /** @type {(joinType: import("./From").JoinType) => string} */
        const printJoinType = (joinType: JoinType) => {
            switch (joinType) {
                case "left": return "LEFT JOIN"
                case "inner": return "JOIN"
            }
        }

        const joins = fi.joins.map(join => "\n" + indentStr + "\t" + printJoinType(join.type) + mkJoinKind(join.source) + (` ON ${printSqlExpression(join.on)}`)).reduce((prev, current) => `${prev}${current}`, "")
        return `${indentStr}${f1}${joins}`
    }).reduce((prev, current) => `${prev},\n${current}`)

    // /** @type {(direction: import("./Column").ColumnDirection) => string} */
    const printDirection = (direction: ColumnDirection) => {
        switch (direction) {
            case "default": return ""
            case "ASC": return " ASC"
            case "DESC": return " DESC"
        }
    }

    const from = `FROM\n${fromItems}`
    const where = sq.where === null ? null : (`WHERE ${printSqlExpression(sq.where)}`)
    const groupBy = sq.groupBy.length === 0 ? null : `GROUP BY ${sq.groupBy.map(item => printSqlExpression(item)).reduce((prev, current) => `${prev}, ${current}`)}`
    const order = sq.order.length === 0 ? null : `ORDER BY ${sq.order.map((ob) => ob.field + printDirection(ob.direction))}`
    const limit = sq.limit === null ? null : `LIMIT ${sq.limit}`
    const offset = sq.offset === null ? null : `OFFSET ${sq.offset}`
    const allElements = [select, from, where, groupBy, order, limit, offset]
    const string = allElements.filter(e => e !== null).map(e => `${indentStr}${e}\n`)
        .reduce((prev, current) => `${prev}${current}`)
    return string
}

// /**
//  * @param { string } str
//  * @returns { import("./Sql").SqlExpression }
//  */
export function path(str: string): SqlExpression {
    return {
        type: "path",
        value: str
    }
}

export function anyFormFunction<T extends any | Array<any>>(args: T): ( print: ((args: T, printSqlExpression: ((e: SqlExpression) => string)) => string) ) => AnyFormFunction {
    return (print) => {

        // /** @type { (x: import("./walk").SqlExpression[]) => string } */
        // @ts-ignore
        const printTakingArray: (x: SqlExpression) => string = Array.isArray(args) ? print : (x) => print(x[0])
        const argsArray = Array.isArray(args) ? args : [args]

        // /** @type { import("./Sql").AnyFormFunction } */
        const result: AnyFormFunction = {
            type: "anyFormFunction",
            // @ts-ignore
            print: printTakingArray,
            // @ts-ignore
            args: argsArray
        }
        return result
    }
}

import { Column } from "./column";
/**
 * @typedef {{ column: Column<any, any>, number: number, values: any[] }} WalkedColumn
 */

/**
 * @typedef {{ expression: import("./Sql").BinaryOperation, values: any[], number: number }} WalkedExpression
 */

/**
 * @template A
 * @typedef { import("./Walk").WalkResult<A> } WalkResult
 */

/**
 * @typedef { import("./Sql").SelectQuery } SelectQuery
 */

/**
 * @typedef { import("./Sql").FromItem } FromItem
 */

/**
 * @typedef { import("./Sql").Join } Join
 */

/**
 * @typedef { import("./Sql").SqlExpression } SqlExpression
 */

/** 
 * @param { WalkResult<SqlExpression> } walk
 * @returns { WalkResult<SqlExpression> }
 */
function walkSqlExpressionInternal(walk) {
    switch(walk.sql.type ) {
        case "literal": 
            return {
                sql: {
                    type: "path",
                    value: '$' + walk.param
                },
                param: walk.param + 1,
                params: [walk.sql.value ,...walk.params]
            }
        case "path": return walk
        case "negation": 
            const arg = walk.sql.arg
            const argWalked = walkSqlExpressionInternal({ ...walk, sql: arg })
            return {
                ...argWalked,
                sql: {
                    type: "negation",
                    arg: argWalked.sql
                }
            }
        case "binary":
            const arg1 = walk.sql.arg1
            const arg2 = walk.sql.arg2
            const arg1Walked = walkSqlExpressionInternal({...walk, sql: arg1})
            const arg2Walked = walkSqlExpressionInternal({...arg1Walked, sql: arg2})
            return {
                ...arg2Walked,
                sql: {
                    type: "binary",
                    operator: walk.sql.operator,
                    arg1: arg1Walked.sql,
                    arg2: arg2Walked.sql
                }
            }
        case "function": 

            /** @type { (acc: WalkResult<SqlExpression[]>, curr: SqlExpression ) => WalkResult<SqlExpression[]> } */
            const walkFunctionF = (acc, curr) => {
                const walkedSqlExpression = walkSqlExpressionInternal({...acc, sql: curr})
                return {
                    ...walkedSqlExpression,
                    sql: [...acc.sql, walkedSqlExpression.sql]
                }
            }
            
            /** @type { WalkResult<SqlExpression[]> } */
            const start = {...walk, sql: []}

            const walkReduced = walk.sql.args.reduce(walkFunctionF, start)
            return {
                ...walkReduced,
                sql: {
                    ...walk.sql,
                    args: walkReduced.sql
                }
            }
    }
}

/**
 * @param { SqlExpression } sqlExpression
 * @returns { WalkResult<SqlExpression> } 
 */ 
export function walkSqlExpression(sqlExpression) {

    /** @type {WalkResult<SqlExpression>} */
    const walk = {
        sql: sqlExpression,
        param: 1,
        params: [],
    }

    return walkSqlExpressionInternal(walk)
}

/**
 * @param { WalkResult<SelectQuery> } walk
 * @returns { WalkResult<SelectQuery> }
 */
export function walkSelectQueryInternal(walk) {

    /** @type { (acc: WalkResult<import("./Sql").Field[]>, curr: import("./Sql").Field) => WalkResult<import("./Sql").Field[]> } */
    const walkFieldsF = (acc, curr) => {

        const expr = {
            ...acc,
            sql: curr.expression
        }

        const walkedExpression = walkSqlExpressionInternal(expr)

        return {
            ...walkedExpression,
            sql: [...acc.sql, { ...curr, expression: walkedExpression.sql}]
        }

    }

    const walkFields = walk.sql.fields.reduce(walkFieldsF, {...walk, sql: []})

    /** @type { (acc: WalkResult<FromItem[]>, curr: FromItem) => WalkResult<FromItem[]> } */
    const walkFromsF = (acc, curr) => {

        /** @type { () => WalkResult<FromItem["from"]> } */
        const walkFrom = () => {
            if (typeof curr.from === "string") {
                return {
                    ...acc,
                    sql: curr.from 
                }
            } else {
                return walkSelectQueryInternal({
                    ...acc,
                    sql: curr.from
                })
            }
        }
        const walkResultFrom = walkFrom()

        /** @type {(acc: WalkResult<Join[]>, curr: Join) => WalkResult<Join[]>} */
        const walkJoinsF = (accJoins, currJoin) => {
            const result = walkSqlExpressionInternal({
                ...accJoins,
                sql: currJoin.on,
            })
            return {
                ...result,
                sql: [...accJoins.sql, {
                    ...currJoin,
                    on: result.sql
                }]
            }
        } 

        const walkResultJoins = curr.joins.reduce(walkJoinsF, {
            ...walkResultFrom,
            sql: [],
        })

        return {
            ...walkResultJoins,
            sql: [...acc.sql, {
                from: walkResultFrom.sql,
                joins: walkResultJoins.sql,
            }]
        }

    }

    const walkFroms = walk.sql.froms.reduce(walkFromsF, {
        ...walkFields,
        sql: [],
    })

    const walkWhere = walk.sql.where === null ? {...walkFroms, sql: null} : walkSqlExpressionInternal({ ...walkFroms, sql: walk.sql.where})

    return {
        ...walkWhere,
        sql: {
            ...walk.sql,
            froms: walkFroms.sql,
            where: walkWhere.sql
        }
    }

}

/**
 * @param { SelectQuery } sq
 * @returns { WalkResult<SelectQuery> }
 */
export function walkSelectQuery(sq) {
    return walkSelectQueryInternal({
        params: [],
        param: 0,
        sql: sq,
    })
}

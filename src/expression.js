import { Column } from "./column";

/**
 * @template A
 */
export class Expression {
  /**
   * @param { A } type
   * @param { import("./Sql").SqlExpression } sql
   */
  constructor(type, sql) {
    this.type = type;
    this.sql = sql;
  }

  /**
   * @param { Expression<"boolean"> } expr2 
   * @returns { Expression<"boolean"> }
   */
  AND = (expr2) => {
    /** @type { import("./Sql").BinaryOperation } */
    const sql = {
      type: "binary",
      operator: "and",
      arg1: this.sql,
      arg2: makeExpression(expr2),
    }
    // @ts-ignore
    return new Expression(null, sql)
  }

  /**
   * @param { Expression<"boolean"> } expr2 
   * @returns { Expression<"boolean"> }
   */
  OR = (expr2) => {
    /** @type { import("./Sql").BinaryOperation } */
    const sql = {
      type: "binary",
      operator: "or",
      arg1: this.sql,
      arg2: makeExpression(expr2),
    }
    // @ts-ignore
    return new Expression(null, sql)
  }

}

/**
 * 
 * @param {import("./column").Column<any, any> | any} expression 
 * @returns {import("./Sql").SqlExpression}
 */
function makeExpression (expression) {
  if (expression instanceof Column) {
    return expression.value
  } else {
    return {
      type: "literal",
      value: expression,
    }
  }
}

/**
 * @template Arg1
 * @template Arg2
 * @param {Arg1} arg1
 * @param {Arg2} arg2
 * @param { import("./Sql").Operator } op
 * @returns {import("./Expression").BoolOp<Arg1, Arg2, Expression<"boolean">>}
 */
function binOp(arg1, arg2, op) {

  /** @type { import("./Sql").BinaryOperation } */
  const sql = {
    type: "binary",
    operator: op,
    arg1: makeExpression(arg1),
    arg2: makeExpression(arg2),
  }

  // @ts-ignore
  return new Expression(null, sql);
}

/**
 * @template Arg1
 * @template Arg2
 * @param {Arg1} arg1
 * @param {Arg2} arg2
 * @returns {import("./Expression").BoolOp<Arg1, Arg2, Expression<"boolean">>}
 */
export function gt(arg1, arg2) {
  return binOp(arg1, arg2, "gt")
}

/**
 * @template Arg1
 * @template Arg2
 * @param {Arg1} arg1
 * @param {Arg2} arg2
 * @returns {import("./Expression").BoolOp<Arg1, Arg2, Expression<"boolean">>}
 */
export function eq(arg1, arg2) {
  return binOp(arg1, arg2, "eq")
}
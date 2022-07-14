import { Column } from "./column";

/**
 * 
 * @param {import("./column").Column<any, any> | any} expression 
 * @returns {import("./Sql").SqlExpression}
 */
export function makeExpression (expression) {
  if (expression instanceof Column) {
    return expression.value
  } else {
    return {
      type: "literal",
      value: expression,
      dbType: null,
    }
  }
}

/**
 * @template Arg1
 * @template Arg2
 * @param {Arg1} arg1
 * @param {Arg2} arg2
 * @param { import("./Sql").CharOperator } op
 * @returns {import("./Expression").BoolOp<Arg1, Arg2>}
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
  return new Column((x) => x, null, sql)
}

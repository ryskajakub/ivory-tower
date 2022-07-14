import { makeExpression } from "./expression";

/**
 * @template DbType
 * @template {import("./Column").ColumnState} State
 */
export class Column {
  /**
   * @param {(dbType: DbType) => import("./Column").TsType<DbType>} dbType
   * @param {State} state
   * @param {import("./Sql").SqlExpression} value
   */
  constructor(dbType, state, value) {
    /* @readonly @protected */
    this.dbType = dbType;
    /* @readonly @protected */
    this.state = state;
    /* @readonly @protected */
    this.value = value;
  }

  /**
   * @template {string} As
   * @param {As} as
   * @returns {NamedColumn<DbType, State, As>}
   */
  AS = (as) => {
    return new NamedColumn(this.dbType, this.state, this.value, as);
  };

  /**
   * @template T
   * @param { import("./Sql").CharOperator } operator
   * @param { T } operand
   * @returns { import("./Expression").Op<DbType, State, T> }
   */
  op = (operator, operand) => {
    /** @type { import ("./Sql").SqlExpression } */
    const literal = {
      type: "literal",
      dbType: null,
      value: operand,
    };

    /** @type {import("./Sql").SqlExpression} */
    const sqlExpression = {
      type: "binary",
      arg1: this.value,
      arg2: literal,
      operator,
    };

    // @ts-ignore
    return new Column((x) => x, this.state, sqlExpression);
  };

  /**
   * @template { import("./Column").SingleState } State2
   * @param { Column<"boolean", State2> } expr2
   * @returns {import("./Expression").BoolOpFlat<DbType, State, "boolean", State2>}
   */
  AND = (expr2) => {
    /** @type { import("./Sql").BinaryOperation } */
    const sql = {
      type: "binary",
      operator: "AND",
      arg1: this.value,
      arg2: makeExpression(expr2),
    }
    // @ts-ignore
    return new Expression(null, sql)
  }
}

/**
 * @template DbType
 * @template {import("./Column").ColumnState} State
 * @template {string} Name
 * @extends Column<DbType, State>
 */
export class NamedColumn extends Column {
  /**
   * @param {(dbType: DbType) => import("./Column").TsType<DbType>} dbType
   * @param {State} state
   * @param {import("./Sql").SqlExpression} value
   * @param {Name} name
   */
  constructor(dbType, state, value, name) {
    super(dbType, state, value);
    /* @readonly */
    this.name = name;
  }
}

import { makeExpression } from "./expression";
import { Query } from "./orderBy";
import { anyFormFunction } from "./sql";

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
    return this.opInternal(operator, operand)
  }

  /**
   * @template T
   * @param { import("./Sql").Operator } operator
   * @param { T } operand
   * @returns { import("./Expression").Op<DbType, State, T> }
   */
  opInternal = (operator, operand) => {

    /** @type {() => import("./Sql").SqlExpression} */
    const mkExpression = () => {
      if (operand instanceof Column) {
        return operand.value
      } else {
        /** @type { import ("./Sql").SqlExpression } */
        const literal = {
          type: "literal",
          dbType: null,
          value: operand,
        };
        return literal
      }
    }

    /** @type {import("./Sql").SqlExpression} */
    const sqlExpression = {
      type: "binary",
      arg1: this.value,
      arg2: mkExpression(),
      operator,
    };

    // @ts-ignore
    return new Column((x) => x, this.state, sqlExpression);
  };

  /**
   * @template { import("./Column").SingleState } State2
   * @param { Column<"boolean", State2> } expr2
   * @returns { import("./Expression").Op<DbType, State, Column<"boolean", State2>> }
   */
  AND = (expr2) => {
    return this.opInternal("AND", expr2)
  }

  /**
   * @template T
   * @param {T} arrayOrQuery 
   * @returns {import("./Column").InResult<T, DbType, State>}
   */
  IN = (arrayOrQuery) => {

    if (arrayOrQuery instanceof Query) {
      
      const query = /** @type { Query<any> } */ (arrayOrQuery)

      /** @type { import("./Sql").SqlExpression } */
      const querySqlExpression = {
        type: "queryExpression",
        query: query.getSql()
      }

      /** @type { import("./Sql").SqlExpression } */
      const sqlExpression = {
        type: "binary",
        operator: "IN",
        arg1: this.value,
        arg2: querySqlExpression
      }

      /** @type { Column<import("./Column").Boolean, State> } */
      const result = new Column((x) => x, this.state, sqlExpression)

      // @ts-ignore
      return result

    } else {
      const array = /** @type {any[]} */ (Array.isArray(arrayOrQuery) ? arrayOrQuery : [arrayOrQuery])

      /** @type { import("./Sql").SqlExpression[] } */
      const lits = array.map(a => ({
        type: "literal",
        value: a,
        dbType: null,
      }))

      /** @type { import("./Sql").SqlExpression } */
      const sqlExpression = anyFormFunction(/** @type {const} */ ([this.value, ...lits]))(([col, ...lits], printExpression) => {

        const printedArgs = lits.map(e => printExpression(e)).join(", ")

        return `${printExpression(col)} IN(${printedArgs})`
      })

      /** @type { Column<import("./Column").Boolean, State> } */
      const result = new Column((x) => x, this.state, sqlExpression)

      // @ts-ignore
      return result

    }
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

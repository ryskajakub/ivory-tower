import { Column } from "./column";
import { printCondition, replaceValueWithColumn } from "./sql";
import { Table } from "./table";
import { walkSqlExpression } from "./walk";

/**
 * @template T
 */
export class Delete {
  /**
   * @param {Table<T>} table
   */
  constructor(table) {
    this.table = table;
  }

  /**
   * @param {(ab: import("./From").FromTable<T>) => Column<"boolean", "selectable"> } mkCondition
   * @returns { { sql: string, params: any[] } }
   */
  WHERE = (mkCondition) => {
    const table = this.table.def;

    // @ts-ignore
    const columns = replaceValueWithColumn(table);

    // @ts-ignore
    const condition = mkCondition(columns)

    const walkedCondition = walkSqlExpression(condition.value)
    const printedCondition = printCondition(walkedCondition.sql)

    return {
        sql: `DELETE FROM ${this.table.name} WHERE ${printedCondition}`,
        params: walkedCondition.params
    }

  };
}

/**
 * @template T
 * @extends Delete<T>
 */
export class DeleteWhere extends Delete {}

/**
 * @template T
 * @param {Table<T>} table
 * @returns { Delete<T> }
 */
export function DELETE_FROM(table) {
  return new Delete(table);
}

import { NamedColumn, Column, literal } from "./column";

/**
 * @template { Column<any, import("./Column").Aggregable> } T
 * @param {T} column
 * @returns { import("./column").Column<import("./Aggregate").Max<T>, import("./Column").Aggregated> }
 */
export function MAX(column) {
  const value = literal(`MAX(${column.value.value})`);
  return new Column(column.dbType, "aggregated", value);
}

/**
 * @template { Column<any, import("./Column").Aggregable> } T
 * @param {T} column
 * @returns { import("./column").Column<import("./Aggregate").Min<T>, import("./Column").Aggregated> }
 */
export function MIN(column) {
  const value = literal(`MIN(${column.value.value})`);
  return new Column(column.dbType, "aggregated", value);
}

/**
 * @template { Column<any, import("./Column").Aggregable> } T
 * @param {T} column
 * @returns { import("./column").Column<import("./Aggregate").Avg<T>, import("./Column").Aggregated> }
 */
export function AVG(column) {
  const value = literal(`MIN(${column.value.value})`);
  return new Column(column.dbType, "aggregated", value);
}

/**
 * @template { Column<any, import("./Column").Aggregable> } T
 * @param {T} column
 * @returns { import("./column").Column<import("./Aggregate").Sum<T>, import("./Column").Aggregated> }
 */
export function SUM(column) {
  const value = literal(`SUM(${column.value.value})`);
  return new Column(column.dbType, "aggregated", value);
}

/**
 * @template { Column<any, import("./Column").Aggregable> } T
 * @param {T} column
 * @returns { import("./column").Column<import("./Aggregate").ArrayAgg<T>, import("./Column").Aggregated> }
 */
export function ARRAY_AGG(column) {
  const value = literal(`ARRAY_AGG(${column.value.value})`);
  return new Column(column.dbType, "aggregated", value);
}

/**
 * @template { Column<string | number, import("./Column").Aggregable> } U
 * @template V
 * @template { Column<V, import("./Column").Aggregable> } W
 * @param {U} column1
 * @param {W} column2
 * @returns { Column<Record<string, import("./Column").TsType<V>>, import("./Column").Aggregated> }
 */
export function JSON_OBJECT_AGG(column1, column2) {
  const value = literal(`JSON_OBJECT_AGG(${column1.value.value}, ${column1.value.value})`)
  // @ts-ignore
  return new Column(null, "aggregated", value)
}

/**
 * @template T
 * @template { Column<T, import("./Column").Aggregable> } U
 * @param {U} column
 * @returns { Column<T[], import("./Column").Aggregated> }
 */
export function JSON_AGG(column) {
  const value = literal(`JSON_AGG(${column.value.value})`)
  // @ts-ignore
  return new Column(null, "aggregated", value)
}

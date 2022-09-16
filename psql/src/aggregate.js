import { NamedColumn, Column } from "./column";
import { path } from "./sql";

/**
 * @template { Column<any, import("./Column").Aggregable> } T
 * @param {T} column
 * @returns { import("./column").Column<import("./Aggregate").Max<T>, import("./Column").Aggregated> }
 */
export function MAX(column) {
  /** @type {import("./Sql").SqlFunction} */
  const fun = {
    type: "function",
    name: "MAX",
    args: [column.value]
  }
  return new Column(column.dbType, "aggregated", fun);
}

/**
 * @template { Column<any, import("./Column").Aggregable> } T
 * @param {T} column
 * @returns { import("./column").Column<import("./Aggregate").Min<T>, import("./Column").Aggregated> }
 */
export function MIN(column) {
  /** @type {import("./Sql").SqlFunction} */
  const fun = {
    type: "function",
    name: "MIN",
    args: [column.value]
  }
  return new Column(column.dbType, "aggregated", fun);
}

/**
 * @template { Column<any, import("./Column").Aggregable> } T
 * @param {T} column
 * @returns { import("./column").Column<import("./Aggregate").Avg<T>, import("./Column").Aggregated> }
 */
export function AVG(column) {
  /** @type {import("./Sql").SqlFunction} */
  const fun = {
    type: "function",
    name: "AVG",
    args: [column.value]
  }
  return new Column(column.dbType, "aggregated", fun);
}

/**
 * @template { Column<any, import("./Column").Aggregable> } T
 * @param {T} column
 * @returns { import("./column").Column<import("./Aggregate").Sum<T>, import("./Column").Aggregated> }
 */
export function SUM(column) {
  /** @type {import("./Sql").SqlFunction} */
  const fun = {
    type: "function",
    name: "SUM",
    args: [column.value]
  }
  return new Column(column.dbType, "aggregated", fun);
}

/**
 * @template { Column<any, import("./Column").Aggregable> } T
 * @param {T} column
 * @returns { import("./column").Column<import("./Aggregate").ArrayAgg<T>, import("./Column").Aggregated> }
 */
export function ARRAY_AGG(column) {
  /** @type {import("./Sql").SqlFunction} */
  const fun = {
    type: "function",
    name: "ARRAY_AGG",
    args: [column.value]
  }
  return new Column(column.dbType, "aggregated", fun);
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
  /** @type {import("./Sql").SqlFunction} */
  const fun = {
    type: "function",
    name: "JSON_OBJECT_AGG",
    args: [column1.value, column2.value]
  }
  // @ts-ignore
  const transformer = (obj) => {
    const keys = Object.keys(obj)
    return keys.reduce((acc, key) => {
      return {
        ...acc,
        [key]: column2.dbType(obj[key])
      }
    }, {})
  }
  // @ts-ignore
  return new Column(transformer, "aggregated", fun)
}

/**
 * @template T
 * @param { Column<T, import("./Column").Aggregable> } column
 * @returns { Column<T[], import("./Column").Aggregated> }
 */
export function JSON_AGG(column) {

  /** @type {import("./Sql").SqlFunction} */
  const fun = {
    type: "function",
    name: "JSON_AGG",
    args: [column.value]
  }
  // @ts-ignore
  const transformer = (arr) => {
    // @ts-ignore
    return arr.map(element => column.dbType(element))
  }
  // @ts-ignore
  return new Column(transformer, "aggregated", fun)

}

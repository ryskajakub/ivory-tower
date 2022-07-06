import { Query } from "./orderBy";
import { print } from "./sql";

// @ts-ignore
import pkg from "pg";
import { walkSelectQuery } from "./walk";
const { Client } = pkg;

/**
 * @param {{[key: string]: import("./column").Column<any, any>}} columns 
 * @returns { (row: any) => any }
 */
function transformer(columns) {
  return (row) => {
    const keys = Object.keys(columns)
    keys.reduce((acc, key) => {
      const column = columns[key]
      const entry = row[key]
      const result = column.dbType(entry)
      return {
        ...acc,
        [key]: result
      }
    }, {})
  }
}

/**
 * @template { {[key: string]: import("./column").Column<any, any>} } T
 * @param { Query<T> } query
 * @returns { Promise<import("./Run").Ran<T>> }
 */
export async function runQuery(query) {
  const client = new Client({
    user: "db",
    database: "db",
    host: "127.0.0.1",
    port: 5433,
    password: "db",
  });
  await client.connect();
  const sql = query.getSql();
  const walk = walkSelectQuery(sql)
  const sqlString = print(walk.sql);
  const params = walk.params
  const res = await client.query(sqlString, params);
  await client.end();
  const transformedRows = transformer(query.getColumns())(res.rows)
  return transformedRows
}

/**
 * @param {string } rawQuery
 * @returns { Promise<any> }
 */
export async function runRaw(rawQuery) {
  const client = new Client({
    user: "db",
    database: "db",
    host: "127.0.0.1",
    port: 5433,
    password: "db",
  });
  await client.connect();
  const result = await client.query(rawQuery);
  await client.end();
  return result
}

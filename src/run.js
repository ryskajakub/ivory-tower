import { Query } from "./orderBy";
import { print } from "./sql";

import { walkSelectQuery } from "./walk";

// @ts-ignore
import pg from "pg"
const { Client } = pg;

/**
 * @param {{[key: string]: import("./column").Column<any, any>}} columns
 * @returns { (row: any) => any }
 */
export function transformer(columns) {
  return (row) => {
    const keys = Object.keys(columns);
    keys.reduce((acc, key) => {
      const column = columns[key];
      const entry = row[key];
      const result = column.dbType(entry);
      return {
        ...acc,
        [key]: result,
      };
    }, {});
  };
}

/**
 * @template Row
 * @template HasResult
 * @param { (query: string, params: any[]) => Promise<import("pg").QueryResult> } runQuery
 * @param {import("./Runnable").QueryAndParams<Row, HasResult>} queryAndParams
 * @returns { Promise<import("./Runnable").Result<Row, HasResult>> }
 */
export async function getResult(runQuery, queryAndParams) {
  const result = await runQuery(queryAndParams.query, queryAndParams.params);
  // @ts-ignore
  if (queryAndParams.transformer) {
    // @ts-ignore
    return result.rows.map((r) => queryAndParams.transformer(r));
  }
  // @ts-ignore
  return;
}

/**
 * @returns { Client }
 */
export function getClient() {
  const client = new Client({
    user: "db",
    database: "db",
    host: "127.0.0.1",
    port: 5433,
    password: "db",
  });
  return client
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
  const walk = walkSelectQuery(sql);
  const sqlString = print(walk.sql);
  const params = walk.params;
  const res = await client.query(sqlString, params);
  await client.end();
  const transformedRows = transformer(query.getColumns())(res.rows);
  return transformedRows;
}

/**
 * @param {string } rawQuery
 * @param { any= } [params]
 * @returns { Promise<any> }
 */
export async function runRaw(rawQuery, params) {
  const client = new Client({
    user: "db",
    database: "db",
    host: "127.0.0.1",
    port: 5433,
    password: "db",
  });
  await client.connect();
  const result = params
    ? await client.query(rawQuery, params)
    : await client.query(rawQuery);
  await client.end();
  return result;
}

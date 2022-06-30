import { Query } from "./orderBy";
import { print } from "./sql";

// @ts-ignore
import pkg from "pg";
const { Client } = pkg;

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
  const sqlString = print(sql, 0);
  const res = await client.query(sqlString);
  await client.end();
  return res.rows;
}

/**
 * @param {string } rawQuery
 * @returns { Promise<void> }
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
  await client.query(rawQuery);
  await client.end();
}

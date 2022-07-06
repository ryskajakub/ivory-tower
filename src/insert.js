import { Table } from "./table"

import { print } from "./sql";

// @ts-ignore
import pkg from "pg";
import { walkSelectQuery } from "./walk";
const { Client } = pkg;

/**
 * @template T
 * @param {Table<T>} t 
 * @param {import("./Table").InsertType<T>} data 
 * @returns { Promise<void> }
 */
export async function insert(t, data) {
  const client = new Client({
    user: "db",
    database: "db",
    host: "127.0.0.1",
    port: 5433,
    password: "db",
  });
  await client.connect();
  const keys = Object.keys(data)

  // @ts-ignore
  const definedKeys = keys.filter(key => data[key] !== undefined)

  const keysString = definedKeys.join(", ")

  const variables = [...Array(definedKeys.length).keys()].map(
      k => `\$${k + 1}`
  ).join(", ")

  // @ts-ignore
  const values = definedKeys.map(k => data[k])

  const sqlString = `INSERT INTO ${t.name}(${keysString}) VALUES(${variables})`

  await client.query(sqlString, values)

  await client.end();
}


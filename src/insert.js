import { Table } from "./table"

import { print } from "./sql";

import * as pg from 'pg'
const { Client } = pg

import { walkSelectQuery } from "./walk";

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

/**
 * @template T
 * @param {Table<T>} table 
 * @param {import("./Table").InsertType<T>} data 
 * @returns { import("./Runnable").QueryAndParams<void, false> }
 */
export function ins(table, data) {

  const keys = Object.keys(data)

  // @ts-ignore
  const definedKeys = keys.filter(key => data[key] !== undefined)

  const keysString = definedKeys.join(", ")

  const variables = [...Array(definedKeys.length).keys()].map(
      k => `\$${k + 1}`
  ).join(", ")

  // @ts-ignore
  const values = definedKeys.map(k => data[k])

  const sqlString = `INSERT INTO ${table.name}(${keysString}) VALUES(${variables})`

  // @ts-ignore
  return {
    params: values,
    query: sqlString
  }

}
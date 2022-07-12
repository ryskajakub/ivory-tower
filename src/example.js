import { FROM } from "./from"

import { Table } from "./table"

import { print } from "./sql"
import { SELECT } from "./select"
import { JSON_AGG, MAX, MIN } from "./aggregate"
import { getClient, getResult, runQuery, runRaw } from "./run"
import { eq, gt } from "./expression"
import { insert, INSERT_INTO } from "./insert"
import { create } from "./schema"
import { JSON_BUILD_OBJECT } from "./function"
import { Column } from "./column"

/**
 * @template T
 * @typedef {import("./Table").TableType<T>} TableType
 */

/**
 * @typedef {{ manufacturer: { id: "smallint" | undefined, name: "text" }}} Manufacturer
 */

/** @type {TableType<Manufacturer>} */
const manufacturerDef = {
    manufacturer: {
        id: {
            type: "smallint",
            default: {
                type: "serial",
            },
        },
        name: {
            type: "text",
        }
    }
}

/**
 * @typedef {{ model: { id: "smallint" | undefined, manufacturer_id: "smallint", name: "text", launch_date: "date" } }} Model
 */

/** @type {TableType<Model>} */
const modelDef = {
    model: {
        id: {
            type: "smallint",
            default: {
                type: "serial"
            },
        },
        name: {
            type: "text",
        },
        manufacturer_id: {
            type: "smallint"
        },
        launch_date: {
            type: "date"
        }
    }
}

/**
 * @typedef {{ car: { id: "smallint" | undefined, color: "text", plate: "text" | null, registered: "date", model_id: "smallint" } }} Car
 */

/** @type {TableType<Car>} */
const carDef = {
    car: {
        id: {
            type: "smallint",
            default: {
                type: "serial"
            },
        },
        color: {
            type: "text",
        },
        plate: {
            nullable: true,
            type: "text",
        },
        registered: {
            type: "date"
        },
        model_id: {
            type: "smallint",
        }
    }
}

const manufacturers = new Table(manufacturerDef)
const models = new Table(modelDef)
const cars = new Table(carDef)

/** @type { (query: string, params: any[]) => Promise<import("pg").QueryResult> } */
const q = async (query, params) => {
    const client = getClient()
    await client.connect();
    const result = await client.query(query, params)
    await client.end();
    return result;
}

const initDb = async () => {

    await getResult(q, create(manufacturers, { drop: true }))
    await getResult(q, create(models, { drop: true }))
    await getResult(q, create(cars, { drop: true }))

    await getResult(q, INSERT_INTO(manufacturers, /** @type {const} */(["id", "name"])).VALUES([1, "BMW"]))
    await getResult(q, INSERT_INTO(manufacturers, /** @type {const} */(["id", "name"])).VALUES([2, "Skoda"]))
    await getResult(q, INSERT_INTO(manufacturers, /** @type {const} */(["id", "name"])).VALUES([2, "Ford"]))

    await getResult(q, INSERT_INTO(models, /** @type {const} */ (["id", "name", "launch_date", "manufacturer_id"])).VALUES([1, "330i", new Date(2008, 1, 1), 1]))
    await getResult(q, INSERT_INTO(models, /** @type {const} */ (["id", "name", "launch_date", "manufacturer_id"])).VALUES([2, "430i", new Date(2016, 1, 1), 1]))
    await getResult(q, INSERT_INTO(models, /** @type {const} */ (["id", "name", "launch_date", "manufacturer_id"])).VALUES([3, "Octavia", new Date(1999, 1, 1), 2]))

    await getResult(q, INSERT_INTO(cars, /** @type {const} */(["id", "color", "plate", "registered", "model_id"])).VALUES([1, "silver", "7P8-3108", new Date(2018, 1, 1), 1]))
    await getResult(q, INSERT_INTO(cars, /** @type {const} */(["id", "color", "plate", "registered", "model_id"])).VALUES([2, "blue", "1A1-1234", new Date(2020, 1, 1), 1]))
    await getResult(q, INSERT_INTO(cars, /** @type {const} */(["id", "color", "plate", "registered", "model_id"])).VALUES([3, "black", "9A9-2345", new Date(2022, 1, 1), 2]))

}

await initDb()

/** @type { Column<"smallint", any> } */
// @ts-ignore
const abc = null

// const t = JSON_BUILD_OBJECT((["n", abc]))

const q1 = 
    SELECT((t) => [t.manufacturer.name.AS("manufacturer_name"), JSON_AGG(JSON_BUILD_OBJECT(/** @type {const} */ (["name", t.mode.name, "date", t.mode.launch_date]))).AS("model_names")],
    FROM(manufacturers)
        .JOIN(models).AS("mode").ON(t => eq(t.manufacturer.id, t.mode.manufacturer_id))
        .GROUP_BY(t => [t.manufacturer.name])
    )

const qap = q1.getQueryAndParams()

console.log(qap.query)
console.log(qap.params)

const result = await getResult(q, qap)
console.log(JSON.stringify(result, undefined, 2))

/*
const q01 = SELECT(ab => [ab.people.name], FROM(persons))
const q0 = q01.AS("xyz")

const result = await runQuery(q01)

console.log(result)

const q2 =
    SELECT((t) => [t.xxx.id, MAX(t.xxx.owner_id).AS("abc")],
        FROM(persons)
            .LEFT_JOIN(pets).AS("xxx").ON(t => eq(t.xxx.owner_id, t.people.id).AND(eq(t.xxx.id, 5)))
            .JOIN(pets).ON(t => gt(t.pets.id, 5))
            .GROUP_BY(t => [t.xxx.id])
    )
    .ORDER_BY(ab => [ab.id])
    .LIMIT(1)
    .OFFSET(1)

// const result2 = await runQuery(q2)
console.log(print(q2.getSql()))
// console.log(result2)

// const result = await runRaw(`select 1, 2, age, json_object_agg(id, inserted) from people group by age`)
const result = await runRaw(`select * from people`)
console.log(result.rows)
*/

/**
 * @template {Readonly<any[]>} T
 * @param {T} x 
 * @returns T
 */
function lol(...x) {
    return x
}

const t = lol(1)
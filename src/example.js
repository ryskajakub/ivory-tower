import { FROM } from "./from"

import { Table } from "./table"

import { print } from "./sql"
import { SELECT } from "./select"
import { JSON_AGG, MAX, MIN } from "./aggregate"
import { getClient, getResult, runQuery, runRaw } from "./run"
import { insert, INSERT_INTO } from "./insert"
import { create } from "./schema"
import { JSON_BUILD_OBJECT } from "./function"
import { Column } from "./column"
import { SUBSTRING } from "./function/string"

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
    await getResult(q, INSERT_INTO(manufacturers, /** @type {const} */(["id", "name"])).VALUES([3, "Ford"]))

    await getResult(q, INSERT_INTO(models, /** @type {const} */ (["id", "name", "launch_date", "manufacturer_id"])).VALUES([1, "330i", new Date(2008, 1, 1), 1]))
    await getResult(q, INSERT_INTO(models, /** @type {const} */ (["id", "name", "launch_date", "manufacturer_id"])).VALUES([2, "430i", new Date(2016, 1, 1), 1]))
    await getResult(q, INSERT_INTO(models, /** @type {const} */ (["id", "name", "launch_date", "manufacturer_id"])).VALUES([3, "Octavia", new Date(1999, 1, 1), 2]))

    await getResult(q, INSERT_INTO(cars, /** @type {const} */(["id", "color", "plate", "registered", "model_id"])).VALUES([1, "silver", "7P8-3108", new Date(2018, 1, 1), 1]))
    await getResult(q, INSERT_INTO(cars, /** @type {const} */(["id", "color", "plate", "registered", "model_id"])).VALUES([2, "blue", "1A1-1234", new Date(2020, 1, 1), 1]))
    await getResult(q, INSERT_INTO(cars, /** @type {const} */(["id", "color", "plate", "registered", "model_id"])).VALUES([3, "blue", "1A2-2345", new Date(2021, 1, 1), 1]))
    await getResult(q, INSERT_INTO(cars, /** @type {const} */(["id", "color", "plate", "registered", "model_id"])).VALUES([4, "black", "9A9-2345", new Date(2022, 1, 1), 2]))
    await getResult(q, INSERT_INTO(cars, /** @type {const} */(["id", "color", "plate", "registered", "model_id"])).VALUES([5, "yellow", "9A8-2345", new Date(2022, 1, 1), 3]))

}

await initDb()

const q0 =
    SELECT(t => [t.model.id, MAX(t.model.manufacturer_id).AS("manufacturer_id"), MAX(t.model.name).AS("name"), MAX(t.model.launch_date).AS("ld"), JSON_AGG(JSON_BUILD_OBJECT(/** @type {const} */(['reg', t.c.registered, 'plate', t.c.plate]))).AS("cars1")],
        FROM(models)
            .JOIN(cars).AS("c").ON(t => (t.c.model_id).op("=", t.model.id))
            .WHERE(t => SUBSTRING(/** @type {const} */ ([t.c.plate, "FROM", 2, "FOR", 1])).op("=", "A"))
            .GROUP_BY(t => [t.model.id])
    )

const q1 = SELECT(
    t => [t.mcq.manufacturer_id, JSON_AGG(JSON_BUILD_OBJECT( /** @type {const} */ (['cars', t.mcq.cars1, 'name', t.mcq.name]))).AS("models")] , 
    FROM(q0.AS("mcq"))
        .GROUP_BY(t => [t.mcq.manufacturer_id])
    )

const q2 = 
    SELECT((t) => [t.manufacturer.id, t.manufacturer.name, t.mcq0.models],
    FROM(manufacturers)
        .JOIN(q1.AS("mcq0")).ON(t => t.manufacturer.id.op("=", t.mcq0.manufacturer_id))
    )
    .ORDER_BY(t => [t.id])

const qap = q2.getQueryAndParams()

console.log("Query:")
console.log(qap.query)

console.log(("Params:"))
console.log(qap.params)

const result = await getResult(q, qap)
console.log("Result:")
console.log(JSON.stringify(result, undefined, 2))

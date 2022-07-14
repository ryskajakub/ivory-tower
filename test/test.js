// @ts-ignore
import pg from "pg";
const { Client } = pg;

import { exec } from "child_process";
import { Table } from "../src/table";
import { create } from "../src/schema";
import { getResult } from "../src/run";
import { INSERT_INTO } from "../src/insert";
import { SELECT } from "../src/select";
import { FROM } from "../src/from";
import { JSON_AGG } from "../src/aggregate";
import { JSON_BUILD_OBJECT } from "../src/function";



/**
 * @typedef {{ manufacturer: { id: "smallint" | undefined, name: "text" }}} Manufacturer
 */

/** @type {import("../src/Table").TableType<Manufacturer>} */
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

/** @type {import("../src/Table").TableType<Model>} */
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

/** @type {import("../src/Table").TableType<Car>} */
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
// @ts-ignore
let q = null

/** @type { any } */
let client = null

beforeAll(async () => {
  const tryConnect = async () => {
    try {
      client = new Client({
        user: "db",
        database: "db",
        host: "127.0.0.1",
        port: 5434,
        password: "db",
      });
      await client.connect();
      q = (query, params) => client.query(query, params)
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
      await tryConnect();
    }
  };

  const runDockerCompose = () => {
    exec("docker-compose --file docker-compose-test.yml up");
  };

  const insertData = async () => {

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

  runDockerCompose();
  await tryConnect();
  await insertData()

});

afterEach(async () => {
  await client.end();
  const down = exec("docker-compose --file docker-compose-test.yml down");
  await new Promise((resolve) => {
    down.on("close", (code) => {
      resolve(code);
    });
  });
});

test("date in json gets transformed to Date object", async () => {
    
    const query = SELECT(t => [t.model.manufacturer_id, JSON_AGG(JSON_BUILD_OBJECT( /** @type {const} */ (["launch_date", t.model.launch_date]))).AS("models") ] , 
        FROM(models)
            .GROUP_BY(t => [t.model.manufacturer_id])
    )

    const result = await getResult(q, query.getQueryAndParams())
    result.forEach(
        row => row.models.forEach(
            model => {
                expect(model.launch_date.getFullYear()).toBeDefined()
            }
        )
    )

});

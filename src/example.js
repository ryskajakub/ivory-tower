import { FROM } from "./from"

import { Table } from "./table"

import { print } from "./sql"
import { SELECT } from "./select"
import { MAX, MIN } from "./aggregate"
import { getClient, getResult, runQuery, runRaw } from "./run"
import { eq, gt } from "./expression"
import { insert, INSERT_INTO } from "./insert"
import { create } from "./schema"

/**
 * @typedef {{ people: { id: "smallint" | undefined, name: "text", age: "integer" | null | undefined , registered: "date" }}} Person
 */

/**
 * @typedef {{ pets: { id: "smallint" | undefined, owner_id: "smallint", name: "text", race_id: "smallint" } }} Pet
 */

/**
 * @typedef {{ races: { id: "smallint" | undefined, name: "text", discovered: "date" } }} Race
 */

/**
 * @template T
 * @typedef {import("./Table").TableType<T>} TableType
 */

/** @type {TableType<Person>} */
const personsDef = {
    people: {
        id: {
            type: "smallint",
            default: {
                type: "serial",
            },
        },
        name: {
            type: "text",
        },
        age: {
            type: "integer",
            nullable: true,
            default: "555"
        },
        registered: {
            type: "date"
        }
    }
}

/** @type {TableType<Pet>} */
const petsDef = {
    pets: {
        id: {
            type: "smallint",
            default: {
                type: "serial"
            },
        },
        name: {
            type: "text",
        },
        owner_id: {
            type: "smallint"
        },
        race_id: {
            type: "smallint"
        }
    }
}

/** @type {TableType<Race>} */
const raceDef = {
    races: {
        id: {
            type: "smallint",
            default: {
                type: "serial"
            },
        },
        name: {
            type: "text",
        },
        discovered: {
            type: "date"
        }
    }
}

const persons = new Table(personsDef)
const pets = new Table(petsDef)
const races = new Table(raceDef)

/** @type { (query: string, params: any[]) => Promise<import("pg").QueryResult> } */
const q = async (query, params) => {
    const client = getClient()
    await client.connect();
    const result = await client.query(query, params)
    await client.end();
    return result;
}

const initDb = async () => {

    await getResult(q, create(persons, { drop: true }))
    await getResult(q, create(pets, { drop: true }))
    await getResult(q, create(races, { drop: true }))

    const personsFields = /** @type {const} */ (["id", "name", "age", "registered"])

    await getResult(q, INSERT_INTO(persons, personsFields).VALUES([1, "franta", 15, new Date (2020, 1, 1)]))
    await getResult(q, INSERT_INTO(persons, personsFields).VALUES([2, "pepa", 20, new Date (2021, 1, 1)]))
    await getResult(q, INSERT_INTO(persons, personsFields).VALUES([3, "karel", 20, new Date (2021, 1, 1)]))

    await getResult(q, INSERT_INTO(races, /** @type {const} */ (["id", "name", "discovered"])).VALUES([1, "bulldog", new Date(1900, 1, 1)]))
    await getResult(q, INSERT_INTO(races, /** @type {const} */ (["id", "name", "discovered"])).VALUES([1, "goldfish", new Date(900, 1, 1)]))

    await getResult(q, INSERT_INTO(pets, /** @type {const} */(["id", "name", "owner_id", "race_id"])).VALUES([1, "winston", 1, 1]))
    await getResult(q, INSERT_INTO(pets, /** @type {const} */(["id", "name", "owner_id", "race_id"])).VALUES([2, "happiness", 1, 2]))
    await getResult(q, INSERT_INTO(pets, /** @type {const} */(["id", "name", "owner_id", "race_id"])).VALUES([3, "luck", 2, 2]))

}

await initDb()

const q1 = 
    SELECT((t) => [t.people.id],
    FROM(persons)
        .JOIN(pets).ON(t => eq(t.people.id, t.pets.owner_id))
        .JOIN(races).ON(t => eq(t.pets.race_id, t.races.id))
        .GROUP_BY(t => [t.people.id])
    )

const result = getResult(q, q1.getQueryAndParams())

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

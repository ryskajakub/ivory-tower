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
 * @typedef {{ pets: { id: "smallint" | undefined, owner_id: "smallint", name: "text" } }} Pet
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
        }
    }
}

const persons = new Table(personsDef)
const pets = new Table(petsDef)


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

    INSERT_INTO(persons, /** @type {const} */ (["id", "name", "age", "registered"])).VALUES([1, "franta", 15, new Date (2020, 1, 1)]) 

    /*
    await runRaw(`
    drop table if exists people;

    create table people(
        id serial,
        name varchar not null,
        age integer,
        birth_date date
    );

    drop table if exists pets;
    create table pets(
        id integer,
        owner_id integer
    );
    insert into pets (id, owner_id) values(1, 1);
    insert into pets (id, owner_id) values(2, 2);
    `)    

    await runRaw(`
    insert into pets (id, owner_id) values(3, \$1);
    `, [255])
    */


    // await insert(persons, {name: "lojza"})
    // await insert(persons, {name: "pepa"})
    // await insert(persons, {name: "karel"})


}

    // const x = INSERT_INTO(persons, /** @type {const} */ (["name", "id"])).VALUES(["lojza", 3])
    // console.log(x)

await initDb()
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

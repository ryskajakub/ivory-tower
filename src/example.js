import { FROM } from "./from"
import { Table } from "./table"
import { eq as eq, print } from "./sql"
import { SELECT } from "./select"
import { MAX, MIN } from "./functions"
import { runQuery, runRaw } from "./run"

/**
 * @typedef {{ people: { id: "smallint" | undefined, name: "text" | null, age: "integer" | null | undefined }}} Person
 */

/**
 * @typedef {{ pets: { id: "smallint" | undefined, owner_id: "smallint" } }} Pet
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
            default: "auto",
        },
        name: {
            type: "text",
            nullable: true,
        },
        age: {
            type: "integer",
            nullable: true,
            default: 3
        }
    }
}

/** @type {TableType<Pet>} */
const petsDef = {
    pets: {
        id: {
            type: "smallint",
            default: "auto",
        },
        owner_id: {
            type: "smallint"
        }
    }
}

const initDb = async () => {
    await runRaw(`
    drop table if exists people;
    create table people(
        id integer,
        name varchar(255),
        age integer
    );
    insert into people (id, name, age) values(1, 'John', 20);
    insert into people (id, name, age) values(2, 'Mary', 25);
    insert into people (id, name, age) values(3, 'Bob', 30);

    drop table if exists pets;
    create table pets(
        id integer,
        owner_id integer
    );
    insert into pets (id, owner_id) values(1, 1);
    insert into pets (id, owner_id) values(2, 2);
    insert into pets (id, owner_id) values(3, 1);

    `)    
}

const persons = new Table(personsDef)
const pets = new Table(petsDef)

const q01 = SELECT(ab => [ab.people.name], FROM(persons))
const q0 = q01.AS("xyz")

await initDb()
const result = await runQuery(q01)
console.log(result)

const q2 =
    SELECT((ab) => [ab.pets.id, MAX(ab.pets.owner_id).AS("owner_id_max")],
        FROM(persons)
            .LEFT_JOIN(pets).ON(ab => eq(ab.pets.owner_id, ab.people.id))
            .GROUP_BY(ab => [ab.pets.id])
    )
    .ORDER_BY(ab => [ab.id])
    .LIMIT(1)
    .OFFSET(1)

const result2 = await runQuery(q2)
console.log(print(q2.getSql(), 0))
console.log(result2)

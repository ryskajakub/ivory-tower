import { From, FROM } from "./from"
import { Table } from "./table"
import { eq } from "./sql"
import { SELECT } from "./select"
import { MAX } from "./functions"
import { insertRow } from "./write"

/**
 * @typedef {{ persons: { id: "smallint" | undefined, name: "text" | null, age: "integer" | null | undefined, address: "text", }}} Person
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
    persons: {
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
        },
        address: {
            type: "text"
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

const persons = new Table(personsDef)
const pets = new Table(petsDef)

insertRow(persons, {})

const q1 =
    SELECT((ab) => [ab.persons.address, ab.lol.owner_id, ab.lol.id],
        FROM(persons)
            .LEFT_JOIN(pets).AS("lol").ON((ab) => eq(ab.persons.id, ab.lol.id))
            // .JOIN(pets).AS("xxx").ON((ab) => eq(ab.xxx., ab.persons.name))
            // .GROUP_BY((ab) => [ab.persons.id])
    )

    const t =
    SELECT(ab => [ab.persons.age],
        FROM(persons)
        .LATERAL_item(pets).JOIN(persons).AS("lol").ON(ab => ab.lol)

    )

// const q01 = 
    // SELECT((ab) => [ab.volove.id, ab.volove.owner_id],
    // )



    /*
const q2 =
    SELECT((ab) => [ab.persons.id, MAX(ab.persons.age)],
        FROM(persons)
            .JOIN(pets).ON((ab) => eq(ab.persons.id, ab.pets.owner_id))
            .JOIN(pets).AS("xxx").ON((ab) => eq(ab.xxx.owner_id, ab.persons.id))
            .GROUP_BY((ab) => [ab.persons.id])
    )
    .ORDER_BY(ab => [ab.age, ab.id.ASC()])
    .LIMIT(3)
    .OFFSET(3)
    .AS("subquery")
    */


/*
const q =
    SELECT((a) => { return [ a.pets.id, a.pets.owner_id ] } ,
        FROM(persons)
            .JOIN(pets, (ab) => eq(ab.persons.id, ab.pets.owner_id))
            .item(persons).JOIN(pets, (ab) => eq(ab.persons_id, ab.pets.owner_id))
            .WHERE((a) => eq(a.persons.id, literal(2)))
            .GROUP_BY((a) => [a.persons.id])
            .HAVING()
    )
*/

// console.log(JSON.stringify(q, undefined, 2))
import { FROM } from "./from"
import { Table } from "./table"
import { eq as eq, print } from "./sql"
import { SELECT } from "./select"
import { simple_MAX } from "./functions"
import { runQuery } from "./run"

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

const persons = new Table(personsDef)
const pets = new Table(petsDef)

const q01 = SELECT(ab => [ab.people.name], FROM(persons))
const q0 = q01.AS("xyz")
// console.log(print(q0.getSql(), 0))

const result = await runQuery(q01)
console.log(result)

const q1 =
    SELECT((ab) => [ab.pets.id, simple_MAX(ab.pets.owner_id).AS("owner_id_max")],
        FROM(persons)
            .JOIN(pets).AS("p2").ON((ab) => eq(ab.people.id, ab.p2.owner_id))
            .LEFT_JOIN(pets).AS("p").ON(ab => eq(ab.p.id, ab.p.id))
            .item(pets)
            .item(q0)
            .WHERE(ab => eq(ab.people.id, ab.pets.owner_id))
            .GROUP_BY(ab => [ab.pets.id])
    )
    .ORDER_BY(ab => [ab.id])
    .LIMIT(5)
    .OFFSET(5)

// console.log(print(q1.getSql(), 0))

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
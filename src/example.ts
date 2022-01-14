import { Table } from "./table"
import { FROM } from "./from"
import { eq } from "./sql"
import { literal } from "./column"
import { SELECT } from "./select"

type Person =
    {
        persons: {
            id: "smallint" | undefined,
            name: "text" | null,
            age: "integer" | null | undefined,
            address: "text",
        }
    }

type Pet =
    {
        pets: {
            id: "smallint" | undefined,
            owner_id: "smallint",
        }
    }

const persons: Table<Person> = {
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

const pets: Table<Pet> = {
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

const q =
    SELECT((a) => { return [ a.pets.id, a.pets.owner_id ] } ,
        FROM(persons)
            .JOIN(pets, (ab) => eq(ab.persons.id, ab.pets.owner_id))
            .WHERE((a) => eq(a.persons.id, literal(2)))
            .GROUP_BY((a) => [a.persons.id])
    )

console.log(JSON.stringify(q, undefined, 2))
// @ts-nocheck

import pkg from 'pg'

const { Client } = pkg

const client = new Client()
await client.connect()

// const res = await client.query("select jsonb_build_object('id', id, 'age', age, 'pets', foo.data) as result from people, lateral (select owner_id, jsonb_agg(jsonb_build_object('id', id, 'name', name)) as data from pets group by owner_id) as foo where foo.owner_id = people.id")
// const res = await client.query("select  as now")
const res = await client.query("select * from people cross join people p")
console.log(JSON.stringify(res.rows, undefined, 2)) 
await client.end()
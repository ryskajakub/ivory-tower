// import { queryClient, queryEndpoint, xxx } from "./description.mjs";

import { entity } from "./entity.mjs";
import { graph } from "./graph.mjs";

import * as ite from "./entity.mjs"

// const x = queryEndpoint("abc",
//     {
//         type: "object",
//         values: {
//             x: "Date",
//             y: "string",
//             z: {
//                 type: "array",
//                 values: "string"
//             },
//             t: {
//                 type: "many",
//                 query: "Date"
//             },
//             w: {
//                 type: "at_least_one",
//                 query: {
//                     type: "object",
//                     values: {
//                         www: "Date"
//                     }
//                 }
//             }
//         }
//     }
// )

// const client = queryClient(x, { t: "*", w: { www: "*" } })

const field = ite.string.nullable().optional()

const book = {
    id: ite.number,
    name: ite.string,
    isbn: ite.string.nullable(),
}

const review = {
    id: ite.entity,
    text: ite.string,
}

const queryPart = graph(
    {
        book,
        review
    }, (entities) => [
        entities.
    ]
)

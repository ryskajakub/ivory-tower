import { inspect } from "util";
import * as it from "../api/src/index";
import { select } from "../api/src/query";
import { Server } from "../api/src/server";

import { PrismaClient } from '@prisma/client'
import { Tables } from "../db/src/table";
import { FROM } from "../db/src/from";
import { SELECT } from "../db/src/select";

const book = {
  name: it.string,
  isbn: it.string.nullable(),
};

const review = {
  text: it.string,
};

const author = {
  name: it.string,
  surname: it.string,
};

const user = {
  password: it.string,
  handle: it.string,
  age: it.number,
};

const genre = {
  name: it.string,
};

const entities = {
  book,
  review,
  author,
  user,
  genre,
};

export const bookShop = it.api(
  entities,
  (entities) =>
    [
      entities.review.manyToOne(entities.book),
      entities.book.manyToMany(entities.author),
      entities.author.toOne(entities.user),
      entities.book.manyToMany(entities.genre),
    ] as const
);

const tables = new Tables(bookShop).tables()

  const result = 
    FROM(tables.user)
      .CROSS_JOIN(tables.user).AS("user2")
      .JOIN(tables.author).AS("a").ON(x => x.)
      // .JOIN(tables.author).AS("a")
    
    
    // .AS("ttt")
    // .AS("ttt")
    // .
    // .JOIN(tables.author).ON(x => x.ttt.id)
    // .GROUP_BY([""])

  // const s = SELECT(["tttt.id", "xxxx.*"], 
  //   FROM(tables.book)
  //     .AS("tttt")
  //     .JOIN(tables.author).AS("xxxx").ON(x => x.tttt.id = x.xxxx.name)
  //     // .JOIN(tables.genre).AS("yyy").ON(q => q.yyy.id = q.tttt.isbn)
  // )
  // const s = SELECT(["tttt.id", "xxxx.*"], 
  //   FROM(tables.book)
  //     .AS("tttt")
  //     .JOIN(tables.author).AS("xxxx").ON(x => x.tttt.id = x.xxxx.name)
  //     // .JOIN(tables.genre).AS("yyy").ON(q => q.yyy.id = q.tttt.isbn)
  // )

// const server = new Server(bookShop);


// const result = await server.call({
//   books: {
//     mode: "object",
//     select: ["name", "isbn"],
//     where: (x) => x.name["="]("Padesát odstínů šedi"),
//     relations: {
//       reviews: {
//         mode: "object",
//         select: ["text"]
//       },
//     }
//   },
//   reviews: {
//     relations: {
//       book: {
//         select: ["isbn"],
//       }
//     }
//   }
// });

// console.error(JSON.stringify(result, undefined, 2));

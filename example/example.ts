import { inspect } from "util";
import * as it from "../api/src/index";
import { Server } from "../api/src/server";
import { print } from "../db/src/print";

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
  handle: it.string
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

// console.log("inspected")
// console.log(inspect(bookShop.entities, true, null))

// @ts-ignore
const insp = (x) => inspect(x, true, null)
const insp2 = (x: any) => JSON.stringify(x, undefined, 2)
// const selects = it.serve(bookShop, {  })
// const selects = it.serve(bookShop, { 
//   authors: { surname: true, user: {} } ,
//   users: { password: true, handle: true, author: {} } ,
//   reviews: { text: true, book: { name: true } }
//   books: { name: true, reviews: {} }
//   books: { name: true, authors: { name: true, user: {} }, reviews: { text: true } }
//   authors: { name: true, books: { isbn: true, name: true} },
//   books: { name: true, isbn: true, reviews: { text: true }, authors: { surname: true } }
// })

const server = new Server(bookShop)

const result = await server.call({ users: { author: { } } })
// const result = await server.call({ authors: { user: { } } })
// const result = await server.call({ reviews: { book: { } } })
// const result = await server.call({ books: { authors: { } }, authors: { books: {} } })
// const result = await server.call({ genres: {} } )

console.log(insp2(result))

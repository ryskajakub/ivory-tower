import { inspect } from "util";
import * as it from "../api/src/index";
import { select } from "../api/src/query";
import { Server } from "../api/src/server";

import { PrismaClient } from '@prisma/client'

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

const server = new Server(bookShop);

const result = await server.call({
  books: {
    mode: "object",
    select: ["name", "isbn"],
    where: (x) => x.name["="]("Padesát odstínů šedi"),
    relations: {
      reviews: {
        mode: "object",
        select: ["text"]
      },
    }
  },
  reviews: {
    relations: {
      book: {
        select: ["isbn"],
      }
    }
  }
});

console.error(JSON.stringify(result, undefined, 2));

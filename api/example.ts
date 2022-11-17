import { call } from "./client";
import * as it from "./index";

const book = {
  name: it.string,
  isbn: it.string.nullable(),
};

const review = {
  text: it.string,
};

const author = {
  name: it.string,
};

const user = {
  password: it.string,
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

const api = it.api(
  entities,
  (entities) =>
    [
      entities.review.manyToOne(entities.book),
      entities.book.manyToMany(entities.author),
      entities.user.fromOne(entities.author),
      entities.book.manyToMany(entities.genre),
    ] as const
);

const result = call(api, true as const);
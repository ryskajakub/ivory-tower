import * as it from "../api/src/index";

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


export const bookShop = it.api(
  entities,
  (entities) =>
    [
      entities.review.manyToOne(entities.book),
      entities.book.manyToMany(entities.author),
      entities.user.fromOne(entities.author),
      entities.book.manyToMany(entities.genre),
    ] as const
);

// console.log("inspected")
// console.log(inspect(api, true, null))

// it.serve(api)

// const result = call(api, {
//   reviews: { where: ({ text }) => text["="]("abc"), select: { text: true } },
//   authors: { name: true },
// } as const);


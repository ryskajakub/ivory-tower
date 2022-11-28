# ivory-tower

Type safe db querying

## Example

Define some database tables:
```
import * as it from "../api/src/index";
const book = {
  name: it.string,
  isbn: it.string.nullable(),
};

const review = {
  text: it.string,
};
const entities = {
  book,
  review,
};
```
Define relations between them:
```
export const bookShop = it.api(
  entities,
  (entities) =>
    [
      entities.review.manyToOne(entities.book),
    ] as const
);
```
After starting up everything with `docker-compose up` we can generate the tables into database with `docker-compose exec example bash -c 'npm run migrate'`
```
const server = new Server(bookShop);
const result = await server.call({
  books: {
    relations: {
      reviews: {
        select: ["text"]
      },
    }
  },
  reviews: {
    relations: {
      book: {
        select: ["isbn"]
      }
    }
  }
});
console.error(JSON.stringify(result, undefined, 2));
```
This query will return this result:
```
{
  "books": [
    {
      "reviews": [
        {
          "text": "Srdeční záležitost. Není to čtení pro každého. Ale kdo má rád román se sexuální tématikou, tak se zde určitě najde. Doporučuji!!"
        },
        {
          "text": "Zvládla jsem jen tři kapitoly, jak je to neuvěřitelně nudné a blbé, hlavní hrdinka především. Ani jsem se nedostala k zajímavějším pasážím, ale to se prostě nedá."
        },
        {
          "text": "Za mě zbytečný povyk okolo téhle série. Já bych si knihu už neprecetla. Musela jsem se nutit abych ji vůbec docetla."
        }
      ]
    },
    {
      "reviews": []
    }
  ],
  "reviews": [
    {
      "book": {
        "isbn": null
      }
    },
    {
      "book": {
        "isbn": null
      }
    },
    {
      "book": {
        "isbn": null
      }
    }
  ]
}
```

## query builder

Goals

1. ability to run any query with correct type
1. getting close to sql syntax
1. autocompletion where possible
1. refine types based on some expressions (indexes, outer joins, id fields ...)

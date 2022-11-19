import { createMigrations, printMigrations } from "../api/src/migration"
import { bookShop } from "./example"

console.log(`
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
`)

console.log(printMigrations(createMigrations(bookShop)))

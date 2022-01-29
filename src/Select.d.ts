import { SelectQuery } from "./Sql";

export interface Selectable<T> {
    getSelectable: () => T
    getSql: () => SelectQuery
}
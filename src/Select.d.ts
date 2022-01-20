import { PreSelect } from "./Sql";

export interface Selectable<T> {
    selectable: () => T
}
export type Path = {
    type: "path",
    path: string,
}

export type Column<Db> = Path | Literal

type Literal = {
    type: "literal",
    value: any,
}

type TsType<Db> = Db extends "smallint" ? number :
    Db extends "integer" ? number :
    Db extends "text" ? string :
    never

type DbType<Ts> = Ts extends number ? "smallint" | "integer" :
    Ts extends string ? "text" :
    never

export function path(str: string): Path {
    return {
        type: "path",
        path: str,
    }
}

export function literal<A>(value: A): Column<DbType<A>> {
    return {
        type: "literal",
        value,
    }
}
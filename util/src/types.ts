
export type TupleToUnion<T extends readonly any[]> = T[number]

export type ExpandType<T> = {} & {
    [K in keyof T]: T[K]
}

type Disjoint<A extends string, B extends string, Res> = Extract<A, B> extends never ? Res : Error<["union is not disjoint, conflicting key: ", Extract<A, B>]>

export type Error<Errors extends unknown[]> = {
    errors: Errors
}

export type DisjointUnion<Obj1, Obj2> = Obj1 extends Record<string, any> ? (
    Obj2 extends Record<string, any> ? (
        (keyof Obj1 extends string ?
            (keyof Obj2 extends string ? Disjoint<keyof Obj1, keyof Obj2, Obj1 & Obj2> : Error<[]>
            ) : Error<[]>
        )
    ) : Error<[]>
) : Error<[]>

export type RenameSingleKeyObject<T, Name extends string> = {
    [K in keyof T as Name]: T[K]
}

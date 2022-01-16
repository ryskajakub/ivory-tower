type Disjoint<A, B> = Extract<A, B> extends never ? true : false

export type DisjointUnion<Obj1, Obj2> = Obj1 extends Record<string, any> ? (
    Obj2 extends Record<string, any> ? (
        Disjoint<keyof Obj1, keyof Obj2> extends true ? (Obj1 & Obj2) : never
    ) : never
) : never

export type AnyIntersection<A, B> = Extract<A, B> extends never ? false : true

export type IfAnyIntersection<A, B, IfTrue> = AnyIntersection<A, B> extends never ? never : IfTrue

type BNotContainsA<A, B extends any[]> = B["length"] extends 0 ?
    true :
    B extends [infer First, ...infer Rest] ?
    (A extends First ? false : BNotContainsA<A, Rest>)
    : never

export type IsUniqueTuple<A extends any[]> =
    A["length"] extends 0 ? true :
    A extends [infer First, ...infer Rest] ?
    (BNotContainsA<First, Rest> extends true ? IsUniqueTuple<Rest> : false)
    : never
export type TupleToUnion<T> =
    T extends readonly []
      ? never
      : (T extends readonly [infer First, ...infer Rest]
            ? First | TupleToUnion<Rest>
            : never);

export type ExpandType<T> = {} & {
    [K in keyof T]: T[K]
}
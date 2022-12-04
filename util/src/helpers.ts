export type AnyRecord = Record<string, any>;

export function mapValues<A>(
  a: AnyRecord,
  f: ((values: any) => any) | ((value: any, key: string) => any)
): AnyRecord {
  return Object.fromEntries(
    Object.entries(a).map(([key, value]) => [key, f(value, key)])
  );
}

export type TupleToUnion<T extends readonly unknown[]> = T[number]

export interface HKT<Default = unknown> {
    readonly A?: object
    readonly B: this["A"] extends Default ? this["A"] : Default
    readonly type: unknown
}

export type Kind<hkt extends HKT, A> =
    (hkt & {
        A: A
    })["type"]

// interface S extends HKT {
//     readonly type: Array<this["A"]>
// }

// type T<T2, hkt extends HKT> = T2 extends string ? Kind<hkt, "string"> : Kind<hkt, "lol">

// type X = T<number, S>

export function mapObject<T, U>(a: Record<string, T>, f: (key: string, value: T) => [string, U]): Record<string, U> {
    return Object.fromEntries(Object.entries(a).map(([key, value]) => {
        return f(key, value)
    }))
}

export function mapNull<A, B>(a: A | null, f: (a: A) => B): B | null {
    if (a === null) {
        return null
    } else {
        return f(a)
    }
}

export function nullToArray<A>(a: A | null): A[] {
    if (a === null) {
        return []
    } else {
        return [a]
    }
}

export function defaultMap<A, B>(a: A | null, b: B, f: (a: A) => B): B {
    if (a === null) {
        return b
    } else {
        return f(a)
    }
}

export function undefinedToNull<A>(a: A | undefined): A | null {
    if (a === undefined) {
        return null
    } else {
        return a
    }
}

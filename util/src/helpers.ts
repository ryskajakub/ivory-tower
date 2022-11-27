export type AnyRecord = Record<string, any>;

export function mapValues<A>(
  a: AnyRecord,
  f: ((values: any) => any) | ((value: any, key: string) => any)
): AnyRecord {
  return Object.fromEntries(
    Object.entries(a).map(([key, value]) => [key, f(value, key)])
  );
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

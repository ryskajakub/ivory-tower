export type AnyRecord = Record<string, any>;

export function mapValues<A>(
  a: AnyRecord,
  f: ((values: any) => any) | ((value: any, key: string) => any)
): AnyRecord {
  return Object.fromEntries(
    Object.entries(a).map(([key, value]) => [key, f(value, key)])
  );
}

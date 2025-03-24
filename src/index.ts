// expands object types recursively
type ExpandRecursively<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: ExpandRecursively<O[K]> }
    : never
  : T;

const tables = {
  pet: [
    ["id", { type: "int" }],
    ["name", { type: "text", nullable: true }],
    ["owner_id", { type: "int" }],
  ],
  person: [
    ["id", { type: "int" }],
    ["name", { type: "text" }],
  ],
} as const;

type AggState = "Pre" | "Post" | "No";

// class AliasExp<Path, Alias, Type, State extends AggState> { }

interface Exp<Type extends PgType> {
  pgType: PgType;
}

type AnyExp = Exp<any>;

class PathExp<Path extends string, Type extends PgType, State extends AggState>
  implements Exp<Type>
{
  pgType: Type;
  type: "path_extp";
}

type AnyPathExp = PathExp<any, any, any>;

class AliasExp<Alias, Type extends PgType, State extends "Post" | "No">
  implements Exp<Type>
{
  pgType: Type;
  type: "alias_exp";
  state: State;
}

type AnyAliasExp = AliasExp<any, any, any>;

type MkAliasExp<
  T extends string,
  Type extends PgType,
  State extends AggState
> = State extends "Post" | "No" ? AliasExp<T, Type, State> : unknown;

class LitExp<Type extends PgType, State extends AggState> implements Exp<Type> {
  pgType: Type;
  type: "lit";
  AS = <T extends string>(name: T): MkAliasExp<T, Type, State> => {
    // @ts-ignore
    return null;
  };
}

type AnyLitExp = LitExp<any, any>;

// @ts-ignore
const x: Exp<"abc", "def", "No"> = null;

// class AliasExp<Path>

class JsonB<T> {
  t: T;
}

type PgType = "int" | "text" | JsonB<any> | null;

// type MkJsonBArrayAggType<T extends PgType> = T extends "int"
//   ? JsonB<number[]>
//   : T extends "text"
//   ? JsonB<string[]>
//   : T extends JsonB<infer U>
//   ? JsonB<U[]>
//   : never;

type MkJsonBArrayAggType<T extends PgType> = JsonB<MkJsonBType<T>[]>;

type MkJsonBType<T extends PgType> = null extends T
  ? null | MkJsonBTypeNoNull<T>
  : MkJsonBTypeNoNull<T>;

type MkJsonBTypeNoNull<T extends PgType> = T extends "int"
  ? number
  : T extends "text"
  ? string
  : T extends JsonB<infer U>
  ? U
  : never;

type JsonbAggResult<T extends PathExp<any, PgType, "Pre" | "No">> =
  T extends PathExp<any, infer Type extends PgType, any>
    ? LitExp<MkJsonBArrayAggType<Type>, "Post">
    : unknown;

const jsonb_agg = <T extends PathExp<any, any, "Pre" | "No">>(
  exp: T
  // ): JsonbAggResult<T>["type"] extends PgType ? LitExp<JsonbAggResult<T>["type"]> : unknown => {
): JsonbAggResult<T> => {
  // @ts-ignore
  return null;
};

// type XXXX = JsonbAggResult<PathExp<any, "text", "No">>

type MkJsonBuildObject<T extends any[], Result> = T["length"] extends 0
  ? JsonB<Result>
  : T extends [infer Name extends string, infer E, ...infer Rest]
  ? E extends Exp<any>
    ? MkJsonBuildObject<Rest, Result & { [K in Name]: MkJsonBType<E["pgType"]> }>
    : never
  : never;

type DEF = MkJsonBType<"text">;

type ABC = MkJsonBuildObject<
  [
    "name",
    PathExp<any, "text", any>,
    "id",
    PathExp<any, "int", any>,
    "js",
    PathExp<any, JsonB<number[]>, any>
  ],
  {}
>;

const jsonb_build_object = <const T extends any[]>(
  t: T
): MkJsonBuildObject<T, {}> => {
  // @ts-ignore
  return null;
};

type Lit = number | string;

type MkLit<T extends Lit> = T extends number
  ? PathExp<any, "int", "No">
  : T extends string
  ? PathExp<any, "text", "No">
  : never;

const mkLit = <T extends Lit>(t: T): MkLit<T> => {
  // @ts-ignore
  return null;
};

// type XXX = JsonbAggResult<PathExp<any, "int", "Pre">>;

// const ttttt = jsonb_agg()

// type SelExp = AliasExp<any, any, any, "Post" | "No">;

// type X = { [keyof M]: string }

type TablesType = Record<string, readonly (readonly [string, TableColumn])[]>;

// type UnReadonlyObj<T> = {
//     -readonly [K in keyof T]: T[K]
// }

// type UnReadonly<T> = {
//     -readonly [K in keyof T]: T[K] extends readonly (readonly[infer A, infer B])[] ? [A, B] : never
// }

// type abc = UnReadonly<typeof tables>

// type TableNames<Table extends TablesType> = keyof Table

// class Join<Tables extends TablesType, Selected> {}

// JOIN = <T extends keyof Tables>(table: T): T
// JOIN = <T extends keyof Tables, Options extends { AS: string }>(table: T, options: Options) => {
//     return null
// }

// class Db<Tables extends TablesType> {

//     tables: Tables

//     constructor(tables: Tables) {
//         this.tables = tables
//     }

//     FROM = <T extends keyof Tables>(table: T): From<Tables, Record<T, T>> => {
//         // @ts-ignore
//         return null
//     }

// }

interface TableColumn {
  type: "text" | "int";
  nullable?: true;
}

// type T = {
//     [K in keyof ]
// }

type MkColumns<Table extends readonly any[]> = Table["length"] extends 0
  ? {}
  : Table extends readonly [
      readonly [infer ColName extends string, infer ColType],
      ...infer Rest
    ]
  ? {
      [K in ColName]: ColType;
    } & MkColumns<Rest>
  : never;

// type XXX = MkColumns<[["abc", { type: "text" }], ["tef", { type: "int" }]]>;

type C = readonly [any, any];

type MkTables<
  Tables extends Record<string, any>,
  Froms extends readonly C[]
> = Froms["length"] extends 0
  ? {}
  : Froms extends readonly [
      readonly [infer Name extends keyof Tables, infer Alias extends string],
      ...infer Rest extends readonly (readonly [keyof Tables, string])[]
    ]
  ? {
      [K in Alias]: MkColumns<Tables[Name]>; //MkColumns<Tables[Name]>;
    } & MkTables<Tables, Rest>
  : never;

type TTT = MkTables<
  typeof tables,
  readonly [readonly ["person", "person"], readonly ["pet", "p"]]
>;

// @ts-ignore
// const x: TTT = null;

// x.person.
// x.

// type t = 132 & unknown

type MkType<T extends TableColumn> =
  //   | (T extends "text" ? "text" : "int")
  //   | T extends { nullable: true }
  //   ? null
  //   : never;
  T["type"] extends "text"
    ? "text"
    : "int" | (T["nullable"] extends true ? null : never);

type MkColumnExp<
  TableName extends string,
  ColumnName extends string,
  ColumnData extends TableColumn
> = PathExp<ColumnName, MkType<ColumnData>, "No">;

type MkQueryColumns<
  TableName extends string,
  Columns extends readonly C[]
> = Columns["length"] extends 0
  ? readonly []
  : Columns extends readonly [
      readonly [
        infer ColumnName extends string,
        infer ColumnData extends TableColumn
      ],
      ...infer Rest extends C[]
    ]
  ? readonly [
      readonly [ColumnName, MkColumnExp<TableName, ColumnName, ColumnData>],
      ...MkQueryColumns<TableName, Rest>
    ]
  : never;

type MkQueryTables<Tables extends Record<string, any>> = {
  [K in keyof Tables]: K extends string ? MkQueryColumns<K, Tables[K]> : never;
};

type TTT2 = MkQueryTables<typeof tables>;

class SelectAs<Exps extends readonly AnySelectable[], Name extends string> {
  type: "select_as";
}

class SelectAsExp<AnyS extends AnySelectable, Name extends string>
  extends SelectAs<AnyS[], Name>
  implements Exp<AnyS["pgType"]>
{
  pgType: AnyS["pgType"];
  type2: "select_as";
}

type AnySelectAsExp = SelectAsExp<any, any>;

type IsSingle<Exps extends readonly any[]> = Exps["length"] extends 1
  ? never
  : unknown;

type AllPostAgg<Exps extends readonly AnySelectable[]> = Exps extends readonly [
  AliasExp<any, any, "Post">
]
  ? never
  : unknown;

type MkSelectAs<T extends string, Exps extends readonly AnySelectable[]> =
  // [unknown, Exps] extends [IsSingle<Exps> | AllPostAgg<Exps>, infer Exp extends [infer OnlyOne extends AnySelectable]] ?
  [Exps["length"], Exps] extends [
    1,
    infer A extends [AliasExp<infer Name, infer Type, "Post">]
  ]
    ? SelectAsExp<AliasExp<Name, Type, "Post">, T>
    : unknown;

// type abcdef = AllPostAgg<readonly [AliasExp<any, any, "Post">]>;

class Select<Exps extends readonly AnySelectable[]> {
  AS = <T extends string>(alias: T): MkSelectAs<T, Exps> => {
    // @ts-ignore
    return null;
  };
}

// type T = true extends false ? 1 : 2

// type Ttt = never | unknown

// type AnySingleAsSelect = SelectAs<[any], any, never>;

// type AnySelectable = AnySingleAsSelect

// type XXX1 = readonly [SelectAs<any, any, false>] extends readonly (AnySingleAsSelect | AnyLitExp )[] ? 1 : 2

type MkSelect<Exps extends readonly AnySelectable[]> = Select<Exps>;

const mkDb = <Tables extends TablesType>(tables: Tables) => {
  type QueryTables = MkQueryTables<Tables>;

  class Join<Selected extends readonly (readonly [any, any])[]> {
    public JOIN<
      T extends keyof Tables,
      Options extends { AS: string },
      const Args extends readonly [T] | readonly [T, Options]
    >(...args: Args): JoinT<Selected, Args> {
      // @ts-ignore
      return null;
    }
  }

  type JoinT<
    Selected extends readonly (readonly [any, any])[],
    Args
  > = Args extends readonly [infer T, infer Options extends { AS: string }]
    ? Join<[...Selected, [T, Options["AS"]]]>
    : Args extends readonly [infer T]
    ? Join<[...Selected, [T, T]]>
    : never;

  const SELECT = <
    Froms extends readonly C[],
    const Q extends readonly AnySelectable[]
  >(
    // fun: <Q>(tables: Froms) => Q,
    fun: (tables: MkTables<QueryTables, Froms>) => Q,
    j: Join<Froms>
  ): MkSelect<Q> => {
    // @ts-ignore
    return null;
  };

  //   const x = SELECT(
  //     () => [null as unknown as SelectAs<any, any, unknown>],
  //     FROM("person")
  //   );

  return {
    FROM: <T extends keyof Tables>(table: T) => new Join<[[T, T]]>(),
    SELECT,
  };
};

// const SELECT = (from: From) => {
// }

const { FROM, SELECT } = mkDb(tables);

// type MkTables<Tables, Selected> =

type Expand<T> = T extends unknown ? { [K in keyof T]: Expand<T[K]> } : never;

const from = FROM("person")
  .JOIN("pet", { AS: "p" })
  .JOIN("person", { AS: "x" });

// type T = Expand<typeof from>

// const xxx = SELECT((x) => [x.person.id, x.person.name], FROM("person")).AS(
//   "abc"
// );

type AnySelectable = AnyPathExp | AnyAliasExp | AnySelectAsExp;

type NonNullableResult<Type extends PgType> = Type extends "text"
  ? string
  : Type extends "int"
  ? number
  : Type extends JsonB<infer A>
  ? A
  : unknown;

type ColResult<Type extends PgType> = null extends Type
  ? NonNullableResult<Type> | null
  : NonNullableResult<Type>;

// type XXX = ColResult<MkJsonBArrayAggType<"int">>;

type SelectResult<Exps extends readonly AnySelectable[]> =
  Exps["length"] extends 0
    ? []
    : Exps extends readonly [
        infer Head extends Exp<any>,
        ...infer Rest extends readonly AnySelectable[]
      ]
    ? [ColResult<Head["pgType"]>, ...SelectResult<Rest>]
    : never;

type SR = SelectResult<[AliasExp<"N", "int", "Post">]>

type ExpandedSelectResult<S extends Select<any>> = S extends Select<
  infer E extends readonly AnySelectable[]
>
  ? SelectResult<E>
  : unknown;

// type TTTTT = typeof xxx extends AnySingleAsSelect ? 1 : 3;
// type TTTTT = SelectAs<any, any, true> extends AnySingleAsSelect ? 1 : 3

// const f = SELECT(
//   (x) => [x.person.id, SELECT((x) => [jsonb_agg(x.person.id)], FROM("person")).AS("abc")],
//   FROM("person").JOIN("pet", { AS: "p" })
// );
const f = SELECT((t) => {
  const x = jsonb_agg(t.person.id).AS("person_ids");
  //   type T = typeof x;
  //   type MMM = typeof x extends Exp<infer Type> ? ColResult<Type> : never;
  return [x];
}, FROM("person"));

type AUAU = ExpandedSelectResult<typeof f>;

// const from = SELECT(FROM("person").JOIN("pets", { AS: "p" }));

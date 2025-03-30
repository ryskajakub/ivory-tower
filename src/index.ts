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

type Operator = "=" | ">=" | ">";

type mkResult<O extends Operator, T extends AggState> = FunExp<"boolean", T> &
  Boolean;

interface Operand<pgType extends PgType> {
  <O extends Operator, T extends AggState>(
    operator: O,
    that: Exp<pgType, T>
  ): mkResult<O, T>;
}

type mkOperand<T extends PgType> = "boolean" extends T ? Boolean : unknown;

interface Boolean {
  AND: <aggState extends AggState>(
    that: Exp<"boolean", AggState>
  ) => FunExp<"boolean", aggState>;
  OR: <aggState extends AggState>(
    that: Exp<"boolean", AggState>
  ) => FunExp<"boolean", aggState>;
}

interface GenericExpression<Type extends PgType, State extends AggState> {
  pgType: Type;
  aggState: State;
}

abstract class Exp<Type extends PgType, State extends AggState>
  implements GenericExpression<Type, State>
{
  pgType: Type;
  aggState: State;

  constructor(pgType: Type, aggState: State) {
    this.pgType = pgType;
    this.aggState = aggState;
  }
}

class SelectedColumn<Name extends string, Type extends PgType> {
  name: Name;
  type: Type;
}

type AnySelectedColumn = SelectedColumn<any, any>;

type AnyExp = Exp<any, any>;

class PathExp<
  Table extends string,
  Column extends string,
  Type extends PgType,
  State extends AggState
> extends Exp<Type, State> {
  type: "path_exp";
  table: Table;
  column: Column;
}

type AnyPathExp = PathExp<any, any, any, any>;

class AliasExp<
  Alias extends string,
  Type extends PgType,
  State extends "Post" | "No"
> extends Exp<Type, State> {
  type: "alias_exp";
  alias: Alias;
}

type AnyAliasExp = AliasExp<any, any, any>;

type MkAliasExp<
  T extends string,
  Type extends PgType,
  State extends AggState
> = State extends "Post" | "No" ? AliasExp<T, Type, State> : unknown;

class LitExp<Type extends PgType, State extends AggState> extends Exp<
  Type,
  State
> {
  type: "lit";
  AS = <T extends string>(name: T): MkAliasExp<T, Type, State> => {
    // @ts-ignore
    return null;
  };
}

type AnyLitExp = LitExp<any, any>;

class FunExp<Type extends PgType, State extends AggState> extends Exp<
  Type,
  State
> {
  AS = <T extends string>(name: T): MkAliasExp<T, Type, State> => {
    // @ts-ignore
    return null;
  };
}

type AnyFunExp = FunExp<any, any>;

type AnyNonAliasExp = AnyLitExp | AnyPathExp | AnyFunExp;

type NonAliasExp<Type extends PgType, State extends AggState> =
  | LitExp<Type, State>
  | PathExp<any, any, Type, State>
  | FunExp<Type, State>;

// @ts-ignore
const x: Exp<"abc", "def", "No"> = null;

// class AliasExp<Path>

// type JsonBType = string | number | null | JsonBType[] | Record<string, JsonBType> | "datestring"

class JsonB<T> {
  t: T;
}

type PgType =
  | "timestamp"
  | "boolean"
  | "int"
  | "text"
  | JsonB<any>
  | null
  | unknown;

// type MkJsonBArrayAggType<T extends PgType> = T extends "int"
//   ? JsonB<number[]>
//   : T extends "text"
//   ? JsonB<string[]>
//   : T extends JsonB<infer U>
//   ? JsonB<U[]>
//   : never;

type MkJsonBType<T extends PgType> = JsonB<ToJsonType<T>>

type ToJsonType<T extends PgType> = MkJsTypeNoNull<T, "stringdate">

type MkJsonBArrayAggType<T extends PgType> = JsonB<ToJsonType<T>[]>;

type MkJsTypeNoNull<T extends PgType, Timestamp> = T extends "int"
  ? number
  : T extends "text"
  ? string
  : T extends "boolean"
  ? boolean
  : T extends "timestamp"
  ? Timestamp
  : T extends JsonB<infer U>
  ? U
  : never;

type ToJsType<T extends PgType, Timestamp = Date> = null extends infer TT
  ? MkJsTypeNoNull<TT, Timestamp> | null
  : MkJsTypeNoNull<T, Timestamp>;

type JsonbAggResult<T extends NonAliasExp<PgType, "Pre" | "No">> =
  T extends AnyNonAliasExp
    ? FunExp<MkJsonBArrayAggType<T["pgType"]>, "Post">
    : unknown;

const jsonb_agg = <T extends AnyNonAliasExp>(
  exp: T
  // ): JsonbAggResult<T>["type"] extends PgType ? LitExp<JsonbAggResult<T>["type"]> : unknown => {
): JsonbAggResult<T> => {
  // @ts-ignore
  return null;
};

type AnyAggregableExp =
  | PathExp<any, any, any, "No" | "Pre">
  | LitExp<any, "Post" | "No">
  | FunExp<any, "Post" | "No">;

type ReplaceAggState<
  exp extends Exp<any, any>,
  aggState extends AggState
> = exp extends PathExp<infer A, infer B, infer C, any>
  ? PathExp<A, B, C, aggState>
  : exp extends LitExp<infer A, any>
  ? LitExp<A, aggState>
  : exp extends FunExp<infer A, any>
  ? FunExp<A, aggState>
  : never;

type MkSelectedColumn<ss extends SingleSelectable> = ss extends PathExp<
  any,
  infer Name,
  infer Type,
  any
>
  ? SelectedColumn<Name, Type>
  : ss extends AliasExp<infer Name, infer Type, any>
  ? SelectedColumn<Name, Type>
  : ss extends SubQuery<infer Name extends string, any, any, any>
  ? SelectedColumn<Name, ss["pgType"]>
  : never;

// exp extends PathExp<infer A, infer B, infer C, any>
//   ? PathExp<A, B, C, aggState>
//   : exp extends LitExp<infer A, any>
//   ? LitExp<A, aggState>
//   : exp extends FunExp<infer A, any>
//   ? FunExp<A, aggState>
//   : never;

// type abc = ReplaceAggState<PathExp<"person", "name", "text", "No">, "Post">

const max = <T extends AnyAggregableExp>(
  exp: T
): FunExp<T["pgType"], "Post"> => {
  // @ts-ignore
  return null;
};

// type XXXX = JsonbAggResult<PathExp<any, "text", "No">>

// type T<X> = X

type mkState<state extends AggState> = "Pre" extends state
  ? "Pre"
  : "Post" extends state
  ? "Post"
  : state;

type MkJsonBuildObjectGo<
  T extends any[],
  Result,
  State extends AggState
> = T["length"] extends 0
  ? FunExp<JsonB<ExpandRecursively<Result>>, State>
  : T extends [
      infer Name extends string,
      infer E extends AnyNonAliasExp,
      ...infer Rest
    ]
  ? MkJsonBuildObjectGo<
      Rest,
      Result & { [K in Name]: MkJsonBType<E["pgType"]> },
      State
    >
  : never;

type MkJsonBuildObject<T extends any[]> = MkJsonBuildObjectGo<T, {}, "No">;

type ABC = MkJsonBuildObject<
  [
    // "name",
    // PathExp<any, "text", "Post">,
    "id",
    PathExp<any, any, "int", "Pre">
    // "js",
    // FunExp<"text", "No">
  ]
>;

// type MMM = "Pre" | "Post" extends "Post" ? true : false;

// type MkFunExp<pgType extends PgType, >

const jsonb_build_object = <const T extends any[]>(
  ...t: T
): MkJsonBuildObject<T> => {
  // @ts-ignore
  return null;
};

type Lit = number | string;

type MkLit<T extends Lit> = T extends number
  ? PathExp<any, any, "int", "No">
  : T extends string
  ? PathExp<any, any, "text", "No">
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

type QueriedTableType = readonly (readonly [string, AnyPathExp])[];
type QueriedTablesType = Record<string, QueriedTableType>;

type MkColumns<
  Table extends readonly (readonly [string, any])[],
  Agg extends boolean,
  AggColumns extends string
> = Table["length"] extends 0
  ? {}
  : Table extends readonly [
      readonly [infer ColName extends string, infer ColType extends AnyPathExp],
      ...infer Rest extends readonly (readonly [string, any])[]
    ]
  ? {
      [K in ColName]: Agg extends true
        ? PathExp<
            ColType["table"],
            ColType["column"],
            ColType["pgType"],
            ColName extends AggColumns ? "Post" : "Pre"
          >
        : ColType & Operand<ColType["pgType"]> & mkOperand<ColType["pgType"]>;
    } & MkColumns<Rest, Agg, AggColumns>
  : never;

// type XXX = MkColumns<[["abc", { type: "text" }], ["tef", { type: "int" }]]>;
type XXX2 = MkColumns<
  [
    ["col1", PathExp<"abc", "col1", "int", "No">],
    ["col2", PathExp<"abc", "col2", "text", "No">]
  ],
  true,
  "col1"
>;

type T = [][number];

type C = readonly [any, any];

type MkTables<
  Tables extends Record<string, any>,
  Froms extends readonly C[],
  Group extends Record<string, readonly string[]>
> = Froms["length"] extends 0
  ? {}
  : Froms extends readonly [
      readonly [infer Name extends keyof Tables, infer Alias extends string],
      ...infer Rest extends readonly (readonly [keyof Tables, string])[]
    ]
  ? {
      [K in Alias]: MkColumns<
        Tables[Name],
        {} extends Group ? false : true,
        Name extends keyof Group ? Group[Name][number] : never
      >; //MkColumns<Tables[Name]>;
    } & MkTables<Tables, Rest, Group>
  : never;

type X = {} extends {} ? 1 : 2;

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
> = PathExp<TableName, ColumnName, MkType<ColumnData>, "No">;

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

// class SelectAs<Exps extends readonly AnySelectable[], Name extends string> {
//   type: "select_as";
// }

// class SelectAsExp<AnyS extends AnySelectable, Name extends string>
//   extends SelectAs<AnyS[], Name>
//    Exp<AnyS["pgType"], "No">
// {
//   type2: "select_as";
// }

// type AnySelectAsExp = SelectAsExp<any, any>;

type IsSingle<Exps extends readonly any[]> = Exps["length"] extends 1
  ? never
  : unknown;

type AllPostAgg<Exps extends readonly AnySelectable[]> = Exps extends readonly [
  AliasExp<any, any, "Post">
]
  ? never
  : unknown;

// type MkSelectAs<T extends string, Exps extends readonly AnySelectable[]> =
//   // [unknown, Exps] extends [IsSingle<Exps> | AllPostAgg<Exps>, infer Exp extends [infer OnlyOne extends AnySelectable]] ?
//   [Exps["length"], Exps] extends [
//     1,
//     infer A extends [AliasExp<infer Name, infer Type, "Post">]
//   ]
//     ? SelectAsExp<AliasExp<Name, Type, "Post">, T>
//     : unknown;

// type abcdef = AllPostAgg<readonly [AliasExp<any, any, "Post">]>;

// class SelectSingleColumn<
//   Exp extends AnySelectable,
//   pgType extends PgType
// > extends Exp<pgType, "No"> {
//   type: "select_single_column";
// }

// class SelectSingleColumnAndRow<
//   Exp extends AnySelectable,
//   pgType extends PgType
// > extends Exp<pgType, "No"> {}

type SelectQuant = "multi" | "single";

type MkRowsQuant<
  Num extends number,
  Original extends SelectQuant
> = Num extends 1 ? "single" : Original;

class SubQuery<
  Name extends string | unknown,
  Exps extends NonEmptyArray<AnySelectedColumn>,
  Rows extends SelectQuant,
  Cols extends SelectQuant
> implements
    Exp<
      [Rows, Cols] extends ["single", "single"] ? Exps[0]["type"] : unknown,
      "No"
    >
{
  pgType: [Rows, Cols] extends ["single", "single"] ? Exps[0]["type"] : unknown;
  aggState: "No";
  subquery: "subquery";
  cols: Cols;
  rows: Rows;
  name: Name;
}

type resetExpsAggStateGo<Exps extends readonly SingleSelectable[]> =
  Exps["length"] extends 0
    ? []
    : Exps extends readonly [
        infer Head extends SingleSelectable,
        ...infer Rest extends readonly SingleSelectable[]
      ]
    ? [MkSelectedColumn<Head>, ...resetExpsAggStateGo<Rest>]
    : never;

type ResetExpsAggState<Exps extends Selectables> = Exps extends readonly [
  infer Head extends SingleSelectable,
  ...infer Rest extends readonly SingleSelectable[]
]
  ? [MkSelectedColumn<Head>, ...resetExpsAggStateGo<Rest>]
  : never;

// Exps["length"] extends 0
//   ? []
//   : Exps extends readonly [
//       infer Head extends AnyExp,
//       ...infer Rest extends readonly AnyExp[]
//     ]
//   ? [ReplaceAggState<Head, "No">, ...ResetExpsAggState<Rest>]
//   : [];

// class As<
//   Exps extends NonEmptyArray<AnySelectedColumn>,
//   Rows extends SelectQuant,
//   Cols extends SelectQuant
// > extends SubQuery<unknown, Exps, Rows, Cols> {
//   as_: "as";
//   AS = <T extends string>(t: T): SubQuery<T, Exps, Rows, Cols> => {
//     // @ts-ignore
//     return null;
//   };
// }

const MakeExpression = (T) => class extends T {};

class Query<
  Exps extends NonEmptyArray<AnySelectedColumn>,
  Rows extends SelectQuant,
  Cols extends SelectQuant
> extends SubQuery<unknown, Exps, Rows, Cols> {
  query: "query";

  AS = <T extends string>(x: T): SubQuery<T, Exps, Rows, Cols> => {
    // @ts-ignore
    return null;
  };
}

// class OrderBy<
//   Exps extends Selected,
//   Rows extends SelectQuant,
//   Cols extends SelectQuant
// > extends As<Exps, Rows, Cols> {
//   type: "select";
//   // AS = <T extends string>(alias: T): MkSelectAs<T, Exps> => {
//   //   // @ts-ignore
//   //   return null;
//   // };

//   LIMIT = <Num extends number>(
//     x: Num
//   ): As<Exps, MkRowsQuant<Num, Rows>, Cols> => {
//     // @ts-ignore
//     return null;
//   };

//   // GROUP_BY = <const Q extends readonly AnyGroupExp[]>(
//   //   fun: (tables: MkTables<QueryTables, Selected, {}>) => Q
//   // ): Data<Selected, mkGroupBy<Q>> => {
//   //   // @ts-ignore
//   //   return null;
//   // };
// }

// type T = true extends false ? 1 : 2

// type Ttt = never | unknown

// type AnySingleAsSelect = SelectAs<[any], any, never>;

// type AnySelectable = AnySingleAsSelect

// type XXX1 = readonly [SelectAs<any, any, false>] extends readonly (AnySingleAsSelect | AnyLitExp )[] ? 1 : 2

type WhereExp = LitExp<"boolean", "No"> | FunExp<"boolean", "No">;

type mkGroupByGo<
  Q extends readonly AnyGroupExp[],
  Acc extends Record<string, string[]>
> = Q["length"] extends 0
  ? Acc
  : Q extends readonly [
      infer Head,
      ...infer Rest extends readonly AnyGroupExp[]
    ]
  ? Head extends PathExp<any, any, any, "No">
    ? mkGroupByGo<
        Rest,
        {
          [K in Head["table"]]: [
            ...(unknown extends Acc[K] ? [] : Acc[K]),
            Head["column"]
          ];
        } & Omit<Acc, Head["table"]>
      >
    : mkGroupByGo<Rest, Acc>
  : never;

type mkGroupBy<Q extends readonly AnyGroupExp[]> = ExpandRecursively<
  mkGroupByGo<Q, {}>
>;

// type mkX <rec extends Record<string, number>, str extends string> = rec[str]

// type TTT8 = mkX<{ "abc": 3 }, "def">

// type TTTTT = mkGroupBy<readonly [PathExp<"abc", "def", "boolean", "No">, PathExp<"xxx", "lol", "int", "No">, FunExp<"text", "No">, PathExp<"xxx", "wtf", "int", "No">]>;

type NonEmptyArray<T> = readonly [T, ...(readonly T[])];

type SingleSelected =
  | PathExp<any, any, any, "No">
  | AliasExp<any, any, "No">
  | SubQuery<string, any, "single", "single">;

type Selected = NonEmptyArray<SingleSelected>;

type SingleSelectable =
  | PathExp<any, any, any, "No" | "Post">
  | AliasExp<any, any, "No" | "Post">
  | SubQuery<string, any, "single", "single">;

type Selectables =
  | NonEmptyArray<
      | PathExp<any, any, any, "No">
      | AliasExp<any, any, "No">
      | SubQuery<string, any, "single", "single">
    >
  | NonEmptyArray<
      | PathExp<any, any, any, "Post">
      | AliasExp<any, any, "Post">
      | SubQuery<string, any, "single", "single">
    >;

const mkDb = <Tables extends TablesType>(tables: Tables) => {
  type QueryTables = MkQueryTables<Tables>;

  class Data<
    Selected extends readonly (readonly [any, any])[],
    Grouped extends Record<string, readonly string[]>
  > {
    selected: Selected;
    grouped: Grouped;
  }

  class GroupBy<Selected extends readonly (readonly [any, any])[]> extends Data<
    Selected,
    {}
  > {
    GROUP_BY = <const Q extends readonly AnyGroupExp[]>(
      fun: (tables: MkTables<QueryTables, Selected, {}>) => Q
    ): Data<Selected, mkGroupBy<Q>> => {
      // @ts-ignore
      return null;
    };
  }

  class Where<
    Selected extends readonly (readonly [any, any])[]
  > extends GroupBy<Selected> {
    WHERE = (
      fun: (tables: MkTables<QueryTables, Selected, {}>) => WhereExp
    ): GroupBy<Selected> => {
      // @ts-ignore
      return null;
    };
  }

  class Join<
    Selected extends readonly (readonly [any, any])[]
  > extends Where<Selected> {
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

  const SELECT = <const Q extends Selectables, Datas extends Data<any, any>>(
    // fun: <Q>(tables: Froms) => Q,
    fun: (
      tables: MkTables<QueryTables, Datas["selected"], Datas["grouped"]>
    ) => Q,
    j: Datas
  ): MkSelect<Q, Datas> => {
    // @ts-ignore
    return null;
  };

  // type TTT = GroupBy<any> extends Join<any> ? true : false;

  type MkSelect<Exps extends Selectables, Datas extends Data<any, any>> = Query<
    ResetExpsAggState<Exps>,
    [Datas, Exps[0]["aggState"]] extends [GroupBy<any>, "Post"]
      ? "single"
      : SelectQuant,
    Exps["length"] extends 1 ? "single" : SelectQuant
  >;

  type MMMM = MkSelect<[AliasExp<"abc", "int", "No">], Data<any, any>>;

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

type AnySelectable = AnyPathExp | AnyAliasExp;

type AnyGroupExp = AnyPathExp | AnyLitExp | AnyFunExp;

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

type SelectResult<Exps extends readonly AnySelectedColumn[]> =
  Exps["length"] extends 0
    ? {}
    : Exps extends readonly [
        infer Head extends AnySelectedColumn,
        ...infer Rest extends readonly AnySelectedColumn[]
      ]
    ? { [K in Head["name"]]: ToJsType<Head["type"]> } & SelectResult<Rest>
    : never;

type SR = SelectResult<
  [SelectedColumn<"name", "int">, SelectedColumn<"xxx", "text">]
>;

type ExpandedSelectResult<S extends Query<any, any, any>> = S extends Query<
  infer E extends NonEmptyArray<AnySelectedColumn>,
  any,
  any
>
  ? ExpandRecursively<SelectResult<E>>
  : unknown;

// type TTTTT = typeof xxx extends AnySingleAsSelect ? 1 : 3;
// type TTTTT = SelectAs<any, any, true> extends AnySingleAsSelect ? 1 : 3

// const f = SELECT(
//   (x) => [x.person.id, SELECT((x) => [jsonb_agg(x.person.id)], FROM("person")).AS("abc")],
//   FROM("person").JOIN("pet", { AS: "p" })
// );
// const f = SELECT((t) => {
//   const tt = jsonb_build_object("person", t.person.id, "n", t.person.name);

//   const x = jsonb_agg(tt).AS("person_ids");
//   //   type T = typeof x;
//   //   type MMM = typeof x extends Exp<infer Type> ? ColResult<Type> : never;
//   return [x];
// }, FROM("person"));

// const t1231 =

// const p1 = SELECT((t) => [max(t.person.name)], FROM("person")).AS("xxx");

// const xxx = SELECT(
//   (x) => [max(x.pet.id)],
//   FROM("pet").WHERE((x) => x.pet.owner_id("=", x.pet.owner_id))
// ).AS("pet");

// const result = SELECT(
//   (t) => [t.person.name, t.person.id, t.pet.owner_id, xxx],
//   FROM("person")
//     .JOIN("pet")
//     .WHERE(({ person, pet }) => pet.owner_id("=", person.id))
// );

// type AUAU = ExpandedSelectResult<typeof f>;

// const from = SELECT(FROM("person").JOIN("pets", { AS: "p" }));

const p = SELECT((x) => {
  const t = jsonb_build_object("name", x.pet.name, "id", x.pet.id).AS("xxx");
  return [t, x.pet.name];
}, FROM("pet"));

const t = SELECT(
  (t) => [
    t.person.name,
    t.person.id,
    SELECT(
      (x) => [
        jsonb_agg(jsonb_build_object("name", x.pet.name, "id", x.pet.id)).AS(
          "xxx"
        ),
      ],
      FROM("pet").WHERE((x) => x.pet.owner_id("=", t.person.id))
    ).AS("ttttt"),
  ],
  FROM("person")
);

type TTTTTTT = ExpandedSelectResult<typeof t>;
type TTTTTTTp = ExpandedSelectResult<typeof p>;
// type TTTTTTTx = <typeof p>;

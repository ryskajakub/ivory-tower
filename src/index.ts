// expands object types recursively
type ExpandRecursively<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: ExpandRecursively<O[K]> }
    : never
  : T;

const tables = {
  pet: [
    ["id", { type: "int" }],
    ["nickname", { type: "text", nullable: true }],
    ["owner_id", { type: "int" }],
  ],
  person: [
    ["id", { type: "int" }],
    ["name", { type: "text" }],
    ["age", { type: "int" }],
  ],
} as const;

// type TableDefinition =

type mkMutable<T> = {
  -readonly [P in keyof T]: T[P] extends object ? mkMutable<T[P]> : T[P];
};

type mkMutableShallow<T> = {
  -readonly [P in keyof T]: T[P];
};

// type MMMMM = ExpandRecursively<mkMutable<typeof tables>>;

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

type MkJsonBType<T extends PgType> = JsonB<ToJsonType<T>>;

type ToJsonType<T extends PgType> = MkJsTypeNoNull<T, "stringdate">;

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

// type TableType = [string, TableColumn][]

// type DbType = Record<string, TableType>;

type RawDbType = Readonly<
  Record<string, ReadonlyArray<readonly [string, TableColumn]>>
>;

type QTables = Record<string, [string, AnyPathExp][]>;

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

type QueriedTableType = [string, AnyPathExp][];
type QueriedTablesType = Record<string, QueriedTableType>;

type mkColumns<
  table extends QueriedTableType,
  agg extends boolean,
  aggColumns extends string
> = table["length"] extends 0
  ? {}
  : table extends [
      [infer ColName extends string, infer ColType extends AnyPathExp],
      ...infer Rest extends [string, any][]
    ]
  ? {
      [K in ColName]: agg extends true
        ? PathExp<
            ColType["table"],
            ColType["column"],
            ColType["pgType"],
            ColName extends aggColumns ? "Post" : "Pre"
          >
        : ColType & Operand<ColType["pgType"]> & mkOperand<ColType["pgType"]>;
    } & mkColumns<Rest, agg, aggColumns>
  : never;

// type XXX = MkColumns<[["abc", { type: "text" }], ["tef", { type: "int" }]]>;
type XXX2 = mkColumns<
  [
    ["col1", PathExp<"abc", "col1", "int", "No">],
    ["col2", PathExp<"abc", "col2", "text", "No">]
  ],
  true,
  "col1"
>;

type T = [][number];

type C = [any, any];

type mkTables<
  qTables extends QTables,
  fromItems extends FromItems,
  Group extends Record<string, string[]>
> = fromItems["length"] extends 0
  ? {}
  : fromItems extends [
      infer head extends [
        infer tableName extends keyof qTables,
        infer tableAlias extends string
      ],
      ...infer rest extends FromItems
    ]
  ? {
      [k in head[1]]: mkColumns<
        qTables[head[0]],
        {} extends Group ? false : true,
        k extends keyof Group ? Group[k][number] : never
      >;
    } & mkTables<qTables, rest, Group>
  : unknown;

type TTTT = ExpandRecursively<
  mkTables<
    mkQueryTables<mkMutable<typeof tables>>,
    [["person", "p"], ["pet", "pet"]],
    {}
  >
>;

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

type mkQueryColumns<
  tableName extends string,
  columns extends C[]
> = columns["length"] extends 0
  ? []
  : columns extends [
      [infer columnName extends string, infer columnData extends TableColumn],
      ...infer Rest extends C[]
    ]
  ? [
      [columnName, MkColumnExp<tableName, columnName, columnData>],
      ...mkQueryColumns<tableName, Rest>
    ]
  : never;

type mkQueryTables<Tables extends Record<string, any>> = {
  [K in keyof Tables]: K extends string ? mkQueryColumns<K, Tables[K]> : never;
};

type QueriedTablesOutside = ExpandRecursively<
  mkQueryTables<mkMutable<typeof tables>>
>;

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

type IsSingle<Exps extends any[]> = Exps["length"] extends 1 ? never : unknown;

type AllPostAgg<Exps extends AnySelectable[]> = Exps extends [
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

interface SelectQuant2 {
  rows: SelectQuant;
  cols: SelectQuant;
}

type MkRowsQuant<
  Num extends number,
  Original extends SelectQuant
> = Num extends 1 ? "single" : Original;

type mkColQuant<sel extends Selectables> = sel["length"] extends 1
  ? "single"
  : "multi";

class SubQuery<
  Name extends string | unknown,
  Exps extends Selected,
  cols extends SelectQuant,
  rows extends SelectQuant
> extends Exp<Exps[0]["pgType"], "No"> {
  cols: cols;
  rows: rows;
  subquery: "subquery";
  name: Name;
}

type resetExpsAggStateGo<Exps extends SingleSelectable[]> =
  Exps["length"] extends 0
    ? []
    : Exps extends [
        infer Head extends SingleSelectable,
        ...infer Rest extends SingleSelectable[]
      ]
    ? [MkSelectedColumn<Head>, ...resetExpsAggStateGo<Rest>]
    : never;

type ResetExpsAggState<Exps extends Selectables> = Exps extends [
  infer Head extends SingleSelectable,
  ...infer Rest extends SingleSelectable[]
]
  ? [MkSelectedColumn<Head>, ...resetExpsAggStateGo<Rest>]
  : never;

// class AsQuery<
//   Exps extends SelectedDone,
// > {
//   query: "query";

//   AS = <T extends string>(x: T): SubQuery<T, Exps> => {
//     // @ts-ignore
//     return null;
//   };
// }

interface OrderByArgs<
  qTables extends QTables = any,
  fromItems extends FromItems = any,
  grouped extends Record<string, string[]> = any
> {
  qTables: qTables;
  fromItems: fromItems;
  grouped: grouped;
}

class AsQuery<
  exps extends Selected,
  cols extends SelectQuant,
  rows extends SelectQuant
> extends SubQuery<unknown, exps, cols, rows> {
  asQuery: "asQuery";
  AS = <T extends string>(t: T): SubQuery<T, exps, cols, rows> => {
    // @ts-ignore
    return null;
  };
}

class Limit<
  exps extends Selected,
  cols extends SelectQuant,
  rows extends SelectQuant
> extends AsQuery<exps, cols, rows> {
  limit: "limit";
}

// type mkOrderTables<exps extends Selectables, orderByArgs extends OrderByArgs | null> =
//   orderByArgs extends OrderByArgs ?

class OrderBy<
  cols extends SelectQuant,
  rows extends SelectQuant,
  exps extends Selected,
  orderByArgs extends OrderByArgs | null
> extends Limit<exps, cols, rows> {
  orderBy: "orderBy";
  // ORDER_BY = <Q extends Selectables>(
  //   f: (x: mkTables<mkOrderTables<exps, orderByArgs>>) => Q
  // ) => {
  //   // @ts-ignore
  //   return null;
  // };
}

// type UnionCol = Selectables[number] | LitExp<any, any>

type unionSelectablesGo<exps extends Selected> = exps["length"] extends 1
  ? [SelectedColumn1<exps[0]["pgType"]>]
  : exps extends [
      infer head extends Exp<any, any>,
      ...infer rest extends Selected
    ]
  ? [SelectedColumn1<head["pgType"]>, ...unionSelectablesGo<rest>]
  : never;

type unionSelectables<exps extends Selected> = AsQuery<
  unionSelectablesGo<exps>,
  any,
  any
>;

class Union<
  cols extends SelectQuant,
  rows extends SelectQuant,
  exps extends Selected,
  orderByArgs extends OrderByArgs | null
> extends OrderBy<cols, rows, exps, orderByArgs> {
  union: "union";
  UNION = <T extends unionSelectables<exps>>(
    x: T
  ): Union<cols, rows, exps, null> => {
    // @ts-ignore
    return null;
  };
}

type WhereExp =
  | LitExp<"boolean", "No">
  | FunExp<"boolean", "No">
  | PathExp<any, any, "boolean", "No">;

type mkGroupByGo<
  Q extends AnyGroupExp[],
  Acc extends Record<string, string[]>
> = Q["length"] extends 0
  ? Acc
  : Q extends [infer Head, ...infer Rest extends AnyGroupExp[]]
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

type mkGroupBy<Q extends AnyGroupExp[]> = ExpandRecursively<mkGroupByGo<Q, {}>>;

type NonEmptyArray<T> = [T, ...T[]];

type SingleSelected =
  | PathExp<any, any, any, "No">
  | AliasExp<any, any, "No">
  | SubQuery<string, any, "single", "single">;

// type Selected = NonEmptyArray<SingleSelected>;

type SelectedDone = NonEmptyArray<AliasExp<any, any, "No">>;

type SingleSelectable =
  | PathExp<any, any, any, "No" | "Post">
  | AliasExp<any, any, "No" | "Post">
  | SubQuery<string, any, "single", "single">;

type NoAggSelectables = NonEmptyArray<AliasExp<any, any, "No">>;

type Selected = NonEmptyArray<
  | PathExp<any, any, any, "No">
  | AliasExp<any, any, "No">
  | SubQuery<string, any, "single", "single">
>;

type SelectedColumn1<pgType extends PgType> =
  | PathExp<any, any, pgType, "No">
  | AliasExp<any, pgType, "No">
  | SubQuery<any, [SelectedColumn1<pgType>], "single", "single">;

type Selectables =
  | Selected
  | NonEmptyArray<
      | PathExp<any, any, any, "Post">
      | AliasExp<any, any, "Post">
      | SubQuery<string, any, "single", "single">
    >;

type AnyTables = Record<string, any>;

type AnyFromItems = Record<string, any>;

// type mkJoin<
//   qTables extends AnyTables,
//   fromItems extends AnyTables,
//   T extends keyof qTables
// > =

// Args extends readonly [infer T, infer Options extends { AS: string }]
//   ? From<qTables, [...Selected, [T, Options["AS"]]]>
//   : Args extends readonly [infer T]
//   ? From<qTables, [...Selected, [T, T]]>
//   : never;

class Data<
  qTables extends QTables,
  fromItems extends FromItems,
  grouped extends Record<string, string[]>
> {
  grouped: grouped;
  qTables: qTables;
  fromItems: fromItems;
}

class GroupBy<
  qTables extends QTables,
  fromItems extends FromItems
> extends Data<qTables, fromItems, {}> {
  GROUP_BY = <const Q extends AnyGroupExp[]>(
    fun: (tables: mkTables<qTables, fromItems, {}>) => Q
  ): Data<qTables, fromItems, mkGroupBy<mkMutableShallow<Q>>> => {
    // @ts-ignore
    return null;
  };
}

class Where<
  qTables extends QTables,
  fromItems extends FromItems
> extends GroupBy<qTables, fromItems> {
  WHERE = (
    fun: (tables: mkTables<qTables, fromItems, {}>) => WhereExp
  ): GroupBy<qTables, fromItems> => {
    // @ts-ignore
    return null;
  };
}

type secondElementsUnion<arr extends [string, any][]> = arr[number][1];

// type TTT22 = keysUnion<[["abc", 123], ["def", "xxx"]]>

type FromItems = [string, string][];

type mkFromNoAlias<
  qTables extends QTables,
  fromItems extends FromItems,
  T extends keyof qTables & string
> = T extends secondElementsUnion<fromItems>
  ? unknown
  : From<qTables, [...fromItems, [T, T]]>;

type mkFromAlias<
  qTables extends QTables,
  fromItems extends FromItems,
  T extends keyof qTables & string,
  A extends string
> = A extends keyof secondElementsUnion<fromItems>
  ? unknown
  : From<qTables, [...fromItems, [T, A]]>;

type mkFrom<
  qTables extends QTables,
  fromItems extends FromItems,
  T extends keyof qTables & string,
  A extends string[]
> = A["length"] extends 0
  ? mkFromNoAlias<qTables, fromItems, T>
  : A["length"] extends 1
  ? mkFromAlias<qTables, fromItems, T, A[0]>
  : unknown;

type ABC1 = mkFrom<QueriedTablesOutside, [], "person", []>;

// @ts-ignore
const xxx: ABC1 = null;

// xxx.WHERE(x => x.)

class From<
  qTables extends AnyTables,
  fromItems extends FromItems
> extends Where<qTables, fromItems> {
  FROM<const T extends keyof qTables & string, const A extends string[]>(
    table: T,
    ...alias: A
  ): mkFrom<qTables, fromItems, T, A> {
    // @ts-ignore
    return null;
  }
}

// const l =

// type MkSelect1<T extends NoAggSelectables> = Union<QTables extends AnyTables, selectedDone extends SelectedDone> ;

type TypescriptLit = string | number;

type MkLit1<T> = T extends string ? "text" : "int";

const literal = <T extends TypescriptLit>(lit: T): LitExp<MkLit1<T>, "No"> => {
  // @ts-ignore
  return null;
};

type mkMkTables<Datas extends Data<any, any, any>[]> = Datas["length"] extends 1
  ? mkTables<Datas[0]["qTables"], Datas[0]["fromItems"], Datas[0]["grouped"]>
  : never;

const SELECT = <
  const Q extends Selectables | Selectables[number],
  Datas extends Data<any, any, any>[]
>(
  fun: ((tables: mkMkTables<Datas>) => Q) | Q,
  ...j: Datas
): mkSelect<Q, Datas> => {
  // @ts-ignore
  return null;
};

// type TTT = GroupBy<any> extends Join<any> ? true : false;

type resetExp<exp extends Selectables[number]> = exp extends AnyPathExp
  ? PathExp<exp["table"], exp["column"], exp["pgType"], "No">
  : exp extends AnyAliasExp
  ? AliasExp<exp["alias"], exp["pgType"], "No">
  : exp;

type resetExpsAggState<exps extends Selectables> = exps["length"] extends 1
  ? [resetExp<exps[0]>]
  : exps extends [
      infer head extends Selectables[number],
      ...infer tail extends Selectables
    ]
  ? [resetExp<head>, ...resetExpsAggState<tail>]
  : never;

type wrapInArray<elem extends unknown | unknown[]> = elem extends unknown[]
  ? elem
  : [elem];

type mkSelectColQuant<exps extends Selectables | Selectables[number]> =
  exps extends Selectables
    ? Selectables["length"] extends 1
      ? "single"
      : "multi"
    : "single";

type mkSelectRowQuant<
  exps extends Selectables,
  data extends Data<any, any, any>
> = exps[0]["aggState"] extends "Post"
  ? data extends GroupBy<any, any>
    ? "single"
    : "multi"
  : "multi";

type mkSelect<
  Exps extends Selectables | Selectables[number],
  Datas extends Data<any, any, any>[]
> = Datas["length"] extends 0
  ? Union<
      mkSelectColQuant<Exps>,
      "single",
      resetExpsAggState<wrapInArray<Exps>>,
      null
    >
  : Datas["length"] extends 1
  ? Union<
      mkSelectColQuant<Exps>,
      mkSelectRowQuant<wrapInArray<Exps>, Datas[0]>,
      resetExpsAggState<wrapInArray<Exps>>,
      Datas[0]
    >
  : unknown;

// Datas["length"] extends 1 ? Union<> :

type mkFromTables<
  queryTables extends AnyTables,
  k extends keyof queryTables
> = {
  [K in T]: queryTables[T];
};

// AsQuery<
//   ResetExpsAggState<Exps>,
//   [Datas, Exps[0]["aggState"]] extends [GroupBy<any, any>, "Post"]
//     ? "single"
//     : SelectQuant,
//   Exps["length"] extends 1 ? "single" : SelectQuant
// >;

const mkDb = <Tables extends RawDbType>(tables: Tables) => {
  type QueryTables = mkQueryTables<mkMutable<Tables>>;

  return {
    FROM: <T extends keyof Tables & string, A extends any[]>(
      table: T,
      ...alias: A
    ): mkFrom<QueryTables, [], T, A> => {
      // @ts-ignore
      return null;
    },
  };
};

// const SELECT = (from: From) => {
// }

const { FROM } = mkDb(tables);

// type MkTables<Tables, Selected> =

type Expand<T> = T extends unknown ? { [K in keyof T]: Expand<T[K]> } : never;

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

type SelectResult<Exps extends AnySelectedColumn[]> = Exps["length"] extends 0
  ? {}
  : Exps extends [
      infer Head extends AnySelectedColumn,
      ...infer Rest extends AnySelectedColumn[]
    ]
  ? { [K in Head["name"]]: ToJsType<Head["type"]> } & SelectResult<Rest>
  : never;

type SR = SelectResult<
  [SelectedColumn<"name", "int">, SelectedColumn<"xxx", "text">]
>;

// type ExpandedSelectResult<S extends AsQuery<any, any, any>> = S extends AsQuery<
//   infer E extends NonEmptyArray<AnySelectedColumn>,
//   any,
//   any
// >
//   ? ExpandRecursively<SelectResult<E>>
//   : unknown;

const mySelect = SELECT(literal(123).AS("123"));

const fff = SELECT(
  (x) => [
    // x.person.age,
    // x.person.name,
    max(x.person.id).AS("ttttt"),
    // max(x.p.nickname).AS("nnn"),
  ],
  FROM("person")
    .FROM("pet", "p")
    .WHERE((x) => x.person.id("=", x.p.owner_id))
  // .GROUP_BY((x) => [x.person.age, x.person.name])
)
  .UNION(mySelect)
  .UNION(mySelect);

// const p = SELECT((x) => {
//   const t = jsonb_build_object("name", x.pet.name, "id", x.pet.id).AS("xxx");
//   return [t, x.pet.name];
// }, FROM("pet"));

// const t = SELECT(
//   (t) => [
//     t.person.name,
//     t.person.id,
//     SELECT(
//       (x) => [
//         jsonb_agg(jsonb_build_object("name", x.pet.name, "id", x.pet.id)).AS(
//           "xxx"
//         ),
//       ],
//       FROM("pet").WHERE((x) => x.pet.owner_id("=", t.person.id))
//     ).AS("ttttt"),
//   ],
//   FROM("person")
// );

// type TTTTTTT = ExpandedSelectResult<typeof t>;
// type TTTTTTTp = ExpandedSelectResult<typeof p>;
// type TTTTTTTx = <typeof p>;

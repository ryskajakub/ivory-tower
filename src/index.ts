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

type mkMutable<T> = {
  -readonly [P in keyof T]: T[P] extends object ? mkMutable<T[P]> : T[P];
};

type mkMutableShallow<T> = {
  -readonly [P in keyof T]: T[P];
};

type AggState = "Pre" | "Post" | "No";

type Operator = "=" | ">=" | ">" | "+" | "-";

type mkOperatorResultType<
  operand1 extends PgType,
  operator extends Operator,
  operand2 extends PgType
> = operand1 extends operand2 ? operand1 : unknown;

class Column<
  path extends string | null,
  name extends string,
  pgType extends PgType,
  aggState extends AggState
> {
  path: path;
  name: name;
  pgType: pgType;
  aggState: aggState;
  constructor(path: path, name: name, pgType: pgType, aggState: aggState) {
    path = path;
    name = name;
    pgType = pgType;
    aggState = aggState;
  }
}

type AnyColumn = Column<any, any, any, any>;

type AnyStateColumn<aggState extends AggState> = Column<
  any,
  string,
  KnownPgType,
  aggState
>;

type binaryOperation<
  operator extends Operator,
  pgType extends PgType
> = operator extends "+" | "-"
  ? Exp<pgType, "No">
  : Exp<"boolean" | (null extends pgType ? null : unknown), "No">;

type mkThat<operator extends Operator, pgType extends PgType> = [
  "+",
  "int"
] extends [operator, "int"]
  ? Exp<pgType, "No">
  : ["-", "int"] extends [operator, "int"]
  ? Exp<pgType, "No">
  : Exp<"boolean", "No">;

interface Operand<pgType extends PgType, aggState extends AggState> {
  <operator extends Operator, that extends mkThat<operator, pgType>>(
    operator: Operator,
    that: that
  ): binaryOperation<operator, pgType>;
}

class Expression<
  path extends string | null,
  name extends string,
  pgType extends PgType,
  aggState extends AggState
> extends Column<path, name, pgType, aggState> {
  constructor(path: path, name: name, pgType: pgType, aggState: aggState) {
    super(path, name, pgType, aggState);
  }

  AS = <alias extends string>(
    alias: alias
  ): Column<path, alias, pgType, aggState> => {
    // @ts-ignore
    return null;
  };
}

type Unk = "?column?";

type AnyExpression = Expression<any, any, any, any>;

type Exp<pgType extends PgType, aggState extends AggState> = Expression<
  null,
  Unk,
  pgType,
  aggState
>;

type NameExp<
  name extends string,
  pgType extends PgType,
  aggState extends AggState
> = Expression<any, name, pgType, aggState>;

class JsonB<T> {
  t: T;
}

type KnownPgType = "timestamp" | "boolean" | "int" | "text" | JsonB<any> | null;

type PgType = KnownPgType | unknown;

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

type JsonbAggResult<T extends Exp<PgType, "Pre" | "No">> = NameExp<
  "jsonb_agg",
  MkJsonBArrayAggType<T["pgType"]>,
  "Post"
>;

type AnyAggregableExp = Expression<any, any, KnownPgType, "Pre" | "No">;

const jsonb_agg = <T extends AnyAggregableExp>(exp: T): JsonbAggResult<T> => {
  // @ts-ignore
  return null;
};

const max = <T extends AnyAggregableExp>(
  exp: T
): NameExp<"max", T["pgType"], "Post"> => {
  // @ts-ignore
  return null;
};

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
  ? NameExp<"jsonb_build_object", JsonB<ExpandRecursively<Result>>, State>
  : T extends [
      infer Name extends string,
      infer E extends AnyExpression,
      ...infer Rest
    ]
  ? MkJsonBuildObjectGo<
      Rest,
      Result & { [K in Name]: MkJsonBType<E["pgType"]> },
      State
    >
  : never;

type MkJsonBuildObject<T extends any[]> = MkJsonBuildObjectGo<T, {}, "No">;

const jsonb_build_object = <const T extends any[]>(
  ...t: T
): MkJsonBuildObject<T> => {
  // @ts-ignore
  return null;
};

type Lit = number | string;

type MkLit<T extends Lit> = T extends number
  ? Exp<"int", "No"> & Operand<"int", "No">
  : T extends string
  ? Exp<"text", "No"> & Operand<"text", "No">
  : never;

const lit = <T extends Lit>(t: T): MkLit<T> => {
  // @ts-ignore
  return null;
};

type RawDbType = Readonly<
  Record<string, ReadonlyArray<readonly [string, TableColumn]>>
>;

interface TableColumn {
  type: "text" | "int";
  nullable?: true;
}

type QueriedTableType = [string, SingleSelected][];
// type QueriedTablesType = Record<string, QueriedTableType>;

type mkColumns<
  table extends QueriedTableType,
  agg extends boolean,
  aggColumns extends string
> = table["length"] extends 0
  ? {}
  : table extends [
      [infer ColName extends string, infer ColType extends SingleSelected],
      ...infer Rest extends [string, any][]
    ]
  ? {
      [K in ColName]: agg extends true
        ? Expression<
            ColName,
            ColType["name"],
            ColType["pgType"],
            ColName extends aggColumns ? "Post" : "Pre"
          >
        : ColType;
    } & mkColumns<Rest, agg, aggColumns>
  : never;

type T = [][number];

type C = [any, any];

type QTables = Record<string, [string, SingleSelected][]>;

type mkTables<
  qTables extends QTables,
  fromItems extends FromItems,
  group extends Record<string, string[]> = {}
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
        {} extends group ? false : true,
        k extends keyof group ? group[k][number] : never
      >;
    } & mkTables<qTables, rest, group>
  : unknown;

type withName<exps extends SingleSelected[]> = exps extends [
  infer head extends SingleSelected,
  ...infer tail extends SingleSelected[]
]
  ? [[head["name"], head], ...withName<tail>]
  : [];

type mkTablesExp<exps extends Selected> = mkTables<
  { union: withName<exps> },
  [["union", "union"]],
  {}
>;

// type MkT = mkTablesExp<[NameExp<"xxx" ,"int", "No">]>

// type TTTT = ExpandRecursively<
//   mkTables<
//     mkQueryTables<mkMutable<typeof tables>>,
//     [["person", "p"], ["pet", "pet"]],
//     {}
//   >
// >;

type mkColumnType<T extends TableColumn> =
  //   | (T extends "text" ? "text" : "int")
  //   | T extends { nullable: true }
  //   ? null
  //   : never;
  T["type"] extends "text"
    ? "text"
    : "int" | (T["nullable"] extends true ? null : never);

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
      [
        columnName,
        Expression<tableName, columnName, mkColumnType<columnData>, "No">
      ],
      ...mkQueryColumns<tableName, Rest>
    ]
  : never;

type mkQueryTables<Tables extends Record<string, any>> = {
  [K in keyof Tables]: K extends string ? mkQueryColumns<K, Tables[K]> : never;
};

// type TTT =

type QueriedTablesOutside = ExpandRecursively<
  mkQueryTables<mkMutable<typeof tables>>
>;

type IsSingle<Exps extends any[]> = Exps["length"] extends 1 ? never : unknown;

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

class Empty {}

// type extendExpression<name extends string> = Empty

type getSubQueryExpressionType<
  cols extends SelectQuant,
  rows extends SelectQuant,
  Exps extends Selected
> = [cols, rows] extends ["single", "single"] ? Exps[0] : unknown;

// type

type getColsQuant<exps extends Selected> = exps["length"] extends 1
  ? "single"
  : "multi";

class SubQuery<
  name extends string | null,
  Exps extends Selected,
  rows extends SelectQuant
> extends Expression<
  null,
  name extends null ? Unk : name,
  getSubQueryExpressionType<getColsQuant<Exps>, rows, Exps>,
  "No"
> {
  rows: rows;
  name1: name;
  subquery: "subquery";
}

type mkSelectedColumn<Col extends SingleSelectable> = Expression<
  Col["path"],
  Col["name"],
  Col["pgType"],
  "No"
>;

type resetExpsAggStateGo<Exps extends Selectables> = Exps["length"] extends 0
  ? []
  : Exps extends [
      infer Head extends SingleSelectable,
      ...infer Rest extends Selectables
    ]
  ? [mkSelectedColumn<Head>, ...resetExpsAggStateGo<Rest>]
  : never;

type ResetExpsAggState<Exps extends Selectables> = Exps extends [
  infer Head extends SingleSelectable,
  ...infer Rest extends Selectables
]
  ? [mkSelectedColumn<Head>, ...resetExpsAggStateGo<Rest>]
  : never;

class Limit<exps extends Selected, rows extends SelectQuant> extends SubQuery<
  null,
  exps,
  rows
> {
  limit: "limit";
}

type AnyData = Data<any, any, any>;

type mkOrderTables<
  exps extends Selected,
  data extends Data<any, any, any> | null
> = data extends AnyData
  ? mkTables<data["qTables"], data["fromItems"], data["grouped"]>
  : mkTablesExp<exps>;

class OrderBy<
  data extends Data<any, any, any> | null,
  rows extends SelectQuant,
  exps extends Selected
> extends Limit<exps, rows> {
  orderBy: "orderBy";
  ORDER_BY = <Q extends Selectables>(
    f: (x: mkOrderTables<exps, data>) => Q
  ) => {
    // @ts-ignore
    return null;
  };
}

// type UnionCol = Selectables[number] | LitExp<any, any>

type unionSelectablesGo<exps extends Selectables> = exps["length"] extends 0
  ? [Expression<any, any, exps[0]["pgType"], "No">]
  : exps extends [
      infer head extends Exp<any, any>,
      ...infer rest extends Selectables
    ]
  ? [Expression<any, any, head["pgType"], "No">, ...unionSelectablesGo<rest>]
  : never;

type unionSelectables<exps extends Selectables> =
  unionSelectablesGo<exps> extends Selected
    ? SubQuery<null, unionSelectablesGo<exps>, "multi">
    : unknown;
// unionSelectablesGo<exps> extends Selected

class Union<
  data extends Data<any, any, any> | null,
  // qTables extends QTables,
  // fromItems extends FromItems,
  rows extends SelectQuant,
  exps extends Selected
> extends OrderBy<data, rows, exps> {
  union: "union";
  UNION = <T extends unionSelectables<exps>>(
    x: T
  ): OrderBy<null, rows, exps> => {
    // @ts-ignore
    return null;
  };
}

type WhereExp = Exp<"boolean", "No">;

type mkGroupByGo<
  Q extends AnyGroupExp[],
  Acc extends Record<string, string[]>
> = Q["length"] extends 0
  ? Acc
  : Q extends [infer Head, ...infer Rest extends AnyGroupExp[]]
  ? Head extends AnyGroupExp
    ? mkGroupByGo<
        Rest,
        {
          [K in Head["path"]]: [
            ...(unknown extends Acc[K] ? [] : Acc[K]),
            Head["name"]
          ];
        } & Omit<Acc, Head["path"]>
      >
    : mkGroupByGo<Rest, Acc>
  : never;

type mkGroupBy<Q extends AnyGroupExp[]> = ExpandRecursively<mkGroupByGo<Q, {}>>;

type NonEmptyArray<T> = [T, ...T[]];

type SingleSelected = Expression<any, string, KnownPgType, "No">;

type Selected = NonEmptyArray<SingleSelected>;

type SingleSelectable = Selectables[number];

type Selectables =
  | NonEmptyArray<AnyStateColumn<"No">>
  | NonEmptyArray<AnyStateColumn<"Post">>;

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

type AnyGroupExp = Expression<any, any, any, "No">;

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

type FromItems = [string, string][];

type secondElementsUnion<arr extends FromItems> = arr[number][1];

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
> = A extends secondElementsUnion<fromItems>
  ? [A, secondElementsUnion<fromItems>]
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

// type ABC1 = mkFrom<QueriedTablesOutside, [], "person", []>;

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

const literal = <T extends TypescriptLit>(lit: T): Exp<MkLit1<T>, "No"> => {
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

type resetExp<exp extends Selectables[number]> = NameExp<
  exp["name"],
  exp["pgType"],
  "No"
>;

// ? PathExp<exp["table"], exp["column"], exp["pgType"], "No">
// : exp extends AnyAliasExp
// ? AliasExp<exp["alias"], exp["pgType"], "No">
// : exp;

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
  ? Union<null, "single", resetExpsAggState<wrapInArray<Exps>>>
  : Datas["length"] extends 1
  ? Union<
      Datas[0],
      mkSelectRowQuant<wrapInArray<Exps>, Datas[0]>,
      resetExpsAggState<wrapInArray<Exps>>
    >
  : unknown;

type mkFromTables<
  queryTables extends AnyTables,
  k extends keyof queryTables
> = {
  [K in T]: queryTables[T];
};

// type TTT = mkQueryTables<mkMutable<typeof tables>>

// // type UUU = mkFromAlias<TTT, [], "person", "p">

// // @ts-ignore
// const t: TTT = null

const mkDb = <Tables extends RawDbType>(tables: Tables) => {
  type QueryTables = mkQueryTables<mkMutable<Tables>>;

  return {
    FROM: <T extends keyof Tables & string, const A extends any[]>(
      table: T,
      ...alias: A
    ): mkFrom<QueryTables, [], T, A> => {
      // @ts-ignore
      return null;
    },
  };
};

const { FROM } = mkDb(tables);

type Expand<T> = T extends unknown ? { [K in keyof T]: Expand<T[K]> } : never;

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

// type SelectResult<Exps extends AnySelectedColumn[]> = Exps["length"] extends 0
//   ? {}
//   : Exps extends [
//       infer Head extends AnySelectedColumn,
//       ...infer Rest extends AnySelectedColumn[]
//     ]
//   ? { [K in Head["name"]]: ToJsType<Head["type"]> } & SelectResult<Rest>
//   : never;

// type SR = SelectResult<
//   [SelectedColumn<"name", "int">, SelectedColumn<"xxx", "text">]
// >;

const froms = FROM("pet", "p").FROM("person");

const f = SELECT((x) => [max(x.p.id), max(x.person.age)], froms).ORDER_BY(
  (x) => [x.person.age]
);

const res = lit(555)("=", lit(132))

const x = SELECT((x) => lit(555)("=", lit(123)));

// const fff = SELECT(
//   // (x) => [
//   //   // SELECT((y) => max(y.pet.nickname).AS("ppp"), FROM("pet")).AS("ttt"),
//   //   // x => x.
//   // ],
//   FROM("person")
//     .FROM("pet", "p")
//     .WHERE((x) => x.person.id("=", x.p.owner_id))
//   // .GROUP_BY((x) => [x.person.age, x.person.name])
// )
// .UNION(mySelect)
// .UNION(mySelect);

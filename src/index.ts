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

class Col<name extends string, pgType extends PgType> {
  name: name;
  pgType: pgType;
  constructor(name: name, pgType: pgType) {
    this.name = name;
    this.pgType = pgType;
  }
}

class AliasExpression<
  name extends string,
  pgType extends PgType,
  aggState extends AggState
> extends Col<name, pgType> {
  classType: "column" = "column";
  aggState: aggState;
  constructor(name: name, pgType: pgType, aggState: aggState) {
    super(name, pgType);
    this.aggState = aggState;
  }
  toColumn = () => {
    return new AliasExpression(this.name, this.pgType, this.aggState);
  };
}

type AnyColumn = AliasExpression<any, any, any>;

type AnyStateColumn<aggState extends AggState> = AliasExpression<
  string,
  KnownPgType,
  aggState
>;

type mkAggState<aggState extends AggState, thatAggState extends AggState> = [
  aggState,
  thatAggState
] extends ["Post", "Pre"] | ["Pre", "Post"]
  ? "Pre"
  : [aggState, thatAggState] extends ["No", "Pre"] | ["Pre", "No"]
  ? "Pre"
  : [aggState, thatAggState] extends ["No", "Post"] | ["Post", "No"]
  ? "Post"
  : aggState;

type thatToExp<that extends mkThat<any, any>> = that extends number
  ? Expression<Unk, "int", "No">
  : that extends string
  ? Expression<Unk, "text", "No">
  : that;

type binaryOperation<
  thisOperand extends AnyExpression,
  operator extends Operator,
  that extends mkThat<any, any>
> = operator extends "+" | "-"
  ? Exp<
      thisOperand["pgType"],
      mkAggState<thisOperand["aggState"], thatToExp<that>["aggState"]>
    >
  : Exp<
      | "boolean"
      | (null extends thisOperand["pgType"] | thatToExp<that>["pgType"]
          ? null
          : never),
      mkAggState<thisOperand["aggState"], thatToExp<that>["aggState"]>
    >;

type mkThat<operator extends Operator, pgType extends PgType> =
  | Exp<pgType, "No">
  | number
  | string;

const binop = <
  thisOperand extends AnyExpression,
  operator extends Operator,
  thatOperand extends mkThat<operator, thisOperand["pgType"]>
>(
  thisOperand: thisOperand,
  operator: operator,
  thatOperand: thatOperand
): binaryOperation<thisOperand, operator, thatOperand> => {
  // @ts-ignore
  return null;
};

class Expression<
  name extends string,
  pgType extends PgType,
  aggState extends AggState
> extends AliasExpression<name, pgType, aggState> {
  constructor(name: name, pgType: pgType, aggState: aggState) {
    super(name, pgType, aggState);
  }

  AS = <alias extends string>(
    alias: alias
  ): AliasExpression<alias, pgType, aggState> => {
    // @ts-ignore
    return null;
  };
}

class PathExpression<
  path extends string,
  name extends string,
  pgType extends PgType,
  aggState extends AggState
> extends Expression<name, pgType, aggState> {
  path: path;
  constructor(path: path, name: name, pgType: pgType, aggState: aggState) {
    super(name, pgType, aggState);
    this.path = path;
  }
}

type Unk = "?column?";

type AnyExpression = Expression<any, any, any>;

type Exp<pgType extends PgType, aggState extends AggState> = Expression<
  Unk,
  pgType,
  aggState
>;

class JsonB<T> {
  t: T;
  constructor(t: T) {
    this.t = t;
  }
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

// type Ttab = MkJsonBArrayAggType<"int">

type MkJsTypeNoNull<T extends PgType, Timestamp = Date> = T extends "int"
  ? number
  : T extends "text"
  ? string
  : T extends "boolean"
  ? boolean
  : T extends "timestamp"
  ? Timestamp
  : T extends JsonB<any>
  ? T["t"]
  : never;

type ToJsType<T extends PgType, Timestamp = Date> = null extends T
  ? MkJsTypeNoNull<Exclude<T, null>, Timestamp> | null
  : MkJsTypeNoNull<Exclude<T, null>, Timestamp>;

type JsonbAggResult<T extends Exp<PgType, "Pre" | "No">> = Expression<
  "jsonb_agg",
  MkJsonBArrayAggType<T["pgType"]>,
  "Post"
>;

type AnyAggregableExp = Expression<any, KnownPgType, "Pre" | "No">;

const JSONB_AGG = <T extends AnyAggregableExp>(exp: T): JsonbAggResult<T> => {
  // @ts-ignore
  return null;
};

type AAAA = JsonbAggResult<Expression<any, "int", "No">>["pgType"];

const MAX = <T extends AnyAggregableExp>(
  exp: T
): Expression<"max", T["pgType"], "Post"> => {
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
  ? Expression<"jsonb_build_object", JsonB<ExpandRecursively<Result>>, State>
  : T extends [
      infer Name extends string,
      infer E extends AnyExpression,
      ...infer Rest
    ]
  ? MkJsonBuildObjectGo<
      Rest,
      Result & { [K in Name]: MkJsonBType<E["pgType"]>["t"] },
      State
    >
  : never;

type MkJsonBuildObject<T extends any[]> = MkJsonBuildObjectGo<T, {}, "No">;

const JSONB_BUILD_OBJECT = <const T extends any[]>(
  ...t: T
): MkJsonBuildObject<T> => {
  // @ts-ignore
  return null;
};

type Lit = number | string | object;

// type MurMur =  extends object ? true : false;

type MkLit<T extends Lit> = T extends number
  ? Expression<Unk, "int", "No">
  : T extends string
  ? Expression<Unk, "text", "No">
  : T extends object
  ? Expression<Unk, JsonB<T>, "No">
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

type removeDuplicated<
  arr extends [string, any][],
  duplicates = never
> = arr extends [
  infer head extends [string, any],
  ...infer rest extends [string, any][]
]
  ? head[0] extends rest[number][0] | duplicates
    ? removeDuplicated<rest, duplicates | head[0]>
    : [head[0], ...removeDuplicated<rest, duplicates>]
  : [];

// type rd = removeDuplicated<[["a", "b"], ["a", "d"], ["b", "d"], ["c", "x"]]>

type X = mkColumns<
  [
    ["abc", Col<"nnn", "int">],
    ["abc", Col<"nnn", "int">],
    ["def", Col<"nnn", "int">]
  ],
  never | "def",
  false,
  never
>;

type mkColumns<
  table extends QueriedTableType,
  nonDuplicatedKeys extends string,
  agg extends boolean,
  aggColumns extends string
> = table["length"] extends 0
  ? {}
  : table extends [
      [infer ColName extends string, infer ColType extends SingleSelected],
      ...infer Rest extends [string, any][]
    ]
  ? {
      [K in ColName as K extends nonDuplicatedKeys
        ? K
        : never]: agg extends true
        ? PathExpression<
            ColName,
            ColType["name"],
            ColType["pgType"],
            ColName extends aggColumns ? "Post" : "Pre"
          >
        : Expression<ColType["name"], ColType["pgType"], "No">;
    } & mkColumns<Rest, nonDuplicatedKeys, agg, aggColumns>
  : never;

type T = [][number];

type C = [any, any];

type TableCol = Col<any, KnownPgType>;

type QTables = Record<string, [string, TableCol][]>;

type uniqueNestedKeys<nested extends Record<string, Record<string, any>>> =
  nested[string];

type mkTables<
  qTables extends QTables,
  fromItems extends FromItems,
  group extends Record<string, string[]> = {}
> = mkTablesNested<qTables, fromItems, fromItems, group>;

type allFields<
  qTables extends QTables,
  fromItems extends FromItems
> = fromItems extends [
  infer head extends [infer tableName extends keyof qTables, any],
  ...infer tail extends FromItems
]
  ? [...qTables[head[0]], ...allFields<qTables, tail>]
  : [];

type mkTablesNested<
  qTables extends QTables,
  fromItems extends FromItems,
  allFromItems extends FromItems,
  group extends Record<string, string[]>
> =
fromItems["length"] extends 0
  ? {}
  : fromItems extends [
      infer head extends [
        keyof qTables,
        string
      ],
      ...infer rest extends FromItems
    ]
  ? {
      [k in head[1]]: mkColumns<
        qTables[head[0]],
        removeDuplicated<qTables[head[0]]>[number],
        {} extends group ? false : true,
        k extends keyof group ? group[k][number] : never
      >;
    } & mkColumns<
      qTables[head[0]],
      removeDuplicated<allFields<qTables, allFromItems>>[number],
      {} extends group ? false : true,
      head[1] extends keyof group ? group[head[1]][number] : never
    > &
      mkTablesNested<qTables, rest, allFromItems, group>
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
      [columnName, Col<columnName, mkColumnType<columnData>>],
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

type getSubQueryExpressionType<
  cols extends SelectQuant,
  rows extends SelectQuant,
  Exps extends Selected
> = [cols, rows] extends ["single", "single"] ? Exps[0]["pgType"] : unknown;

type getSubQueryExpressionName<
  cols extends SelectQuant,
  rows extends SelectQuant,
  Exps extends Selected
> = [cols, rows] extends ["single", "single"] ? Exps[0]["name"] : Unk;

type getColsQuant<exps extends Selected> = exps["length"] extends 1
  ? "single"
  : "multi";

class AliasSubquery<
  alias extends string | null,
  exps extends Selected,
  rows extends SelectQuant
> extends AliasExpression<
  alias extends null
    ? getSubQueryExpressionName<getColsQuant<exps>, rows, exps>
    : alias,
  getSubQueryExpressionType<getColsQuant<exps>, rows, exps>,
  "No"
> {
  exps: exps;
  rows: rows;
  constructor(exps: exps, rows: rows) {
    // @ts-ignore
    super();
    this.exps = exps;
    this.rows = rows;
  }
}

class SubQuery<
  exps extends Selected,
  rows extends SelectQuant
> extends AliasSubquery<null, exps, rows> {
  subquery: "subquery" = "subquery";
  constructor(exps: exps, rows: rows) {
    super(exps, rows);
  }
  AS = <name extends string>(name: name): AliasSubquery<name, exps, rows> => {
    // @ts-ignore
    return null;
  };
  toType = (): ExpandRecursively<queryType<exps>> => {
    // @ts-ignore
    return null;
  };
}

type mkSelectedColumn<Col extends SingleSelectable> = Expression<
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
  exps,
  rows
> {
  limit: "limit" = "limit";
  LIMIT = <const n extends number>(
    n: n
  ): SubQuery<exps, n extends 1 ? "single" : rows> => {
    // @ts-ignore
    return null;
  };
}

type AnyData = Data<any, any, any>;

type mkOrderTables<
  exps extends Selected,
  data extends Data<any, any, any> | null
> = data extends AnyData
  ? mkTables<data["qTables"], data["fromItems"], data["grouped"]>
  : mkTablesExp<exps>["union"];

class OrderBy<
  data extends Data<any, any, any> | null,
  rows extends SelectQuant,
  exps extends Selected
> extends Limit<exps, rows> {
  orderBy: "orderBy" = "orderBy";
  ORDER_BY = <Q extends Selectables>(
    f: (x: mkOrderTables<exps, data>) => Q
  ): Limit<exps, rows> => {
    // @ts-ignore
    return null;
  };
}

type queryType<exps extends SingleSelected[]> = exps extends [
  infer head extends SingleSelected,
  ...infer tail extends SingleSelected[]
]
  ? [[head["name"], ToJsType<head["pgType"]>], ...queryType<tail>]
  : [];

type unionSelectables<exps extends SingleSelected[]> = exps extends [
  infer head extends SingleSelected,
  ...infer tail extends SingleSelected[]
]
  ? [Col<string, head["pgType"]>, ...unionSelectables<tail>]
  : [];

class Union<
  data extends Data<any, any, any> | null,
  rows extends SelectQuant,
  exps extends Selected
> extends OrderBy<data, rows, exps> {
  union: "union" = "union";
  UNION = <T extends Union<any, any, unionSelectables<exps>>>(
    // UNION = <T extends Union<any, any, [Col<string, "int">]>>(
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

type SingleSelected = Col<string, KnownPgType>;

type Selected = NonEmptyArray<SingleSelected>;

type SingleSelectable = Selectables[number];

type Selectables =
  | NonEmptyArray<AliasExpression<any, KnownPgType, "No">>
  | NonEmptyArray<AliasExpression<any, KnownPgType, "Post">>;

type AnyTables = Record<string, any>;

type AnyFromItems = Record<string, any>;

class Data<
  qTables extends QTables,
  fromItems extends FromItems,
  grouped extends Record<string, string[]>
> {
  grouped: grouped;
  qTables: qTables;
  fromItems: fromItems;
  constructor(grouped: grouped, qTables: qTables, fromItems: fromItems) {
    this.grouped = grouped;
    this.qTables = qTables;
    this.fromItems = fromItems;
  }
}

type AnyGroupExp = PathExpression<any, any, any, "No">;

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

// type resetExp<exp extends Selectables[number]> = never
type resetExp<exp extends Selectables[number]> = Col<
  exp["name"],
  exp["pgType"]
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

const froms = FROM("pet", "p").FROM("person", "p2");

const ttt = SELECT(x => x, froms)

// const t = jsonb_build_object('age', lit(5))

// type lol = ExpandRecursively<typeof t["pgType"]>

// const f = SELECT(
//   (x) => [
//     MAX(binop(x.p2.age, "+", 5)),
//     MAX(x.p2.age).AS("lol"),
//     // JSONB_AGG(JSONB_BUILD_OBJECT("age", x.p2.age)),
//   ],
//   froms
// );

// // const l = lit([{ age: 3 }]);

// // const s = SELECT([lit(3), lit(5), lit([{ age: 5 }, { age: 8 }])]);
// const s = SELECT([lit(5), lit(3)]);

// const s2 = SELECT((x) => x.person.age, FROM("person"));

// const louoeaul = f
//   .UNION(s)
//   .ORDER_BY((x) => [x.lol])
//   .LIMIT(1)
//   .AS("myquery");

// const simpleFrom = SELECT((x) => [x.pet.nickname, x.pet.owner_id, x.owner_id], FROM("pet").FROM("person"));

// const fromFrom = SELECT(x => x. , simpleFrom)

// type X = 'col' extends string ? 1 : 2

// const x = jsonb_agg()

// const t = f.UNION( SELECT([lit(1), ]) )

// type Exp1<T> = T extends Union<any, any, any> ? T : never

// type T123 = Exp1<typeof f>

// const q = SELECT(
//   (x) => [max(x.person.id), jsonb_agg(x.person.age)],
//   FROM("person")
// ).toType();

// const u = SELECT([lit(132).AS("abc"), q]);
// const u = SELECT([q, res]);

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

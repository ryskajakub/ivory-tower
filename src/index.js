"use strict";
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
};
class Col {
    constructor(name, pgType) {
        name = name;
        pgType = pgType;
    }
}
class AliasExpression extends Col {
    constructor(name, pgType, aggState) {
        super(name, pgType);
        this.toColumn = () => {
            return new AliasExpression(this.name, this.pgType, this.aggState);
        };
        aggState = aggState;
    }
}
// type mkThat<operator extends Operator, pgType extends PgType> = [
//   "+",
//   "int"
// ] extends [operator, "int"]
//   ? Exp<pgType, "No">
//   : ["-", "int"] extends [operator, "int"]
//   ? Exp<pgType, "No">
//   : Exp<"boolean", "No">;
class Expression extends AliasExpression {
    constructor(name, pgType, aggState) {
        super(name, pgType, aggState);
        this.AS = (alias) => {
            // @ts-ignore
            return null;
        };
        this.op = (operator, that) => {
            // @ts-ignore
            return null;
        };
    }
}
class PathExpression extends Expression {
    constructor(path, name, pgType, aggState) {
        super(name, pgType, aggState);
        this.path = path;
    }
}
class JsonB {
}
const jsonb_agg = (exp) => {
    // @ts-ignore
    return null;
};
const max = (exp) => {
    // @ts-ignore
    return null;
};
const jsonb_build_object = (...t) => {
    // @ts-ignore
    return null;
};
const lit = (t) => {
    // @ts-ignore
    return null;
};
class Empty {
}
class SubQuery extends Expression {
}
class Limit extends SubQuery {
}
class OrderBy extends Limit {
    constructor() {
        super(...arguments);
        this.ORDER_BY = (f) => {
            // @ts-ignore
            return null;
        };
    }
}
class Union extends OrderBy {
    constructor() {
        super(...arguments);
        // UNION = <T extends Union<any, any, unionSelectables<exps>>>(
        this.UNION = (x) => {
            // @ts-ignore
            return null;
        };
        this.toType = () => {
            // @ts-ignore
            return null;
        };
    }
}
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
class Data {
}
class GroupBy extends Data {
    constructor() {
        super(...arguments);
        this.GROUP_BY = (fun) => {
            // @ts-ignore
            return null;
        };
    }
}
class Where extends GroupBy {
    constructor() {
        super(...arguments);
        this.WHERE = (fun) => {
            // @ts-ignore
            return null;
        };
    }
}
// type ABC1 = mkFrom<QueriedTablesOutside, [], "person", []>;
// @ts-ignore
const xxx = null;
// xxx.WHERE(x => x.)
class From extends Where {
    FROM(table, ...alias) {
        // @ts-ignore
        return null;
    }
}
const literal = (lit) => {
    // @ts-ignore
    return null;
};
const SELECT = (fun, ...j) => {
    // @ts-ignore
    return null;
};
// type TTT = mkQueryTables<mkMutable<typeof tables>>
// // type UUU = mkFromAlias<TTT, [], "person", "p">
// // @ts-ignore
// const t: TTT = null
const mkDb = (tables) => {
    return {
        FROM: (table, ...alias) => {
            // @ts-ignore
            return null;
        },
    };
};
const { FROM } = mkDb(tables);
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
// const t = jsonb_build_object('age', lit(5))
// type lol = ExpandRecursively<typeof t["pgType"]>
const f = SELECT((x) => [
    max(x.p2.age.op("-", lit(5))).op("+", lit(1)),
    // jsonb_agg(jsonb_build_object("age", x.p2.age)),
], froms);
// const l = lit([{ age: 3 }]);
const s = SELECT([lit(3)]);
// type Mňo = typeof s extends Union<any, any, [Col<string, "int">]> ? 1 : 2;
const louoeaul = f.UNION(s);
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

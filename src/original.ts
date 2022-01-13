type Definition = IntColumnDefinition | StringColumnDefinition

type Column = IntColumn | StringColumn

type IntColumn = {
    type: "int"
}

type IntColumnDefinition = {
    type: "int"
}

type StringColumn = {
    type: "string"
}

type StringColumnDefinition = {
    type: "string"
}

type Person = {
    id: IntColumnDefinition,
    name: StringColumnDefinition,
}

type Animal = {
    id: IntColumnDefinition,
    type: StringColumnDefinition,
    owner: IntColumnDefinition,
}

type TableName = {
    tableName: string
}

type Table<ColumnDefinitions> =
    ColumnDefinitions extends { [key: string]: Definition } ?
    {
        columns: ColumnDefinitions,
        tableName: string
    }
    : never

type MkColumn<ColD extends Column> =
    ColD extends StringColumnDefinition ? StringColumn :
    IntColumn

type IsColumn<C extends Column> =
    C extends StringColumn ? StringColumn :
    C extends IntColumn ? IntColumn :
    never

type Query<Columns> =
    Columns extends { [key: string]: Column } ?
    {
        columns: {
            [C in keyof Columns]: Columns[C]
        },
        name: string,
    }
    : never

type TableQuery<ColumnDefinitions> =
    ColumnDefinitions extends { [key: string]: Definition } ?
    Query<{
        [Column in keyof ColumnDefinitions]: MkColumn<ColumnDefinitions[Column]>
    }>
    : never

type MulQueries<A> = A extends [infer QueryA, ...infer RestQ] ?
    (
        QueryA extends Query<any> ? (RestQ["length"] extends 0 ? [QueryA] : [QueryA, ...MulQueries<RestQ>]) : never
    )
    : never

// type T<Columns extends { [key: string]: Column }> = 3

type ExtractMulQ<A> = A extends [infer QueryA, ...infer RestQ] ?
    (
        QueryA extends { columns: { [key: string]: Column } } ?
        (RestQ["length"] extends 0 ? [QueryA["columns"]] : [QueryA["columns"], ...ExtractMulQ<RestQ>])
        : never
    )
    : never

const personTable: Table<Person> = {
    tableName: "person",
    columns: {
        id: {
            type: "int"
        },
        name: {
            type: "string"
        }
    }
}

const persons = selectTable(personTable)

function selectTable<A>(t: Table<A>): MulQueries<[TableQuery<A>]> {
    const tableName = t.tableName
    // @ts-ignore
    return [{
        columns: t.columns,
        name: tableName,
    }]
}

function selectTable0<A>(t: Table<A>): TableQuery<A> {
    const tableName = t.tableName
    // @ts-ignore
    return {
        // @ts-ignore
        columns: t.columns,
        name: tableName,
    }
}


const animalsTable: Table<Animal> = {
    tableName: "animals",
    columns: {
        id: {
            type: "int"
        },
        owner: {
            type: "int"
        },
        type: {
            type: "string"
        }
    }
}

type Equality = {
    type: "Equality",
    element1: Column,
    element2: Column,
}

function equality<A extends Column>(element1: A, element2: A): Equality {
    return {
        type: "Equality",
        element1,
        element2,
    }
}

type Condition = Equality

function joinTable<MulQ extends any[], T>(
    queryA: MulQ, table2: Table<T>, on: (e: ExtractMulQ<[...MulQ, TableQuery<T>]>) => Condition): MulQueries<[...MulQ, TableQuery<T>]> {
    // @ts-ignore
    return {

    }
}

function where<MulQ extends any[], T>(mulQ: MulQ, condition: (e: ExtractMulQ<[MulQ]>) => Condition): MulQueries<[MulQ]> {
    // @ts-ignore 
    return {

    }
}

type CountStar = {
    type: "CountStar"
}

type Count = {
    type: "Count",
    columnName: string,
}

type Sum = {
    type: "Sum",
    columnName: string,
}

function count(column: StringColumn): Count {
    return {
        type: "Count",
        columnName: column.type
    }
}

type AggFun = CountStar | Count | Sum

type AggsResult<Aggs extends readonly any[]> = Aggs extends [infer Item, ...infer Rest] ?
    (Item extends AggFun ? (Rest["length"] extends 0 ? [Item] : [Item, ...AggsResult<Rest>]) : never) :
    never

function groupBy<MulQ extends any[], Aggs extends readonly any[]>(mulQ: MulQ, by: (e: ExtractMulQ<MulQ>) => Column, aggs: (col: ExtractMulQ<MulQ>) => Aggs): AggsResult<Aggs> {
    // @ts-ignore
    return {

    }
}

type Result<MulQ extends any[]> = MulQ extends [infer Item, ...infer Rest] ?
    (Item extends { columns: { [key: string]: Column } } ?
        (Rest["length"] extends 0 ? [Item["columns"]] : [Item["columns"], ...ExtractMulQ<Rest>])
        : never
    )
    : never

function runQuery<MulQ extends any[]>(mulQ: MulQ): Result<MulQ> {
    // @ts-ignore
    return {

    }
}

type M = {
    t: number
}

type X1 = {
    a1: string,
    b1: number,
    c1: boolean,
}

type XXX = keyof X1

const ttt: XXX = "a1"

type Disjoint<A, B> = Extract<A, B> extends never ? true : false

type DisjointUnion<Obj1, Obj2> = Obj1 extends Record<string, any> ? (
    Obj2 extends Record<string, any> ? (
        Disjoint<keyof Obj1, keyof Obj2> extends true ? (Obj1 & Obj2) : never
    ) : never
) : never

type DU = DisjointUnion<{ a: 3, b: 6 }, { c: 7, x: 8 }>

// type ABC = ("123" | "456") extends Exclude<"123", "456" | "0123" | "0456"> ? 1 :0

type ABC = Extract<"123" | "456", "0123" | "0456">

type T = Disjoint<"123" | "456", "0123" | "0456">

// type T = never extends never ? 1 : 2 
type X = "123" | "456" extends "123" | "456" | "789" ? 1 : 0

const joined = joinTable(persons, animalsTable, (e) => equality(e[0].id, e[1].id))
const joined2 = joinTable(joined, animalsTable, (e) => equality(e[0].id, e[2].owner))
const aggregated = groupBy(persons, (e => e[0].id), (e => [count(e[0].name)] as [Count]))

const ranQuery = runQuery(joined)

type PersonQuery = TableQuery<Person>

type QQ = MulQueries<[PersonQuery, PersonQuery]>

// function joinTables<T, A extends MulQueries<T>>(tables: MulQ)
import { Gt } from "ts-arithmetic"
import { Get, Post } from "./api"

export type LiteralPath<A extends string> = {
    type: "literal",
    path: A
}

export type ParamPath<A> = {
    type: "param",
    name: A
}

export type PathBuilder<ExtMethod extends Method, Paths extends Path[]> = {
    method: ExtMethod,
    paths: Paths,
    addPath: <A extends string>(path: A) => PathBuilder<ExtMethod, MkPathType<A, Paths>>
}

export type Path = LiteralPath<any> | ParamPath<any>

export type MkPathType<ExtendsPath extends string, Paths extends Path[]> = 
    ExtendsPath extends `:${infer ParamName}` ? [...Paths, ParamPath<ParamName>]
    : [...Paths, LiteralPath<ExtendsPath>]
/*
    ExtendsPath extends LiteralPath<infer S> ? [...Paths, S] : 
    ExtendsPath extends ParamPath<infer A> ? [...Paths, A] : never
    */

export type Method = "GET" | "POST"

export type AddPath<ExtPaths extends Path[], ExtPath extends string> = 
    ExtPath extends `:${infer ParamName}` ? [...ExtPaths, ParamPath<ParamName>]
    : [...ExtPaths, LiteralPath<ExtPath>]

export type DispatchMethod<ExtMethod extends Method, ExtPaths extends Path[]> =
    ExtMethod extends "GET" ? Get<ExtPaths> : Post<ExtPaths>

// type T = Gt<1, 1>

type Bubble<T extends number[]> = 
    T extends [infer Head extends number, infer Second extends number, ...infer Rest extends number[]] ? 
        (Gt<Head, Second> extends 1 ? [Second, ...Bubble<[Head, ...Rest]>] : [Head, ...Bubble<[Second, ...Rest]>]) : T

type TTT = Sort<[9, 1, 1, 8, 3, 5]>

type Sort<T extends number[]> = 
    Bubble<T> extends [...infer Init extends number[], infer Last extends number] ? [...Sort<Init>, Last] : T



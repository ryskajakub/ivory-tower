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

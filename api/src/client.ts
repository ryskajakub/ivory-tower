import axios from "axios";
import { Api, IsTargetMany } from "./api";
import { Runtime } from "./entity";
import { ExpandType } from "./types";

export type EntityLike = {
    fields: Record<string, any>,
}

export type InnerRequestType<T extends EntityLike> = 
    ExpandType<{
        [K in keyof T["fields"]]?: true
    } & (
        "relations" extends keyof T ?
            RequestType<T["relations"], "inner"> : {}
    )>
    
type Nesting = "toplevel" | "inner"

type Equality = {
    type: "boolexpr"
    args: any[]
}

class Arg<A> {

    #arg;

    constructor(arg: any) {
        this.#arg = arg
    }

    "=" = (other: Runtime<A>): Equality => {
        return {
            type: "boolexpr",
            args: [this, other]
        }
    }

    protected getArg = () => {
        return this.#arg
    }
}

type MakeWhereArgs<T> =
    {
        [K in keyof T]: Arg<T[K]>
    } 

export type RequestType<T, $Nesting extends Nesting> =
    {
        [K in keyof T]?: (
            T[K] extends EntityLike ? ExpandType<InnerRequestType<T[K]>> : never
        ) | ($Nesting extends "toplevel" ? (T[K] extends EntityLike ? {
            select: ExpandType<InnerRequestType<T[K]>>,
            where: (filter: MakeWhereArgs<T[K]["fields"]>) => Equality
        } :never ) : never )
    } 

export type Quantify<Api, Wrapee> = 
    "type" extends keyof Api ?
    (IsTargetMany<Api["type"]> extends true ? Array<Wrapee>: Wrapee) :
    Array<Wrapee>

export type EntityReturnType<Api, Request> =
    Quantify<Api, ("fields" extends keyof Api ? {
        [K in keyof Api["fields"] as GetKey<K, Request>]: 
            Runtime<Api["fields"][K]>
    } : {})
    &
    ("relations" extends keyof Api ? 
        ExpandType<ReturnType<Api["relations"], Request>>
        : {}
    )>

export type GetRequest<K, Request> = 
    Request extends true ? true :
    K extends keyof Request ? Request[K] : never

export type GetKey<K, Request> = 
    Request extends true ? K :
    K extends keyof Request ? K : never

export type ReturnType<Api, Request> = {
    [K in keyof Api as GetKey<K, Request>]:
        ExpandType<EntityReturnType<Api[K], GetRequest<K, Request>>>
}  

export type Check<T> = {
    [K in keyof T]: Check<T[K]>
}

export async function call<T, X extends RequestType<T, "toplevel">>(api: Api<T>, request: X): Promise<ExpandType<ReturnType<T, X>>> {
    const response = await axios.post<ReturnType<T, X>>(`http://localhost:6000/graph`, request) 
    return response.data
}

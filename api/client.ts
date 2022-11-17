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
            RequestType<T["relations"]> : {}
    )>
    

export type RequestType<T> =
    {
        [K in keyof T]?: true | (
            T[K] extends EntityLike ? ExpandType<InnerRequestType<T[K]>> : true
        )
    } | true

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

export function call<T, X extends RequestType<T>>(api: Api<T>, request: X): ExpandType<ReturnType<T, X>> {
    // @ts-ignore
    return
}

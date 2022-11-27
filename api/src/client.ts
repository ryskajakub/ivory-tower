import axios from "axios";
import { Api, Entities, Entity, GetLeafSpec, Relation, RelationshipType } from "./api";
import { Leaf, LeafSpec, Runtime } from "./entity";
import { IsTargetMany, Pluralify } from "./plural";
import { ExpandType } from "./types";

export type EntityLike = {
    fields: Record<string, any>,
}

export type Equality = {
    field: string,
    literal: any
}

export class Field<RuntimeType> {

    constructor(private path: string) {}

    "=" = (lit: RuntimeType): Equality => {
        return {
            field: this.path,
            literal: lit
        }
    }
}

type MkFields<T> = {
    [K in keyof T]: T[K] extends GetLeafSpec<infer $Spec> ? Field<Runtime<$Spec>> : never
}

export type InnerRequestType<T extends Entity> = 
    {
        select?: (keyof T["fields"])[],
        where?: (x: MkFields<T["fields"]>) => Equality
    }
    &
    (
        T extends Required<Entity> ?
    {
        relations?: RequestType<T["relations"]>
    }
    : {}
    )

export type RequestType<T extends Entities> =
    {
        [K in keyof T as Pluralify<K, T[K] extends Relation ? T[K]["type"] : null>]?: (
            InnerRequestType<T[K]>
        ) 
    } 

export type Quantify<Api, Wrapee> = 
    "type" extends keyof Api ?
    (IsTargetMany<Api["type"]> extends true ? Array<Wrapee> : 
        Api["type"] extends "fromOne" ? Wrapee | null : Wrapee
    ) :
    Array<Wrapee>

export type EntityReturnType<Api, Request> =
    Quantify<Api, ("fields" extends keyof Api ? ("select" extends keyof Request ? {
        [K in keyof Api["fields"] as GetKeyArray<K, Request["select"]>]: 
            Runtime<Api["fields"][K]>
    } : Request) : Request)
    &
    ("relations" extends keyof Api ? 
        (
            "relations" extends keyof Request ?
            ExpandType<ReturnType<Api["relations"], Request["relations"]>> :
            {}
        )
        : {}
    )>

export type GetRequest<K, Request> = 
    Request extends true ? true :
    K extends keyof Request ? Request[K] : never

export type GetKeyArray<K, Array> = Array extends (infer T)[] ? (K extends T ? K : never) : never

export type GetKey<K, Request> = 
    Request extends true ? K :
    K extends keyof Request ? K : never

export type GetRelationshipType<$Entity> = 
    "type" extends keyof $Entity ? ($Entity["type"] extends RelationshipType ? $Entity["type"] : never ): null

export type ReturnType<$Entities, Request> = {
    [K in keyof $Entities as GetKey<Pluralify<K, GetRelationshipType<$Entities[K]>>, Request>]:
        ExpandType<EntityReturnType<$Entities[K], GetRequest<Pluralify<K, GetRelationshipType<$Entities[K]>>, Request>>>
}

export type Check<T> = {
    [K in keyof T]: Check<T[K]>
}

export async function call<T extends Entities, X extends RequestType<T>>(api: Api<T>, request: X): Promise<ExpandType<ReturnType<T, X>>> {
    const response = await axios.post<ReturnType<T, X>>(`http://localhost:6000/graph`, request) 
    return response.data
}

import axios from "axios";
import { ExpandType } from "../../util/src/types";
import { Api, Entities, Entity, GetLeafSpec, Relation, RelationshipType } from "./api";
import { Leaf, LeafSpec, Runtime } from "./entity";
import { IsTargetMany, Pluralify } from "./plural";

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

type IsSingular<T extends RelationshipType> = 
    T extends "manyToOne" ? true : 
    T extends "toOne" ? true :
    T extends "fromOne" ? true : false

type PluralType<T extends Entity> = {
    where?: (x: MkFields<T["fields"]>) => Equality,
    mode?: "object"
}

export type InnerRequestType<T extends Entity> = 
    {
        select?: (keyof T["fields"])[],
    } & 
    (
        T extends Required<Entity> ?
        { relations?: RequestType<T["relations"]> } : 
        {}
    ) &
    (
        T extends Relation ? 
        ( IsSingular<T["type"]> extends true ? {} : PluralType<T> ) :
        PluralType<T>
    )

export type RequestType<T extends Entities> =
    {
        [K in keyof T as Pluralify<K, T[K] extends Relation ? T[K]["type"] : null>]?: InnerRequestType<T[K]> 
    }

export type ArrayOrObject<$Entity, Wrapee, Request> = 
    "mode" extends keyof Request ? Record<number, Wrapee> : Array<Wrapee>

export type Quantify<$Entity, Wrapee, Request> = 
    "type" extends keyof $Entity ?
    (IsTargetMany<$Entity["type"]> extends true ? ArrayOrObject<$Entity, Wrapee, Request> : 
        $Entity["type"] extends "fromOne" ? Wrapee | null : Wrapee
    ) :
    ArrayOrObject<$Entity, Wrapee, Request>

export type EntityReturnType<$Entity, Request> =
    Quantify<$Entity, ExpandType<("fields" extends keyof $Entity ? ("select" extends keyof Request ? {
        [K in keyof $Entity["fields"] as GetKeyArray<K, Request["select"]>]: 
            Runtime<$Entity["fields"][K]>
    } : Request) : Request)
    &
    ("relations" extends keyof $Entity ? 
        (
            "relations" extends keyof Request ?
            ExpandType<ReturnType<$Entity["relations"], Request["relations"]>> :
            {}
        )
        : {}
    )>, Request>

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
        EntityReturnType<$Entities[K], GetRequest<Pluralify<K, GetRelationshipType<$Entities[K]>>, Request>>
}

export type Check<T> = {
    [K in keyof T]: Check<T[K]>
}

export async function call<T extends Entities, X extends RequestType<T>>(api: Api<T>, request: X): Promise<ReturnType<T, X>> {
    const response = await axios.post<ReturnType<T, X>>(`http://localhost:6000/graph`, request) 
    return response.data
}

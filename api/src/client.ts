import axios from "axios";
import { Api, Entities, RelationshipType } from "./api";
import { Runtime } from "./entity";
import { IsTargetMany, Pluralify } from "./plural";
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

export type RequestType<T> =
    {
        [K in keyof T as Pluralify<K, "type" extends keyof T[K] ? (T[K]["type"] extends RelationshipType ? T[K]["type"] : null ) : null >]?: (
            T[K] extends EntityLike ? ExpandType<InnerRequestType<T[K]>> : never
        ) 
        
        /*
        | ($Nesting extends "toplevel" ? (T[K] extends EntityLike ? {
            select: ExpandType<InnerRequestType<T[K]>>,
            where: (filter: MakeWhereArgs<T[K]["fields"]>) => Equality
        } :never ) : never )
        */
    } 

export type Quantify<Api, Wrapee> = 
    "type" extends keyof Api ?
    (IsTargetMany<Api["type"]> extends true ? Array<Wrapee> : 
        Api["type"] extends "fromOne" ? Wrapee | null : Wrapee
    ) :
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

import { ExpandType } from "./types"

type RelationshipType = "manyToOne" | "oneToMany" | "manyToMany" | "toOne" | "fromOne"

type Pointer<To, Type extends RelationshipType> = {
    to: To,
    type: Type
}

type Relationship<From, To, Type extends RelationshipType> = {
    from: From,
} & Pointer<To, Type>

type RelEntity<Name> = {
    [K in RelationshipType]: <Other extends RelEntity<any>>(other: Other) => Other extends RelEntity<infer OtherName> ? Relationship<Name, OtherName, K> : never
}

type MkE<Entities> = {
    [K in keyof Entities]: RelEntity<K>
}

type ReverseRelationshipType<$RelationshipType extends RelationshipType> = 
    $RelationshipType extends "manyToOne" ? "oneToMany" : 
    $RelationshipType extends "oneToMany" ? "manyToOne" :
    $RelationshipType extends "manyToMany" ? "manyToMany" :
    $RelationshipType extends "toOne" ? "fromOne" : "toOne" 

type GetMatchingRel<Key, Rel> = 
    Rel extends Relationship<infer From, infer To, infer Type> ?
        Key extends From ? {
            to: To,
            type: Type,
        } : 
        Key extends To ? {
            to: From,
            type: ReverseRelationshipType<Type>
        } : null
    : never

type MatchedRels<Ptrs, Rest> = {
    matchingPointers: Ptrs,
    restRels: Rest,
}

type GetMatchingRels<Key, Rels extends readonly any[], MatchingPointers extends {}, RestRels extends any[]> = 
    Rels["length"] extends 0 ? {
        matchingPointers: MatchingPointers,
        restRels: RestRels
    } :
        Rels extends readonly [infer Head, ...infer Rest] ?
        (
            GetMatchingRel<Key, Head> extends Pointer<infer To extends string, infer Type> ?
                GetMatchingRels<Key, Rest, MatchingPointers & { [K in To]: Type }, RestRels> :
                GetMatchingRels<Key, Rest, MatchingPointers, [Head, ...RestRels]>
        )
        : never

type MkEnhancedEntity<Key, Entity, AllEntities, Rels extends readonly any[]> = 
{
    fields: {
        [K in keyof Entity]: Entity[K]
    } 
} & (
        GetMatchingRels<Key, Rels, {}, []> extends MatchedRels<infer Ptrs, infer Rest extends readonly any[]> ?
        (
            {} extends Ptrs ? {} :
            {
                relations: {
                    [K in keyof Ptrs as Pluralify<K, Ptrs[K]>]: {
                        type: Ptrs[K],
                    } & (
                        K extends (keyof AllEntities) ? MkEnhancedEntity<K, AllEntities[K], AllEntities, Rest> : never
                    )
                }
            }
        )
        : never
    )

type PluralName<Name> = Name extends string ? `${Name}s` : Name

type Pluralify<Name, Type> = IsTargetMany<Type> extends true ? PluralName<Name> : Name

export type IsTargetMany<Name> = Name extends `${infer Ignore}ToMany` ? true : false

type MkEnhancedEntities<Entities, Relationships extends readonly any[]> = {
    [K in keyof Entities as PluralName<K>]: ExpandType<MkEnhancedEntity<K, Entities[K], Entities, Relationships>>
}

export type Api<T> = {
    entities: T
}

export function api<Entities extends Record<string, any>, Relationships extends readonly any[]>(entities: Entities, mkRelationships: (entities: MkE<Entities>) => Relationships): Api<ExpandType<MkEnhancedEntities<Entities, Relationships>>> {
    // const relations = mkRelationships(entities)
    // @ts-ignore
    return
}
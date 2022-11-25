import { mapValues } from "./helpers"
import { ExpandType } from "./types"

export type RelationshipType = "manyToOne" | "oneToMany" | "manyToMany" | "toOne" | "fromOne" | "reverseManyToMany"

const allRelationshipTypes = ["manyToOne", "oneToMany", "manyToMany", "toOne", "fromOne", "reverseManyToMany"] as const

type Pointer<To, Type extends RelationshipType> = {
    to: To,
    type: Type
}

type Relationship<From, To, Type extends RelationshipType> = {
    from: From,
} & Pointer<To, Type>

type AnyRelationship = Relationship<any, any, any>

type RelEntity<Name> = {
    [K in RelationshipType]: <Other extends RelEntity<any>>(other: Other) => Other extends RelEntity<infer OtherName> ? Relationship<Name, OtherName, K> : never
} & {
    name: Name
}

type MkE<Entities> = {
    [K in keyof Entities]: RelEntity<K>
}

type ReverseRelationshipType<$RelationshipType extends RelationshipType> = 
    $RelationshipType extends "manyToOne" ? "oneToMany" : 
    $RelationshipType extends "oneToMany" ? "manyToOne" :
    $RelationshipType extends "manyToMany" ? "reverseManyToMany" :
    $RelationshipType extends "reverseManyToMany" ? "manyToMany" :
    $RelationshipType extends "toOne" ? "fromOne" : "toOne" 

const reverseRelationshipType = (rel: RelationshipType): RelationshipType => {
    switch(rel) {
        case "fromOne": return "toOne"
        case "toOne": return "fromOne"
        case "manyToMany": return "reverseManyToMany"
        case "reverseManyToMany": return "manyToMany"
        case "manyToOne": return "oneToMany"
        case "oneToMany": return "manyToOne"
    }
}

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
                    [K in keyof Ptrs]: {
                        type: Ptrs[K],
                    } & (
                        K extends (keyof AllEntities) ? MkEnhancedEntity<K, AllEntities[K], AllEntities, Rest> : never
                    )
                }
            }
        )
        : never
    )

// type PluralName<Name> = Name extends string ? `${Name}s` : Name

// type Pluralify<Name, Type> = IsTargetMany<Type> extends true ? PluralName<Name> : Name

export type IsTargetMany<Name> = Name extends `${infer Ignore}ToMany` ? true : false

type MkEnhancedEntities<Entities, Relationships extends readonly any[]> = {
    [K in keyof Entities]: ExpandType<MkEnhancedEntity<K, Entities[K], Entities, Relationships>>
}

export type Api<T> = {
    entities: T
}

export type Relation = Entity & {
    type: RelationshipType,
}

export type Entity = {
    relations?: Record<string, Relation>,
    fields: Record<string, any>,
}

export type Entities = Record<string, Entity>

export function api<Entities extends Record<string, any>, Relationships extends readonly AnyRelationship[]>(entities: Entities, mkRelationships: (entities: MkE<Entities>) => Relationships): Api<ExpandType<MkEnhancedEntities<Entities, Relationships>>> {

    const entitiesForRelationships = mapValues(entities, (value, key) => {
        const entries = Object.fromEntries(allRelationshipTypes.map(relationshipType => [relationshipType, (other: any) => ({
            type: relationshipType,
            from: key,
            to: other.name
        }) ]))
        return {
            ...entries,
            name: key
        }
    }) 

    const allRelations = mkRelationships(entitiesForRelationships as any)

    const dealWithEntities = ($entities: Record<string, any>, $relations: readonly AnyRelationship[]) => {

        // @ts-ignore
        const enrichEntity = (entityKey, entityValue, applicableRelations) => {

            // @ts-ignore
            const [matchingPointers, restRelations] = applicableRelations.reduce<[Record<string, any>, AnyRelationship[]]>(([$matchingPointers, $restRelations], relation) => {
                const {from, to, type} = relation
                if (from === entityKey) {
                    return [{...$matchingPointers, [to]: type }, $restRelations]
                } 
                if (to === entityKey) {
                    return [{...$matchingPointers, [from]: reverseRelationshipType(type) }, $restRelations]
                }
                return [$matchingPointers, [...$restRelations, relation]]
            }, [{}, []])

            // @ts-ignore
            const relationsForEntity = Object.keys(matchingPointers).length === 0 ? {} : {
                relations: mapValues(matchingPointers, (relationType, $entityKey) => {

                    const $entityValue = entities[$entityKey]

                    return {
                        type: relationType,
                        ...enrichEntity($entityKey, $entityValue, restRelations)
                    }
                })
            }

            // @ts-ignore
            const e = {
                ...relationsForEntity,
                fields: entityValue
            }
            return e
        }

        const enrichedEntities = Object.entries($entities).map(([entityKey, entityValue]) => {
            return [entityKey, enrichEntity(entityKey, entityValue, $relations)]
        })

        return Object.fromEntries(enrichedEntities)

    }

    return {
        entities: dealWithEntities(entities, allRelations) as ExpandType<MkEnhancedEntities<Entities, Relationships>>
    }
}

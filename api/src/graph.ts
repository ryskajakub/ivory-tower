export type MkRelations<$Specs extends Record<string, import("./entity").ObjectSpec>> =
    {
        [K in keyof $Specs]: {
            entity: EntityRelation<K>
        }
    }

export type Relation = ManyToOne<unknown, unknown>

export type ManyToOne<ManyEntity, OneEntity> = {
    type: "manyToOne",
    manyEntity: ManyEntity,
    oneEntity: OneEntity,
}

export type EntityRelation<E> = {
    entity: E,
    manyToOne: <E2>(other: FieldRelation<E2>) => ManyToOne<E, E2>,
    // oneToOne: (other: FieldRelation) => void,
}

export type FieldRelation<E> = {
    entity: E,
    // manyToMany: (other: FieldRelation) => void
}

export type Graph<Entities extends Record<string, any>> = {
    entities: Entities
}

export type RunRelation<K extends keyof Entities, Entity, Entities, $Relation extends Relation> =
    $Relation extends ManyToOne<infer ManyEntity, infer OneEntity> ?
    (
        // ManyEntity extends K ? { [KK in keyof K]: Entity & { relations: { ["rel"]: Entities[K] } } } : { [KK in keyof K]: Entity }
        // ManyEntity extends K ? 5 : 9
    )
    : never

// export type RunRelations<K, Entity, Entities extends Record<string, any>, Relations extends Relation[]> = 
//     Relations["length"] extends 0 ? Entity : Relations extends [infer R, ...infer Rest] ? RunRelations<> : never

export type MkGraph<Entities extends Record<string, any>, Relations extends Relation> = {
    [K in keyof Entities]: RunRelation<K, Entities[K], Entities, Relations>
}

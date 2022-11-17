import { ExpandType } from "./types"

export type NumberSpec = {
    type: "number"
}

export type StringSpec = {
    type: "string"
}

export type Nullable = {
    nullable: true
}

export type Optional = {
    optional: true
}

export type ObjectSpec = {
    type: "object",
    fields: Record<string, Spec>
}

export type UnionSpec = {
    type: "union",
    options: Record<string, Spec>
}

export type EmptySpec = {
    type: "empty"
}

export type RootSpec = ObjectSpec | UnionSpec | EmptySpec

export type LeafSpec = NumberSpec | StringSpec

export type Spec = RootSpec | LeafSpec

// export type CheckFields<Fields> = {
//     [K in keyof Fields]: Fields[K]
// }

// export type CheckAttrs<$Spec> = $Spec extends Nullable ? $Spec & Nullable : $Spec

// export type CheckEntity<Entity extends Relation & Pick<ObjectSpec, "fields">> = {
//     [K in keyof Entity["relations"]]: Entity["relations"][K]
// } & {
//         [K in keyof Entity["fields"]]: CheckAttrs<Entity["fields"][K]>
//     }

// export type CheckQueryEntity<$Spec extends ObjectSpec> = CheckSpec<$Spec>

// export type CheckSpec<$Spec> =
//     $Spec extends LeafSpec ? LeafSpec :
//     $Spec extends EmptySpec ? EmptySpec :
//     $Spec extends ObjectSpec ? {
//         type: "object",
//         fields: CheckFields<$Spec["fields"]>
//     } :
//     $Spec extends UnionSpec ? {
//         [K in keyof $Spec["options"]]: CheckSpec<$Spec["options"][K]>
//     } : never

export type Relation = {
    relations: Record<string, string>
}

export type Leaf<Spec> = {
    nullable: () => Leaf<Spec & { nullable: true }>
    optional: () => Leaf<Spec & { optional: true }>
    spec: Spec
}

export type TypeLevel<T> = 
    T extends "string" ? string : "number"

function leaf<T extends LeafSpec>(obj: T): Leaf<T> {
    const objWithLeafMethods = <X>(spec: X): Leaf<X> => ({
        spec,
        nullable: () => objWithLeafMethods({...spec, nullable: true}) ,
        optional: () => objWithLeafMethods({...spec, optional: true})
    })
    return objWithLeafMethods(obj)
}

export const number = leaf({
    type: "number",
})

export const string = leaf({
    type: "string"
})

export type Runtime<T> = 
    (T extends NumberSpec ? number : string) | ( T extends Nullable ? null : never)

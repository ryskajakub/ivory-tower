/**
 * @template { Pick<import("./entity").ObjectSpec, "fields"> & import("./entity").Relation } Entity
 * @param { Entity } spec
 * @return { import("./entity").CheckFields<Entity> }
 */
export function entity(spec) {
    // @ts-ignore
    return
}

/**
 * @template { import("./entity").LeafSpec } $Spec
 * @param { $Spec } obj 
 * @returns { $Spec & { nullable: () => $Spec & { nullable: true } } }
 */
function nullable(obj) {
    return {
        nullable: () => {
            return {
                ...obj,
                nullable: true
            }
        },
        ...obj
    }
}

/**
 * @template { import("./entity").LeafSpec } T
 * @param { T } obj 
 * @return { import("./entity").Leaf<T["type"], import("./entity").MaskLeaf<T["type"]>> }
 */
function leaf(obj) {
    // @ts-ignore
    return ;
}

export const number = leaf({
    type: "number",
})

export const string = leaf({
    type: "string"
})

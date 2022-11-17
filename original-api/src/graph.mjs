/**
 * @template { Record<string, Record<string, import("./entity").Spec>> } Entities
 * @template { import("./graph").Relation } Relation
 * @param { Entities } entities
 * @param { (entities: import("./graph").MkRelations<Entities>) => Relation } rels
 * @returns { import("./types").ExpandType<import("./graph").MkGraph<Entities, Relation>> }
 */
export function graph(entities, rels) {
    // @ts-ignore
    return;
}

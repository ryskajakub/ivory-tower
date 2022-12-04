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

export class Leaf<$Spec extends { type: any }, OmittedMethods extends never | 'nullable' | 'optional' = never>  {

    constructor(public spec: $Spec) { }

    nullable = (): Omit<Leaf<$Spec & { nullable: true }, 'nullable'>, 'nullable' | OmittedMethods> => {
        // @ts-ignore
        return new Leaf({...this.spec, nullable: true})
    }

    optional = (): Omit<Leaf<$Spec & { optional: true }, 'optional'>, 'optional' | OmittedMethods> => {
        // @ts-ignore
        return new Leaf({...this.spec, optional: true})
    }

}

export const number = new Leaf({
    type: "number" as const, 
})

export const string = new Leaf({
    type: "string" as const
})

export type Runtime<T> = T
    // (T extends NumberSpec ? number : string) | ( T extends Nullable ? null : never)

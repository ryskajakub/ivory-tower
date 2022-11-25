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

// export type Relation = {
//     relations: Record<string, string>
// }

export type TypeLevel<T> = 
    T extends "string" ? string : "number"

export class HasSpec<$Spec> {
    private spec;
    constructor(spec: $Spec) {
        this.spec = spec
    }
    protected getSpec = () => {
        return this.spec
    }
}

export class Leaf<$Spec, OmittedMethods extends never | 'nullable' | 'optional' = never> extends HasSpec<$Spec> {

    constructor(spec: $Spec) {
        super(spec)
    }

    nullable = (): Omit<Leaf<$Spec & { nullable: true }, 'nullable'>, 'nullable' | OmittedMethods> => {
        // @ts-ignore
        return new Leaf({...this.spec, nullable: true})
    }

    optional = (): Omit<Leaf<$Spec & { optional: true }, 'optional'>, 'optional' | OmittedMethods> => {
        // @ts-ignore
        return new Leaf({...this.spec, optional: true})
    }

}

export class RevealSpec extends HasSpec<any> {
    getSpec = () => { 
        return super.getSpec()
    }
}

export const number = new Leaf({
    type: "number",
})

export const string = new Leaf({
    type: "string"
})

export type Runtime<T> = 
    (T extends NumberSpec ? number : string) | ( T extends Nullable ? null : never)

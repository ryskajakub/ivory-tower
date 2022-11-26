import { RelationshipType } from "./api"

type PluralName<Name> = Name extends string ? `${Name}s` : Name

export type Pluralify<Name, Type extends RelationshipType | null> = 
    Type extends null ? PluralName<Name> :
        IsTargetMany<Type> extends true ? PluralName<Name> : Name

export type IsTargetMany<Name> = Name extends `${infer Ignore}ToMany` ? true : false

export function plural(x: string) {
    return `${x}s`
}
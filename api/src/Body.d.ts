
export type ObjectType<Fields> = {
    type: "object",
    fields: Fields
}

// export type ArrayType<A> = {
//     type: "array",
//     a: A
// }

export type StringType = {
    type: "string"
}

/*
export type NumberType = {
    type: "number"
}

export type BoolType = {
    type: "bool"
}
*/

export type UnaryType = StringType 

type Choice = {
    type: string,
    value: BodyType
}

export type ChoiceType<Choices extends Choice[]> = {
    type: "choice"
    choices: Choices
}

export type BodyType = ObjectType<any> | StringType | ChoiceType<any>

export type DealWithChoices<Choices extends Choice[], Result> =
    Choices["length"] extends 0 ? Result :
    Choices extends [infer Element extends Choice, ...infer Rest extends Choice[]] ? DealWithChoices<Rest, Result | { type: Element["type"], value: MkBody<Element["value"]> }> : never

export type MkBody<T extends BodyType> =
    T extends StringType ? string :
    T extends ObjectType<infer Fields extends Record<string, BodyType>> ? {
        [Key in keyof Fields]: MkBody<Fields[Key]>
    } : 
    T extends ChoiceType<infer Choices extends Choice[]> ? DealWithChoices<Choices, never> : any


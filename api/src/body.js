
/**
 * 
 * @returns { import("./Body").StringType }
 */
export function stringType() {
    return {
        type: "string"
    }
}

/**
 * @template { Record<string, import("./Body").BodyType> } ExtType
 * @param { ExtType } fields
 * @returns { import("./Body").ObjectType<ExtType> } 
 */
export function objectType(fields) {
    return {
        type: "object",
        fields
    } 
}


/**
 * @template { import("./Body").Choice[] } ExtChoices
 */
export class MkSimpleChoiceType {

    #choices

    /**
     * @param {ExtChoices} choices 
     */
    constructor(choices) {
        this.#choices = choices
    }

    /**
     * @template { string } ExtString
     * @template { import("./Body").BodyType } A
     * @param { ExtString } type
     * @param { A } bodyType
     * @returns { MkSimpleChoiceType<[...ExtChoices, { type: ExtString, value: A }]> }
     */
    addChoice = (type, bodyType) => {

        const ch = {
            type,
            value: bodyType
        }

        return new MkSimpleChoiceType([...this.#choices, ch])
    }

    /**
     * @returns { import("./Body").ChoiceType<ExtChoices> }
     */
    getChoices = () => {
        return {
            type: "choice",
            choices: this.#choices
        }
    }

}

/**
 * @returns { MkSimpleChoiceType<[]> }
 */
export function mkSimpleChoiceType() {
    return new MkSimpleChoiceType([])
}


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
 * @template {number} ExtNumber
 * @template {string} Name
 * @template {import("./Body").UnaryType} ExtUnaryType
 * @param {ExtNumber} order 
 * @param {Name} name 
 * @param {ExtUnaryType} unaryType 
 */
export function paramPathType(order, name, unaryType) {

}

/**
 * @template {number} ExtNumber
 * @param {ExtNumber} order 
 * @param {string} name 
 */
export function unnamedPathType(order, name) {

}

export function headerType(name, value) {

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

/**
 * @template T
 * @param {[string, T][]} input 
 * @returns {{ [key: string]: T }}
 */
export function toObj(input) {
    /**
     * @param {{ [key: string]: T }} acc 
     * @param {[string, T][]} values 
     * @returns {{ [key: string]: T }}
     */
    function go(acc, values) {
        if (values.length === 0) {
            return acc
        }
        const value = values[0]
        const newAcc = {
            ...acc,
            [value[0]]: value[1]
        }
        const newValues = values.slice(1)
        return go(newAcc, newValues)
    }
    return go({}, input)
}

/**
 * @param { {[key: string]: any } } p
 * @param { (key: string, value: any) => any } f 
 * @returns { {[key: string]: any} }
 */
export function mapOneLevel(p, f) {
    return toObj(Object.entries(p).map(([colKey, colValue]) => [colKey, f(colKey, colValue) ]))
}
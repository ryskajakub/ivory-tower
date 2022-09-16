import { Table } from "./table"

/**
 * @param {string} type 
 * @param {string} value 
 * @returns { string }
 */
function mkDefault(type, value) {
    const isInt = ["smallint" , "integer" , "bigint", "real" , "double" , "numeric"].find((x) => x === type)
    if (isInt) {
        return value
    } 
    const isText = type === "text"
    if (isText) {
        return `'${value}'`
    }
    return ""
}

/**
 * @param { Table<any> } table
 * @param { { drop?: true } } options
 * @returns { import("./Runnable").QueryAndParams<void, false> }
 */
export function create(table, options) {

    const obj = table.def[table.name]

    const fields = Object.keys(obj).map(key => {
        const value = obj[key]
        const type = value.type
        // @ts-ignore
        const isSerial = () => value.default.type === "serial"
        // @ts-ignore
        const typeAndDefault = value.default ? (isSerial() ? "serial" : `${type} DEFAULT ${mkDefault(type, value.default)}`) : type
        const nullable = value.nullable ? "" : " NOT NULL"
        return `${key} ${typeAndDefault}${nullable}`
    })

    const fieldsRows = fields.join(",\n\t")

    const drop = options.drop ? `DROP TABLE IF EXISTS ${table.name}; ` : ``

    const query = 
`${drop}
CREATE TABLE ${table.name} (
    ${fieldsRows}
);`;

    return {
        params: [],
        query,
    }
}
import { match } from "assert";
import { print, printSqlExpression } from "../../db/src/print";
import { Field, FromItem, Join, JoinType, Literal, Path, SelectQuery, selectQuery, SqlExpression, SqlFunction } from "../../db/src/syntax";
import { Api, Entities, Entity, RelationshipType } from "./api";
import { plural } from "./plural";

export interface Request {
    [x: string]: true | Request
}

export function applyRequestKey(entityName: string, type: RelationshipType | undefined, request: Request): [string, Request][] {
    const getPluralizedEntityKey = (): string => {
        switch(type) {
            case "manyToMany": 
            case "reverseManyToMany": 
            case "oneToMany": 
            case undefined: return plural(entityName)
            default: return entityName
        }
    }
    const pluralizedEntityKey = getPluralizedEntityKey()

    if (request.hasOwnProperty(pluralizedEntityKey)) {
        return [[pluralizedEntityKey, request[pluralizedEntityKey] as Request]]
    } else {
        return []
    }
}

function processFields(fields: Record<string, any>, request: Request, otherObjectEntries: SqlExpression[] ): SqlExpression {

    const makeObjectEntry = (key: string, value: string) => {
        const $key: SqlExpression = {
            type: "literal",
            dbType: null,
            value: `'${key}'`
        }
        const $value: SqlExpression = {
            type: "path",
            value: value
        }
        return [$key, $value]
    }

    const filteredFields = Object.keys(fields).flatMap(fieldName => 
        request.hasOwnProperty(fieldName) ? makeObjectEntry(fieldName, fieldName) : []
    )

    const otherFields = otherObjectEntries

    const buildObjectField: SqlFunction = {
        type: "function",
        name: "JSONB_BUILD_OBJECT",
        args: [...filteredFields, ...otherFields]
    }

    return buildObjectField

} 
let i = 0

export function equality(path1: string, path2: string) {
    const bin: SqlExpression = {
        type: "binary",
        operator: "=",
        arg1: {
            type: "path",
            value: path1
        },
        arg2: {
            type: "path",
            value: path2
        }
    }
    return bin
}

export function getNames(type: RelationshipType, outerEntityName: string, innerEntityName: string): [string, string] {
    switch(type) {
        case "fromOne": return [`id`, `${outerEntityName}_id`]
        case "toOne": return [`${innerEntityName}_id`, `id`]
        case "manyToOne": return [`${innerEntityName}_id`, `id`]
        case "oneToMany": return [`id`, `${outerEntityName}_id`]
        case "manyToMany": return ["id", `${outerEntityName}_id`]
        case "reverseManyToMany": return ["id", `${outerEntityName}_id`]
    }
}

function arrayAggregatedData(buildObjectField: SqlExpression): SqlExpression {
    const dataAggField: SqlFunction = {
        type: "function",
        name: "JSONB_AGG",
        args: [
            buildObjectField
        ]
    }
    return dataAggField
}

function coalesce (expression: SqlExpression) : SqlExpression {
    const coalesceExpr: SqlExpression = {
        type: "function",
        name: "COALESCE",
        args: [ 
            expression,    
            {
                type: "function",
                name: "jsonb_build_array",
                args: []
            }
        ]
    }
    return coalesceExpr
}

function correctOuterData(type: RelationshipType, expression: SqlExpression): SqlExpression {

    const nullToArray = () => {

        const aggField = arrayAggregatedData(expression)

        const caseExpression: SqlExpression = {
            type: "anyFormFunction",
            args: [{
                type: "function",
                name: "jsonb_typeof",
                args: [aggField]
            }, {
                type: "literal",
                value: "'null'",
                dbType: null
            }, {
                type: "function",
                name: "jsonb_build_array",
                args: []
            }, aggField],
            print: ([obj, match, then, else1], printE) => {
                return `CASE ${printE(obj)} WHEN ${printE(match)} THEN ${printE(then)} ELSE ${printE(else1)} END`
            }
        }

        return caseExpression

    }

    switch(type) {
        // foreign key
        case "toOne":
        case "manyToOne": 
        case "fromOne": return expression
        case "oneToMany": 
        case "manyToMany":
        case "reverseManyToMany": return coalesce(expression)
        // outer
        // case null: return nullToArray()
    }

}

export function correctInnerData(type: RelationshipType | null, expression: SqlExpression): SqlExpression {
    switch(type) {
        case "fromOne": 
        case "toOne":
        case "manyToOne": return expression
        case null:
        case "manyToMany":
        case "reverseManyToMany":
        case "oneToMany": return arrayAggregatedData(expression)
    }
}

function joinType (type: RelationshipType): JoinType {
    switch(type) {
        case "toOne":
        case "manyToOne":
            return "inner"
        case "fromOne":
        case "oneToMany":
        case "manyToMany":
        case "reverseManyToMany":
            return "left"
    }
}

export function processEntity(outerEntityName: string, { fields, relations }: Entity, request: Request): [SqlExpression, Join[]] {

    const processedRelations = Object.entries(relations || []).flatMap(([innerEntityName, relationEntity]) => 

        applyRequestKey(innerEntityName, relationEntity.type, request).map(([pluralizedInnerEntityName, innerEntityRequest]) => {

            const [field, relationJoins1] = processEntity(innerEntityName, relationEntity, innerEntityRequest)

            i = i + 1
            const tableAlias = `t${i}`

            const $key: SqlExpression = {
                type: "literal",
                dbType: null,
                value: `'${pluralizedInnerEntityName}'`
            }
            const $value: SqlExpression = correctOuterData(relationEntity.type, {
                type: "path",
                value: `${tableAlias}.data`
            })

            const [outerFieldName, innerFieldName] = getNames(relationEntity.type, outerEntityName, innerEntityName)

            const idFieldName: Path = {
                type: "path",
                value: innerFieldName
            }

            const idField: Field = {
                expression: idFieldName,
                as: null
            }
            const dataField: Field = {
                expression: correctInnerData(relationEntity.type, field),
                as: "data"
            }

            const getManyToManyJoin = () => {

                const manyToManyJoin = (table1: string, table2: string, inner: string, outer: string): Join => 
                    ({
                        kind: {
                            type: "JoinTable",
                            tableName: `${plural(table1)}_${plural(table2)}`,
                            as: null
                        },
                        type: "inner",
                        on: equality("id", `${inner}_id`)
                    })

                switch(relationEntity.type) {
                    case "manyToMany": return [manyToManyJoin(outerEntityName, innerEntityName, innerEntityName, outerEntityName)]
                    case "reverseManyToMany": return [manyToManyJoin(innerEntityName, outerEntityName, innerEntityName, outerEntityName)]
                    default: return []
                } 
            }

            const fr1: FromItem = {
                from: {
                    type: "JoinTable",
                    tableName: plural(innerEntityName),
                    as: null
                },
                joins: [...relationJoins1, ...getManyToManyJoin()],
            }

            const query = selectQuery({ froms: [fr1], as: tableAlias, fields: [idField, dataField], groupBy: [idFieldName] })
            const join: Join = {
                kind: {
                    type: "JoinQuery",
                    query: query
                },
                type: joinType(relationEntity.type),
                on: equality(`${tableAlias}.${innerFieldName}`, outerFieldName)
            } 

            const ret: [SqlExpression[], Join] = [[$key, $value], join]
            return ret
        })
    )
    const relationFields = processedRelations.flatMap(([fields, ]) => fields)
    const relationJoins = processedRelations.map(([, join]) => join)

    const fieldsSql = processFields(fields, request, relationFields)
    return [fieldsSql, relationJoins]
}

export function select<T extends Entities>(api: Api<T>, request: Request) {

    const selects = Object.entries(api.entities as Entities).flatMap(([entityName, entity]) => {
        const applied = applyRequestKey(entityName, undefined, request)
        return applied.map(([pluralizedName, outerEntityRequest]) => {
            const [jsonBuildFields, joinItems] = processEntity(entityName, entity, outerEntityRequest)
            const typeField: Field = {
                expression: {
                    type: "literal",
                    value: `'${pluralizedName}'`,
                    dbType: null
                },
                as: "type"
            }

            const field: Field = {
                expression: coalesce(arrayAggregatedData(jsonBuildFields)),
                as: "data"
            } 
            const from: FromItem = {
                from: {
                    type: "JoinTable",
                    tableName: plural(entityName),
                    as: null
                },
                joins: joinItems
            }
            const select = selectQuery({ froms: [from], fields: [typeField, field] })
            return select
        })
    })

    i += 1

    const finalSelect = selectQuery({
        froms: [{
            from: {
                type: "JoinQuery",
                query: selects,
            },
            joins: []
        }],
        fields: [{ 
            as: "result",
            expression: {
                type: "function",
                name: "JSONB_OBJECT_AGG",
                args: [{
                    type: "path",
                    value: "type"
                }, {
                    type: "path",
                    value: "data"
                }]
            }
        }],
        as: "ultimate"
    })
    return `${print(finalSelect)}AS ultimate`

}

import { match } from "assert";
import { print, printSqlExpression } from "../../db/src/print";
import { Field, FromItem, Join, JoinType, Literal, Path, SelectQuery, selectQuery, SqlExpression, SqlFunction } from "../../db/src/syntax";
import { defaultMap, mapNull, mapValues, nullToArray, undefinedToNull } from "../../util/src/helpers";
import { Api, Entities, Entity, RelationshipType } from "./api";
import { Equality } from "./client";
import { plural } from "./plural";

export interface EntityRequest {
    select?: string[],
    where?: Equality,
    relations?: Request
}

export interface Request {
    [x: string]: EntityRequest
}

let i = 0

export function applyRequestKey(entityName: string, type: RelationshipType | undefined, request: Request): [string, EntityRequest] | null {
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
        return [pluralizedEntityKey, request[pluralizedEntityKey]]
    } else {
        return null
    }
}

function processFields(fields: Record<string, any>, request: string[], otherObjectEntries: SqlExpression[] ): SqlExpression {

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

    const filteredFields = Object.keys(fields).flatMap(fieldName => {
        return request.includes(fieldName) ? makeObjectEntry(fieldName, fieldName) : []
    })

    const otherFields = otherObjectEntries

    const buildObjectField: SqlFunction = {
        type: "function",
        name: "JSONB_BUILD_OBJECT",
        args: [...filteredFields, ...otherFields]
    }

    return buildObjectField

} 

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

    switch(type) {
        case "toOne":
        case "manyToOne": 
        case "fromOne": return expression
        case "oneToMany": 
        case "manyToMany":
        case "reverseManyToMany": return coalesce(expression)
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

function shouldGroup(type: RelationshipType): boolean {
    switch (type) {
        case "manyToOne": 
        case "toOne": 
        case "fromOne": return false
        case "oneToMany":
        case "manyToMany":
        case "reverseManyToMany": return true
    }
}

function getWhere(entity: Equality): SqlExpression {
    return {
        type: "binary",
        operator: "=",
        arg1: {
            type: "path",
            value: entity.field
        },
        arg2: {
            type: "literal",
            value: `'${entity.literal}'`,
            dbType: null
        }
    }
}

function makeOuterDataFields(pluralizedInnerEntityName: string, relationEntityType: RelationshipType, tableAlias: string): SqlExpression[] {
    const $key: SqlExpression = {
        type: "literal",
        dbType: null,
        value: `'${pluralizedInnerEntityName}'`
    }
    const $value: SqlExpression = correctOuterData(relationEntityType, {
        type: "path",
        value: `${tableAlias}.data`
    })

    return [$key, $value]
}

function makeRelationJoin(relationEntityType: RelationshipType, tableAlias: string, outerEntityName: string, innerEntityName: string, innerRelationField: SqlExpression, innerRelations: Join[], innerEntityWhere: null | Equality): Join {
    const [outerFieldName, innerFieldName] = getNames(relationEntityType, outerEntityName, innerEntityName)

    const idFieldName: Path = {
        type: "path",
        value: innerFieldName
    }

    const idField: Field = {
        expression: idFieldName,
        as: null
    }
    const dataField: Field = {
        expression: correctInnerData(relationEntityType, innerRelationField),
        as: "data"
    }

    const getManyToManyJoin = () => {

        const manyToManyJoin = (table1: string, table2: string, inner: string): Join => 
            ({
                kind: {
                    type: "JoinTable",
                    tableName: `${plural(table1)}_${plural(table2)}`,
                    as: null
                },
                type: "inner",
                on: equality("id", `${inner}_id`)
            })

        switch(relationEntityType) {
            case "manyToMany": return [manyToManyJoin(outerEntityName, innerEntityName, innerEntityName)]
            case "reverseManyToMany": return [manyToManyJoin(innerEntityName, outerEntityName, innerEntityName)]
            default: return []
        } 
    }

    const fr1: FromItem = {
        from: {
            type: "JoinTable",
            tableName: plural(innerEntityName),
            as: null
        },
        joins: [...innerRelations, ...getManyToManyJoin()],
    }

    const query = selectQuery({ 
        froms: [fr1], 
        as: tableAlias, 
        fields: [idField, dataField], 
        where: innerEntityWhere !== null ? getWhere(innerEntityWhere) : null,
        groupBy: shouldGroup(relationEntityType) ? [idFieldName] : [],
    })
    const join: Join = {
        kind: {
            type: "JoinQuery",
            query,
        },
        type: joinType(relationEntityType),
        on: equality(`${tableAlias}.${innerFieldName}`, outerFieldName)
    } 
    return join
}

export function processEntity(outerEntityName: string, { fields, relations }: Entity, request: EntityRequest): [SqlExpression, Join[]] {

    const processedRelations = Object.entries(relations || []).flatMap(([innerEntityName, relationEntity]) => {

        const appliedRequestKey = applyRequestKey(innerEntityName, relationEntity.type, request.relations || {})

        return defaultMap(appliedRequestKey, [], (([pluralizedInnerEntityName, innerEntityRequest]) => {

            const [innerRelationField, relationJoins1] = processEntity(innerEntityName, relationEntity, innerEntityRequest)

            i = i + 1
            const tableAlias = `t${i}`

            const outerDataField = makeOuterDataFields(pluralizedInnerEntityName, relationEntity.type, tableAlias)

            const join = makeRelationJoin(relationEntity.type, tableAlias, outerEntityName, innerEntityName, innerRelationField, relationJoins1, undefinedToNull(innerEntityRequest.where))

            const ret: [SqlExpression[], Join] = [outerDataField, join]
            return [ret]
        }))
    })
    const relationFields = processedRelations.flatMap(([fields, ]) => fields)
    const relationJoins = processedRelations.map(([, join]) => join)

    const fieldsSql = processFields(fields, request.select || [], relationFields)
    return [fieldsSql, relationJoins]
}

export function select<T extends Entities>(api: Api<T>, request: Request) {

    const selects = Object.entries(api.entities as Entities).flatMap(([entityName, entity]) => {
        const applied = applyRequestKey(entityName, undefined, request)
        return defaultMap(applied, [], (([pluralizedName, outerEntityRequest]) => {
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
            const select = selectQuery({ froms: [from], fields: [typeField, field], where: outerEntityRequest.where === undefined ? null : getWhere(outerEntityRequest.where) })
            return [select]
        }))
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

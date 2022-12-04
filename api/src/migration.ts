// @ts-nocheck
import { Api, Entities, RelationshipType } from "./api";
import { RevealSpec } from "./entity";
import { plural } from "./plural";

type Attribute = {
    name: string,
    argument: string | null
}

type Field = {
    name: string,
    type: string,
    nullable: boolean,
    attributes: Attribute[]
}

type Relation = {
    entity: string,
    plural: boolean,
    optional: boolean,
}

type ForeignKeyRelation = {
    name: string,
    entity: string,  
    relation: {
        fields: string,
        references: string,
    }
}

type Table = {
    name: string,
    fields: Field[],
    relations: Relation[],
    fkRelations: ForeignKeyRelation[],
    compoundId: string[],
}

export function createMigrations(api: Api<any>): Table[] {

    const tables: Table[] = Object.entries(api.entities as Entities).flatMap(([entityName, entity]) => {

        const tableName = plural(entityName)

        const entityFields = Object.entries(entity.fields).flatMap(
            ([fieldKey, value]) => {

                if (fieldKey === "id") {
                    return []
                } else {

                    const fieldSpec = (value as unknown as RevealSpec).getSpec()

                    const field: Field = {
                        name: fieldKey,
                        type: fieldSpec.type,
                        nullable: fieldSpec.nullable === true,
                        attributes: []
                    }
                    return [field]
                }
            })

        const primaryField: Field = {
            name: "id",
            type: "number",
            nullable: false,
            attributes: [{ name:  "id", argument: null }, { name: "default", argument: "autoincrement()"}]
        }

        const [relationFields, relations, fkRelations, models] = Object.entries(entity.relations || []).reduce<[Field[], Relation[], ForeignKeyRelation[], Table[]]>(
            ([$relationFields, $relations, $fkRelations, $models], [toEntity, { type: relationType }]) => {

                switch (relationType as RelationshipType) {
                    case "manyToOne":
                    case "toOne":
                        const field: Field = {
                            name: `${toEntity}_id`,
                            type: "number",
                            nullable: false,
                            attributes: relationType === "toOne" ? [{name: "unique", argument: null}] : [] ,
                        }
                        const fk: ForeignKeyRelation = {
                            entity: toEntity,
                            name: toEntity,
                            relation: {
                                fields: field.name,
                                references: "id"
                            } 
                        }
                        return [[...$relationFields, field], $relations, [...$fkRelations, fk], $models]
                    case "oneToMany":
                        const relation: Relation = {
                            entity: toEntity,
                            plural: true,
                            optional: false,
                        }
                        return [$relationFields, [...$relations, relation] ,$fkRelations, $models]
                    case "fromOne":
                        const relation2: Relation = {
                            entity: toEntity,
                            plural: false, 
                            optional: true,
                        }
                        return [$relationFields, [...$relations, relation2] ,$fkRelations, $models]
                    case "manyToMany": 
                        const relation3: Relation = {
                            entity: `${tableName}_${toEntity}`,
                            plural: true,
                            optional: false
                        }
                        const f1 = {
                            name: `${entityName}_id`,
                            attributes: [],
                            type: "number",
                            nullable: false,
                        }
                        const f2 = {
                            name: `${toEntity}_id`,
                            attributes: [],
                            type: "number",
                            nullable: false
                        }
                        const model: Table = {
                            name: `${tableName}_${plural(toEntity)}`,
                            fields: [f1, f2],
                            relations: [],
                            fkRelations: [{
                                name: plural(entityName),
                                entity: entityName,
                                relation: {
                                    fields: f1.name,
                                    references: "id"
                                }
                            }, {
                                name: plural(toEntity),
                                entity: toEntity,
                                relation: {
                                    fields: f2.name,
                                    references: "id"
                                }
                            }],
                            compoundId: [f1.name, f2.name]
                        }
                        return [$relationFields, [...$relations, relation3], $fkRelations, [...$models, model]]
                    case "reverseManyToMany":
                        const relation4: Relation = {
                            entity: `${plural(toEntity)}_${entityName}`,
                            plural: true,
                            optional: false
                        }
                        return [$relationFields, [...$relations, relation4], $fkRelations, $models]
                }
            }
        , [[],[],[],[]])

        const fields = [primaryField, ...relationFields, ...entityFields]

        const table: Table = {
            name: tableName,
            fields,
            relations,
            fkRelations,
            compoundId: []
        }

        return [table, ...models]
    })
    return tables
}

export function printType(type: "string" | "number"): string {
    switch(type) {
        case "number": return "Int"
        case "string": return "String"
    }
}

function printNullable(nullable: boolean): string {
    return nullable ? "?" : ""
}

function printAttributes(attributes: Attribute[]): string {
    return attributes.reduce((acc, attribute) => `${acc} @${attribute.name}${attribute.argument === null? "" : `(${attribute.argument})`}` , " ")
}

export function printMigrations(tables: Table[]) {
    return tables.reduce((acc, t) => {

        const tableName = t.name

        const fields = t.fields.map(f => `\t${f.name} ${printType(f.type as any)}${printNullable(f.nullable)}${printAttributes(f.attributes)}\n`).reduce((x, y) => x + y, "")

        const relations = t.relations.map(r => `\t${r.plural ? plural(r.entity) : r.entity} ${plural(r.entity)}${r.plural ? "[]" : ""}${r.optional ? "?" : ""}\n` ).reduce((x, y) => x + y, "")

        const fks = t.fkRelations.map(fk => `\t${fk.name} ${plural(fk.entity)} @relation(fields: [${fk.relation.fields}], references: [${fk.relation.references}])\n`).reduce((x, y) => x + y, "")

        const compoundId = t.compoundId.length === 0 ? `` : `@@id([${t.compoundId.join(", ")}])`

        return `${acc}
model ${tableName} {
${fields}
${relations}
${fks}
\t${compoundId}
}
`
    }, "")
}

import { Api, RelationshipType } from "./api";
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
    fkRelations: ForeignKeyRelation[]
}

export function createMigrations(api: Api<any>): Table[] {

    const tables: Table[] = Object.entries(api.entities).map(([key, value]) => {

        const entityFields = Object.entries((value as any).fields).map(
            ([fieldKey, value]) => {

                const fieldSpec = (value as RevealSpec).getSpec()

                const field: Field = {
                    name: fieldKey,
                    type: fieldSpec.type,
                    nullable: fieldSpec.nullable === true,
                    attributes: []
                }
                return field
            })

        const primaryField: Field = {
            name: "id",
            type: "number",
            nullable: false,
            attributes: [{ name:  "id", argument: null }, { name: "default", argument: "autoincrement()"}]
        }

        const [relationFields, relations, fkRelations] = Object.entries((value as any).relations).reduce<[Field[], Relation[], ForeignKeyRelation[]]>(
            ([$relationFields, $relations, $fkRelations], [toEntity, relationType]) => {
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
                        return [[...$relationFields, field], $relations, [...$fkRelations, fk]]
                    case "manyToMany":
                    case "oneToMany":
                        const relation: Relation = {
                            entity: toEntity,
                            plural: true,
                            optional: false,
                        }
                        return [$relationFields, [...$relations, relation] ,$fkRelations]
                    case "fromOne":
                        const relation2: Relation = {
                            entity: toEntity,
                            plural: false, 
                            optional: true,
                        }
                        return [$relationFields, [...$relations, relation2] ,$fkRelations]
                }
            }
        , [[],[],[]])

        const fields = [primaryField, ...relationFields, ...entityFields]

        const table: Table = {
            name: key,
            fields,
            relations,
            fkRelations
        }

        return table
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

        const tableName = plural(t.name)

        const fields = t.fields.map(f => `\t${f.name} ${printType(f.type as any)}${printNullable(f.nullable)}${printAttributes(f.attributes)}\n`).reduce((x, y) => x + y, "")

        const relations = t.relations.map(r => `\t${r.plural ? plural(r.entity) : r.entity} ${plural(r.entity)}${r.plural ? "[]" : ""}${r.optional ? "?" : ""}\n` ).reduce((x, y) => x + y, "")

        const fks = t.fkRelations.map(fk => `\t${fk.name} ${plural(fk.entity)} @relation(fields: [${fk.relation.fields}], references: [${fk.relation.references}])\n`).reduce((x, y) => x + y, "")

        return `${acc}
model ${tableName} {
${fields}
${relations}
${fks}
}
`
    }, "")
}
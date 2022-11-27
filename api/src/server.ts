import pgPromise from "pg-promise"
import { ExpandType } from "../../util/src/types"
import { Api, Entities, Entities2, RelationshipType } from "./api"
import { Equality, Field, RequestType, ReturnType } from "./client"
import { plural } from "./plural"
import { EntityRequest, Request, select } from "./query"

// const connectionString = process.env["DATABASE_URL"] || ""

const pg = pgPromise()({
    host: process.env["POSTGRES_HOST"] || "",
    user: process.env["POSTGRES_USER"] || "",
    database: process.env["POSTGRES_DB"] || "",
    password: process.env["POSTGRES_PASSWORD"] || "",
    encoding: "utf-8"
})

export interface ThisEntityRequest {
    select?: string[],
    where?: (x: Record<string, Field<any>>) => Equality,
    relations?: ThisRequest
}

export interface ThisRequest {
    [x: string]: ThisEntityRequest
}

export function applyRequestKey(entityName: string, type: RelationshipType | undefined, request: ThisRequest): [string, ThisEntityRequest][] {
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
        return [[pluralizedEntityKey, request[pluralizedEntityKey]]]
    } else {
        return []
    }
}

function transformRequest(entities: Entities2, request: ThisRequest): Request {
    const entries = Object.entries(entities).flatMap(([entityName, entity]) => {

        return applyRequestKey(entityName, entity.type, request).map(([pluralizedKey, entityRequest]) => {
            if (entityRequest.where) {
                const fields = Object.fromEntries(Object.entries(entity.fields).map(([name,]) => [name, new Field(name)]))
                const equality = entityRequest.where(fields)
                const base = {
                    ...entityRequest,
                    where: equality,
                }
                if (entityRequest.relations === undefined || entity.relations === undefined) {
                    return [pluralizedKey, base]
                } else {
                    return [pluralizedKey, {
                        ...base,
                        relations: transformRequest(entity.relations, entityRequest.relations)
                    }]
                }
            } else {
                return [pluralizedKey, entityRequest]
            }
        })
    })
    return Object.fromEntries(entries)
}

export class Server<T extends Entities> {

    constructor(private api: Api<T>) { }

    call = async <X extends RequestType<T>>(request: X): Promise<ExpandType<ReturnType<T, X>>> => {

        if (Object.keys(request).length === 0) {
            // @ts-ignore
            return {}
        } else {

            // @ts-ignore
            const transformedRequest = transformRequest(this.api.entities, request)

            // @ts-ignore
            const query = select(this.api, transformedRequest)

            const result = await pg.oneOrNone(query)

            // @ts-ignore
            return result.result
        }

    }

}

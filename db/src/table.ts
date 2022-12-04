import { Api, Entities, GetLeafSpec } from "../../api/src";
import { mapObject } from "../../util/src/helpers";
import { ExpandType } from "../../util/src/types";
import { Column, Column } from "./column";

export type AnyFrame = {
    [x: string]: {
        [y: string] : any
    }
}

export type GetTables<T extends Entities> = {
    [K in keyof T]: {
        [KK in K]: {
            [L in keyof T[K]["fields"]]: T[K]["fields"][L] extends GetLeafSpec<infer spec> ? Column<spec["type"]> : never
        }
    }
}

export class Tables<T extends Entities> {
    constructor(private api: Api<T>) { }

    tables = (): ExpandType<GetTables<T>> => {
        // @ts-ignore
        return mapObject(this.api.entities, (entityName, entity) => {
            return [entityName, mapObject(entity.fields, (fieldName, field) => {
                return [fieldName, field.spec]
            })]
        })
    }

}

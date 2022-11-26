import pgPromise from "pg-promise"
import { ExpandType } from "../../util/src/types"
import { Api, Entities } from "./api"
import { RequestType, ReturnType } from "./client"
import { Request, select } from "./query"

const connectionString = process.env["DATABASE_URL"] || ""

const pg = pgPromise()(connectionString)

export class Server<T extends Entities> {

    constructor(private api: Api<T>) { }

    call = async <X extends RequestType<T>>(request: X): Promise<ExpandType<ReturnType<T, X>>> => {

        if (Object.keys(request).length === 0) {
            // @ts-ignore
            return {}
        } else {

            // @ts-ignore
            const query = select(this.api, request)

            const result = await pg.oneOrNone(query)

            // @ts-ignore
            return result.result
        }

    }

}

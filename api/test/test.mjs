import { test, expect } from "@jest/globals"
import axios from "axios"
import { client, endpoint, serve } from "../src/description.mjs"

test('abc', async () => {

    const api = endpoint(`/abc/:def:number`, "POST", {
        200: {
            type: "array",
            values: "number"
        },
        400: {
            type: "object",
            values: {
                x: "string",
                y: "number"
            }
        }
    }, { type: "object", values: { x: "number" } })

    const server = await serve(api, (params, input) => {
        return {
            200: [params.def * input.x]
        }
    })

    const base = `http://localhost:3000`

    /** @type { any } */
    try {
        // const result = await axios.post(`${base}/abc/123`, {x: 2})
        const result = await client(api)({ def: 100 }, { x: 8 })

        switch (result.code) {
            case 200:
                expect(result.body[0]).toBe(800)
        }

        // console.log("result: ", result)

        // @ts-ignore
    } catch (e) {
        // @ts-ignore
        console.log("catch", e)
    } finally {
        server.close()
    }

})

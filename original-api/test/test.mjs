import { test, expect } from "@jest/globals"
import { client, endpoint, serve } from "../src/description.mjs"
import express from 'express'
import axios from "axios"

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

    const server = await serve(registerEndpoint => {
        registerEndpoint(api, (params, input) => {
            return {
                200: [params.def * input.x]
            }
        })
    })

    // const base = `http://localhost:3000`

    /** @type { any } */
    try {
        // const result = await axios.post(`${base}/abc/123`, {x: 2})
        const result = await client(api)({ def: 100 }, { x: 8 })

        expect(result.code).toBe(200)

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

test('def', async () => {
    const app = express()

    app.get('/xxx', (req, res) => {

        console.log(req.query)
        console.log(req.originalUrl)

        res.send()
    })

    app.listen(3000, async () => {
        axios.get("/xxx", {
            baseURL: "http://localhost:3000",
            params: {
                abc: ["def=", "ttt/"],
                xxx: {
                    ttt: {
                        wtf: 8,
                        lol: 222
                    }
                }
            }
        })
    })

})

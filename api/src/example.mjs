import { endpoint, serve } from "./description.mjs"
// import { InputType, OutputType } from "./types"

const x = endpoint(`/abc/:def:number`, "POST", {
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
}, { type: "object", values: { x: "number" } } )

serve(x, (params, input) => {
    return {
        200: [ params.def * input.x ]
    }
})

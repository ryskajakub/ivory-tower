import { endpoint, Endpoints, mkEndpoint, mkEndpoints } from "./api";
import { mkSimpleChoiceType, objectType, stringType } from "./body";

const body = objectType({
    field1: stringType(),
    field2: stringType(),
    field3: mkSimpleChoiceType().addChoice( "a", stringType()).addChoice("b", stringType()).getChoices()
})

const x = endpoint().addPath("xxx").addPath(":yyy").addPath("zzz").method("POST").inputBody(body).mkEndpoint()

const y = endpoint().addPath("lll").method("GET").mkEndpoint()

const e = mkEndpoints().addEndpoint(x).addEndpoint(y)

// console.log(JSON.stringify(x, undefined, 2))


/** @typedef { import("./Body").MkBody<typeof body> } A */

// const b = {
//     field1: stringType(),
//     field2: mkSimpleChoiceType(),
//     fieldx: pathType(),
// }

const e = mkEndpoint("abc", "GET", {
    field1: stringType(),
    f2: pathType()
})

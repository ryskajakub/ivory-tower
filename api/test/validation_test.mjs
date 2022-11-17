import { test, expect } from "@jest/globals"
import { getValidator, max, min, nullable } from "../src/description.mjs"

/**
 * @template { import("../src/types").PayloadElement } Payload
 * @param {string} name 
 * @param { Payload } payloadSpec
 * @param { import("../src/types.js").PayloadType<Payload> } payload 
 * @param { import("../src/types.js").ValidationResult<import("../src/types.js").PayloadType<Payload>> } expected 
 * @returns { { name: string, payloadSpec: Payload, payload: import("../src/types.js").PayloadType<Payload>, expected: import("../src/types.js").ValidationResult<import("../src/types.js").PayloadType<Payload>> } }
 */
const mkRow = (name, payloadSpec, payload, expected) => {
    return {
        name,
        payloadSpec,
        payload,
        expected
    }
}

const numberSpec = "number"

const table = [
    mkRow("number", numberSpec, 5, { type: "success", result: 5 }),
    mkRow("min success", min(5), 5, { type: "success", result: 5 }),
    mkRow("min failure", min(5), 4, { type: "failure" }),
    mkRow("max success", max(0), 0, { type: "success", result: 0 }),
    mkRow("max failure", max(0), 1, { type: "failure" }),
    mkRow("nullable number with null", nullable(numberSpec) , null, { type: "success", result: null }),
    mkRow("nullable number with value", nullable(numberSpec) , 5, { type: "success", result: 5 }),
    mkRow("nullable number with undefined", nullable(numberSpec) , /** @type {any} */ (undefined), { type: "failure" }),
]

test.each(table)('($name)', ({ payloadSpec, payload, expected }) => {
    const validated = getValidator(payloadSpec, "json")(payload)
    expect(validated).toStrictEqual(expected)
});

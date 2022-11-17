import axios from 'axios'
import express from 'express'

/**
 * @template { string } Path
 * @template { import("./types").HttpMethod } Method
 * @template { import("./types").RootElement | undefined } Input
 * @template { import("./types").Outputs } Outputs
 * @param { Path } path 
 * @param { Method } method 
 * @param { Outputs } outputs
 * @param { Input } input
 * @returns { import("./types").ExpandType<import("./types").CheckEndpoint<Path, Method, Input, Outputs>> }
 */
export function endpoint(path, method, outputs, input) {
    // @ts-ignore
    return {
        path,
        method,
        input,
        outputs
    }
}

/**
 * @template { string } Path
 * @template { import('./types').ObjectQuery } Query
 * @param { Path } path
 * @param { Query } query
 * @returns { import('./types').QueryEndpoint<Path, Query> }
 */
export function queryEndpoint(path, query) {
    // @ts-ignore   
    return {
        path,
        query
    }
}

/**
 * @template { import('./types').InnerPayloadElement | import('./types').RootElement } Payload
 * @param { Payload } payloadSpec 
 * @param { import('./types').SourceType } sourceType
 * @returns {( (payload: any) => import('./types').ValidationResult<import('./types').RootPayloadType<Payload>> )}
 */
export function getValidator(payloadSpec, sourceType) {
    // @ts-ignore
    return (payload) => {

        if (typeof payloadSpec === "string") {
            const leafTransformer = leafTransformers[payloadSpec]
            switch (sourceType) {
                case "json": return leafTransformer.fromJson(payload)
                case "string": return leafTransformer.fromString(payload)
            }
        } else {
            switch (payloadSpec.type) {
                case "empty": return {
                    type: "success",
                    result: null
                }
                case "undefined": 
                    if (payload === undefined) {
                        return {
                            type: "success",
                            result: null
                        }
                    } else {
                        return getValidator(payloadSpec.spec, sourceType)(payload)
                    }
                case "nullable":
                    if (payload === null) {
                        return {
                            type: "success",
                            result: null
                        }
                    } else {
                        return getValidator(payloadSpec.of_type, sourceType)(payload)
                    }
                case "validated":
                    const value = getValidator(payloadSpec.of, sourceType)(payload)
                    switch (value.type) {
                        case "success":
                            // @ts-ignore
                            const checked = payloadSpec.check(value.result)
                            switch (checked.type) {
                                case "success": return {
                                    type: "success",
                                    result: value.result
                                }
                                case "failure": return {
                                    type: "failure"
                                }
                            }
                        case "failure": return value
                    }
                case "simple_sum":
                    try {
                        const payloadKeys = Object.keys(payload)
                        if (payloadKeys.length === 2 && payloadKeys.includes("type") && payloadKeys.includes("values")) {
                            const key = payload["type"]
                            const values = payload["values"]
                            const valuesSpec = payloadSpec["values"][key]
                            return getValidator(valuesSpec, sourceType)(values)
                        } else {
                            return {
                                type: "failure"
                            }
                        }
                    } catch (e) {
                        return {
                            type: "failure"
                        }
                    }
                case "array":
                    if (Array.isArray(payload)) {
                        const results = payload.map(
                            element => getValidator(payloadSpec.values, sourceType)(element)
                        )
                        const collected = results.flatMap(r => {
                            if (r.type === "success") {
                                return [r.result]
                            } else {
                                return []
                            }
                        })
                        if (collected.length === results.length) {
                            return {
                                type: "success",
                                result: collected
                            }
                        } else {
                            return {
                                type: "failure"
                            }
                        }
                    } else {
                        return {
                            type: "failure"
                        }
                    }
                case "object":
                    try {
                        const payloadKeys = Object.keys(payload)
                        const specKeys = Object.keys(payloadSpec.values)
                        const extraKey = payloadKeys.some(payloadKey => {
                            specKeys.indexOf(payloadKey) === -1
                        })
                        if (extraKey) {
                            return {
                                type: "failure"
                            }
                        } else {
                            const results = specKeys.map(
                                specKey => {
                                    const keyPayloadSpec = payloadSpec.values[specKey]
                                    const value = payload[specKey]
                                    // @ts-ignore
                                    if (keyPayloadSpec["type"] === "optional") {
                                        if (payloadKeys.indexOf(specKey) === -1) {
                                            return [specKey, {
                                                type: "skip",
                                            }]
                                        } else {
                                            // @ts-ignore
                                            const innerKeyPayloadSpec = keyPayloadSpec["spec"]
                                            return [specKey, getValidator(innerKeyPayloadSpec, sourceType)(value)]
                                        }
                                    } else {
                                        if (payloadKeys.indexOf(specKey) === -1) {
                                            return [specKey, { type: "failure" }]
                                        } else {
                                            return [specKey, getValidator(/** @type { import('./types').PayloadElement } */(keyPayloadSpec), sourceType)(value)]
                                        }
                                    }
                                }
                            )
                            // @ts-ignore
                            const reduced = results.reduce((prev, [key, current]) => {
                                // @ts-ignore
                                switch (current.type) {
                                    case "failure":
                                        return prev
                                    case "success":
                                        return {
                                            ...prev,
                                            // @ts-ignore
                                            [key]: current.result
                                        }
                                    case "skip": return prev
                                }
                            }, {})
                            const reducedKeys = Object.keys(reduced)
                            if (specKeys.length === reducedKeys.length) {
                                return {
                                    type: "success",
                                    result: reduced
                                }
                            } else {
                                return {
                                    type: "failure"
                                }
                            }
                        }
                    } catch (e) {
                        return {
                            type: "failure"
                        }
                    }
            }
        }
    }
}

/**
 * @param {string} path 
 * @returns { [string[], string][] }
 */
function getNonEmptySegments(path) {
    const splitted = path.split('/')
    return splitted.filter((x) => x !== "").map(string => [string.split(":"), string])
}

/**
 * @template {string} Path
 * @param {Path} path 
 * @returns { [string, (params: Record<string, string> ) => import('./types').ValidationResult<import('./types').GetPathParams<Path>> ] }
 */
export function getPath(path) {
    /** @type [string, (params: Record<string, string>) => import('./types').ValidationResult<Record<string, any>>][] */
    const elements = getNonEmptySegments(path).map(([split, originalString]) => {
        if (split.length === 1) {
            return [originalString, () => ({ type: "success", result: {} })]
        }
        if (split.length === 2) {
            return [`:${split[1]}`, (params) => ({ type: "success", result: { [split[1]]: params[split[1]] } })]
        }
        // splat.length === 3
        /** @type { import('./types').PathElement } */
        const typeDesc = /** @type { import('./types').LeafElement } */ (split[2])

        return [`:${split[1]}`, (params) => {

            const result = getValidator(typeDesc, "string")(params[split[1]])

            switch (result.type) {
                case "success":
                    return {
                        type: "success",
                        result: ({ [split[1]]: result.result })
                    }
                case "failure":
                    return result
            }
        }]
    })
    const appPath = elements.map(x => x[0]).reduce((prev, curr) => `${prev}/${curr}`, "")
    const parsedParams = /** @type { (params: Record<string, string> ) => import('./types').ValidationResult<import('./types').GetPathParams<Path>> } */ (elements.map(x => x[1]).reduce((prev, curr) => {
        return (params) => {
            const prevRes = prev(params)
            switch (prevRes.type) {
                case "success":
                    const currRes = curr(params)
                    switch (currRes.type) {
                        case "failure": return currRes
                        case "success":
                            return {
                                type: "success",
                                result: {
                                    ...prevRes,
                                    ...currRes.result
                                }
                            }
                    }
                case "failure":
                    return prevRes
            }
        }
    }, () => ({ type: "success", result: {} })))

    return [appPath, parsedParams]
}

/**
 * @param { (registerEndpoint: <Endpoint extends import('./types').EndpointAny>(endpoint: Endpoint, handler: import('./types').MkHandler<Endpoint>) => void) => void } registerEndpoints
 * @returns { Promise<import("http").Server> }
 */
export function serve(registerEndpoints) {
    const app = express()
    app.use(express.json())
    registerEndpoints((endpoint, handler) => {
        registerExpressEndpoint(app, endpoint, handler)
    })
    return new Promise(resolve => {
        const port = 3000
        const server = app.listen(port, () => {
            resolve(server)
        })
    })
}

/**
 * @template { import("./types").EndpointAny } Endpoint
 * @param { import("express").Express } app
 * @param { Endpoint } endpoint 
 * @param { import("./types").MkHandler<Endpoint> } handler
 * @returns { void }
 */
export function registerExpressEndpoint(app, endpoint, handler) {

    const [path, pathParser] = getPath(endpoint.path)

    /** @type { (request: import("express").Request, response: import("express").Response) => Promise<void> } */
    const appHandler = async (request, response) => {

        const send400 = () => {
            /** @type { import('./types').ValidationFailed } */
            const payload400 = {
                400: {
                    message: "validation_failed"
                }
            }
            response.status(400).send(payload400[400])
        }

        const paramsResult = pathParser(request.params)

        switch (paramsResult.type) {
            case "failure":
                send400()
                break;
            case "success":
                /** @type [ any, import('./types').SourceType ] */
                const [inputPayload, sourceType] = endpoint.method === "GET" ? [request.params, "string"] : [request.body, "json"]
                const validator = getValidator(endpoint.input, sourceType)
                const result = validator(inputPayload)
                switch (result.type) {
                    case "failure":
                        send400()
                        break;
                    case "success":
                        const handlerRes = handler(paramsResult.result, result.result)
                        const key = Object.keys(handlerRes)[0]
                        // @ts-ignore
                        const payload = (handlerRes[key])
                        const numberKey = Number(key)
                        if (payload === null) {
                            response.status(numberKey).send()
                        } else {
                            response.status(numberKey).send(payload)
                        }
                }
        }

    }

    switch (endpoint.method) {
        case "GET": app.get(path, appHandler)
        case "POST": app.post(path, appHandler)
        case "DELETE": app.delete(path, appHandler)
        case "PATCH": app.patch(path, appHandler)
        case "PUT": app.put(path, appHandler)
    }

}

//  * @returns { import('./types').MkQuery<Query["query"]> }
/**
 * @template { import('./types').QueryEndpoint<any, any> } QueryEndpoint
 * @param { QueryEndpoint } queryEndpoint 
 * @template { import('./types').MkClientQuery<QueryEndpoint["query"]> } Query
 * @param { Query } query
 * @returns { import('./types').MkQuery<QueryEndpoint["query"], Query> } 
 */
export function queryClient(queryEndpoint, query) {
    // @ts-ignore
    return
}

/**
 * @template { import('./types').QueryEndpoint<any, any> } Query
 * @param { Query } queryEndpoint 
 * @returns { import('./types').MkClientQuery<Query["query"]> }
 */
export function xxx(queryEndpoint) {
    // @ts-ignore
    return
}

/**
 * @template { import("./types").EndpointAny } Endpoint
 * @param { Endpoint } endpoint 
 * @returns { import('./types').MkEndpointParams<Endpoint> }
 */
export function client(endpoint) {
    const nonEmptySegments = getNonEmptySegments(endpoint.path)
    const noParamsInPath = nonEmptySegments.every(([split,]) => split.length === 1)
    const isEmptyBody = endpoint.input.type === "empty"

    /** @type { import('axios').AxiosRequestConfig } */
    const baseConfig = {
        method: endpoint.method,
        baseURL: `http://localhost:3000`
    }

    if (noParamsInPath) {
        /** @type { import('axios').AxiosRequestConfig } */
        const config = {
            ...baseConfig,
            url: endpoint.path
        }
        if (isEmptyBody) {
            // @ts-ignore
            return () => performRequest(config)
        } else {
            // @ts-ignore
            return (input) => {
                /** @type { import('axios').AxiosRequestConfig } */
                const request = {
                    ...config,
                    data: input,
                }
                return performRequest(request)
            }
        }
    } else {

        // @ts-ignore
        return (params, input) => {

            const url = nonEmptySegments.map(([split, originalString]) => {
                if (split.length === 1) {
                    return `/${originalString}`
                } else {
                    const type = split.length === 3 ? split[2] : "string"
                    const name = split[1]
                    const param = params[name]
                    const paramAsString = leafTransformers[type].toString(param)
                    return `/${paramAsString}`
                }
            }).reduce((prev, curr) => `${prev}${curr}`)

            /** @type { import('axios').AxiosRequestConfig } */
            const config = {
                ...baseConfig,
                url
            }

            if (isEmptyBody) {
                return performRequest(config)
            } else {

                /** @type { import('axios').AxiosRequestConfig } */
                const request = {
                    ...config,
                    data: input,
                }
                return performRequest(request)
            }
        }
    }
}

/** @type { import('./types').LeafTransformer<number> } */
const numberTransformer = {
    fromJson: (json) => {
        if (typeof json === "number") {
            return {
                type: "success",
                result: json
            }
        } else {
            return {
                type: "failure"
            }
        }
    },
    toJson: (n) => n,
    fromString: (string) => {
        const n = Number(string)
        if (Number.isNaN(n)) {
            return {
                type: "failure"
            }
        } else {
            return {
                type: "success",
                result: n
            }
        }
    },
    toString: (t) => {
        return `${t}`
    }
}

/** @type { import('./types').LeafTransformer<string> } */
const stringTransformer = {
    fromJson: (json) => {
        if (typeof json === "string") {
            return {
                type: "success",
                result: json
            }
        } else {
            return {
                type: "failure"
            }
        }
    },
    toJson: (s) => s,
    fromString: (string) => {
        return {
            type: "success",
            result: string
        }
    },
    toString: (t) => {
        return t
    }
}

/** @type { Record<string, import('./types').LeafTransformer<any> > } */
const leafTransformers = {
    number: numberTransformer,
    string: stringTransformer,
}

/**
 * @template T
 * @param { import('axios').AxiosRequestConfig } requestConfig 
 * @return { Promise<T> }
 */
export async function performRequest(requestConfig) {
    try {
        const response = await axios.request(requestConfig)
        // @ts-ignore
        return {
            code: response.status,
            body: response.data
        }
    } catch (e) {
        if (isAxiosError(e) && e.response !== undefined) {
            // @ts-ignore
            return {
                code: e.response.status,
                body: e.response.data
            }
        } else {
            throw e
        }
    }
}

/**
 * @param {any} e 
 * @returns {e is import("axios").AxiosError}
 */
export function isAxiosError(e) {
    return e.isAxiosError === true
}

/**
 * @param {number} n 
 * @returns { import('./types').ValidatedElement<import('./types').NumberElement> }
 */
export function min(n) {
    return {
        type: "validated",
        of: "number",
        check: (x) => {
            return (x < n) ? ({ type: "failure" }) : ({ type: "success" })
        }
    }
}

/**
 * @param {number} n 
 * @returns { import('./types').ValidatedElement<import('./types').NumberElement> }
 */
export function max(n) {
    return {
        type: "validated",
        of: "number",
        check: (x) => {
            return (x > n) ? ({ type: "failure" }) : ({ type: "success" })
        }
    }
}

/**
 * @template { import('./types').PayloadElement } Spec
 * @param { Spec } spec
 * @returns { import('./types').NullableElement<Spec> }
 */
export function nullable(spec) {
    return {
        type: "nullable",
        of_type: spec
    }
}

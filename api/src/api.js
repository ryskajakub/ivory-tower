/**
 * @returns { PathBuilder<[]> }
 */
export function endpoint() {
    return new PathBuilder([])
}

/**
 * @template { import("./Api").Path[] } ExtPaths
 */
class PathBuilder {

    #paths;

    /**
     * @param {ExtPaths} paths 
     */
    constructor(paths) {
        this.#paths = paths
    }

    /**
     * @template { string } ExtPath
     * @param { ExtPath } path 
     * @returns { PathBuilder<import("./Api").AddPath<ExtPaths, ExtPath>> }
     */
    addPath = (path) => {

        /** @type { import("./Api").Path } */
        const newPath = path.startsWith(":") ? {
            type: "param",
            name: path.substring(1)
        } : {
            type: "literal",
            path,
        }

        // @ts-ignore
        return new PathBuilder(this.method, [...this.paths, newPath])
    }

    /**
     * @template { import("./Api").Method } ExtMethod
     * @param { ExtMethod } method
     * @returns { import("./Api").DispatchMethod<ExtMethod, ExtPaths> }
     */
    method = (method) => {
        switch (method) {
            // @ts-ignore
            case "GET": return new Get(this.#paths)
            // @ts-ignore
            case "POST": return new Post(this.#paths)
        }
        // @ts-ignore
        return
    }

}

/**
 * @template { import("./Api").Path[] } ExtPaths
 */
export class Post {

    #paths;

    /**
     * @param {ExtPaths} paths 
     */
    constructor(paths) {
        this.#paths = paths
    }

    /**
     * @template { import("./Body").BodyType } ExtBodyType
     * @param { ExtBodyType } body 
     * @returns { PostBody<ExtPaths, ExtBodyType> }
     */
    inputBody = (body) => {
        return new PostBody(this.#paths, body)
    }
}

/**
 * @template { import("./Api").Path[] } ExtPaths
 * @template { any } ExtBody 
 */
export class PostBody {

    #paths;
    #inputBody;

    /**
     * @param { ExtPaths } paths 
     * @param { ExtBody } body 
     */
    constructor(paths, body) {
        this.#paths = paths
        this.#inputBody = body
    }

    mkEndpoint() {
        return new Endpoint(this.#paths, this.#inputBody)
    }

}

/**
 * @template { import("./Api").Path[] } ExtPaths
 */
export class Get {
    /**
     * @param {ExtPaths} paths 
     */
    constructor(paths) {
        this.paths = paths
    }

    mkEndpoint() {
        return new Endpoint(this.paths, null)
    }

}

/**
 * @template ExtPaths
 * @template InputBody
 */
export class Endpoint {

    /**
     * @param { ExtPaths } path
     * @param { InputBody | null } inputBody
     */
    constructor(path, inputBody) {
        this.path = path
        this.input = inputBody
    }

}

/**
 * @template { Endpoint<any, any>[] } ExtEndpoints
 */
export class Endpoints {
    #endpoints;

    /**
     * @param {ExtEndpoints} endpoint
     */
    constructor(endpoint) {
        this.#endpoints = endpoint
    }

    /**
     * @template { Endpoint<any, any> } ExtEndpoint
     * @param {ExtEndpoint} endpoint
     * @return { Endpoints<[...ExtEndpoints, ExtEndpoint]> }
     */
    addEndpoint = (endpoint) => {
        return new Endpoints([...this.#endpoints, endpoint])
    }

}

/**
 * @returns { Endpoints<[]> }
 */
export function mkEndpoints() {
    return new Endpoints([])
}

import { Endpoint, Endpoints } from "./api";

/**
 * @template { Endpoints<any> } ExtEndpoints
 * @param { ExtEndpoints } endpoints 
 * @return { PathCaller<ExtEndpoints> }
 */
export function call(endpoints) {
    return new PathCaller(endpoints)
}

/**
 * @template { Endpoint<any, any>[] } Paths
 */
export class PathCaller {

    /**
     * @param {Endpoints<Paths>} endpoints 
     */
    constructor(endpoints) {

        /** @type { (endpoints: Paths) => import("./Client").Objectify<Paths> } */
        const objectifyEndpoints = (endpoints) => {
            endpoints
        }

        this.objects = objectifyEndpoints(endpoints)
    }



}

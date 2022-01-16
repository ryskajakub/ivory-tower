// import { toObj } from "./helpers"
// import { path } from "./column"
// import { TableToFrom } from "./Table"
import { From } from "./from"

/**
 * @template {import("./From").FromType<any>} T
 * @template {import("./From").FromType<any>} U
 * @template {import("./From").FromType<any>} V
 */
export class JoinPhase {
    #previousSqls;
    #currentSql;
    #previousFroms;
    #currentFrom;
    #tableName;
    #currentJoin;
    /**
     * @param {import("./Sql").FromItem[]} previousSqls
     * @param {import("./Sql").FromItem} currentSql
     * @param {T} previousFroms 
     * @param {U} currentFrom 
     * @param {string} tableName
     * @param {V} currentJoin
     */
    constructor(previousSqls, currentSql, previousFroms, currentFrom, tableName, currentJoin) {
        /** @readonly */
        this.#previousSqls = previousSqls
        /** @readonly */
        this.#currentSql = currentSql
        /** @readonly */
        this.#previousFroms = previousFroms
        /** @readonly */
        this.#currentFrom = currentFrom
        /** @readonly */
        this.#tableName = tableName
        /** @readonly */
        this.#currentJoin = currentJoin
    }

    /**
     * @param {(ab: import("./Helpers").DisjointUnion<U, V>) => import("./Sql").Condition} mkCondition 
     */
    ON = (mkCondition) => {

        /** @type { import("./Helpers").DisjointUnion<U, V> } */
        // @ts-ignore
        const union = {
            ...this.#currentFrom,
            ...this.#currentJoin,
        }

        // @ts-ignore
        const onResult = mkCondition(union)

        /** @type {import("./Sql").Join} */
        const join = {
            tableName: this.#tableName,
            on: onResult,
        }

        /** @type {import ("./Sql").FromItem} */
        const newSql = { ...this.#currentSql, joins: [...this.#currentSql.joins, join] }

        return new From(this.#previousSqls, newSql, this.#previousFroms, union)
    }

}

/**
 * @template {import("./From").FromType<any>} T
 * @template {import("./From").FromType<any>} U
 * @template {import("./From").FromType<any>} V
 * @extends JoinPhase<T, U, V>
 */
export class JoinPhaseAs extends JoinPhase {
    #previousSqls;
    #currentSql;
    #previousFroms;
    #currentFrom;
    #tableName;
    #currentJoin;
    /**
     * @param {import("./Sql").FromItem[]} previousSqls
     * @param {import("./Sql").FromItem} currentSql
     * @param {T} previousFroms 
     * @param {U} currentFrom 
     * @param {string} tableName
     * @param {V} currentJoin
     */
    constructor(previousSqls, currentSql, previousFroms, currentFrom, tableName, currentJoin) {
        super(previousSqls, currentSql, previousFroms, currentFrom, tableName, currentJoin)
        /** @readonly */
        this.#previousSqls = previousSqls
        /** @readonly */
        this.#currentSql = currentSql
        /** @readonly */
        this.#previousFroms = previousFroms
        /** @readonly */
        this.#currentFrom = currentFrom
        /** @readonly */
        this.#tableName = tableName
        /** @readonly */
        this.#currentJoin = currentJoin
    }

    /**
     * @template {string} Name
     * @param {Name} name
     * @returns {JoinPhase<T, U, import("./From").RenameFrom<V, Name>>}
     */
    AS = (name) => {
        // return new From(this.#previousSqls, newSql, this.#previousFroms, union)
        const key0 = Object.keys(this.#currentJoin)[0]
        const newCurrentJoin = {
            // @ts-ignore
            [name]: this.#currentJoin(key0)
        }
        // @ts-ignore
        return new JoinPhase(this.#previousSqls, this.#currentSql, this.#previousFroms, this.#currentFrom, this.#tableName, newCurrentJoin)
    }

}
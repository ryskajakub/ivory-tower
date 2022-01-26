// import { toObj } from "./helpers"
// import { path } from "./column"
// import { TableToFrom } from "./Table"
import { From } from "./from"

/**
 * @template T
 * @template U
 * @template V
 * @template {boolean} Lateral
 */
export class JoinPhase {
    /**
     * @param {import("./Sql").PreSelect} sql
     * @param {T} previousFroms 
     * @param {U} currentFrom 
     * @param {string} tableName
     * @param {V} currentJoin
     * @param {string | null} as
     */
    constructor(sql, previousFroms, currentFrom, tableName, currentJoin, as) {
        /** @readonly @protected */
        this.sql = sql
        /** @readonly @protected */
        this.previousFroms = previousFroms
        /** @readonly @protected */
        this.currentFrom = currentFrom
        /** @readonly @protected */
        this.tableName = tableName
        /** @readonly @protected */
        this.currentJoin = currentJoin
        /** @readonly @protected */
        this.as = as
    }

    /**
     * @param {(ab: import("./From").On<T, U, V, Lateral>) => import("./Sql").Condition} mkCondition 
     */
    ON = (mkCondition) => {

        /** @type { import("./Helpers").DisjointUnion<U, V> } */
        // @ts-ignore
        const union = {
            ...this.currentFrom,
            ...this.currentJoin,
        }

        // @ts-ignore
        const onResult = mkCondition(union)

        /** @type {import("./Sql").Join} */
        const newJoin = {
            tableName: this.tableName,
            on: onResult,
            as: this.as,
        }

        /** @type {import("./Sql").FromItem } */
        const currentFrom = this.sql.froms[this.sql.froms.length - 1]
        /** @type {import("./Sql").FromItem} */
        const newFrom = { ...currentFrom, joins: [...currentFrom.joins, newJoin] }
        /** @type {import("./Sql").PreSelect} */
        const newSql = { ...this.sql, froms: [...this.sql.froms.slice(0, -1), newFrom] }

        // @ts-ignore
        return new From(newSql, this.previousFroms, union)
    }

}

/**
 * @template T
 * @template U
 * @template V
 * @template {boolean} Lateral
 * @extends JoinPhase<T, U, V, Lateral>
 */
export class JoinPhaseAs extends JoinPhase {
    /**
     * @param {import("./Sql").PreSelect} sql
     * @param {T} previousFroms 
     * @param {U} currentFrom 
     * @param {string} tableName
     * @param {V} currentJoin
     * @param {string | null} as
     */
    constructor(sql, previousFroms, currentFrom, tableName, currentJoin, as) {
        super(sql, previousFroms, currentFrom, tableName, currentJoin, as)
    }

    /**
     * @template {string} Name
     * @param {Name} name
     * @returns {JoinPhase<T, U, import("./From").RenameFrom<V, Name>, Lateral>}
     */
    AS = (name) => {
        const key0 = Object.keys(this.currentJoin)[0]
        const newCurrentJoin = {
            // @ts-ignore
            [name]: this.currentJoin(key0)
        }
        // @ts-ignore
        return new JoinPhase(this.previousSqls, this.currentSql, this.previousFroms, this.currentFrom, this.tableName, newCurrentJoin, name)
    }

}
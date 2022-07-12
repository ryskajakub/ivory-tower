import { Column } from "./column"
import { From } from "./from"
import { renameColumns } from "./sql"
/**
 * @template T
 * @template U
 * @template V
 * @template {boolean} Lateral
 */
export class JoinPhase {
    /**
     * @param {import("./Sql").SelectQuery} sql
     * @param {T} previousFroms 
     * @param {U} currentFrom 
     * @param {string} tableName
     * @param {V} currentJoin
     * @param {string | null} as
     * @param { import("./From").JoinType } joinType
     */
    constructor(sql, previousFroms, currentFrom, tableName, currentJoin, as, joinType) {
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
        /** @readonly @protected */
        this.joinType = joinType
    }

    /**
     * @param { (ab: import("./From").On<T, U, V, Lateral>) => Column<"boolean", import("./Column").SingleState>} mkCondition 
     */
    ON = (mkCondition) => {

        /** @type { import("./Helpers").DisjointUnion<U, V> } */
        // @ts-ignore
        const union = {
            ...this.currentFrom,
            ...this.currentJoin,
        }

        /** @type { any } */
        const unionAny = union

        const onResult = mkCondition(unionAny)

        /** @type {import("./Sql").Join} */
        const newJoin = {
            tableName: this.tableName,
            on: onResult.value,
            as: this.as,
            type: this.joinType,
        }

        /** @type {import("./Sql").FromItem } */
        const currentFrom = this.sql.froms[this.sql.froms.length - 1]
        /** @type {import("./Sql").FromItem} */
        const newFrom = { ...currentFrom, joins: [...currentFrom.joins, newJoin] }
        /** @type {import("./Sql").SelectQuery} */
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
     * @param {import("./Sql").SelectQuery} sql
     * @param {T} previousFroms 
     * @param {U} currentFrom 
     * @param {string} tableName
     * @param {V} currentJoin
     * @param {string | null} as
     * @param { import("./From").JoinType } joinType
     */
    constructor(sql, previousFroms, currentFrom, tableName, currentJoin, as, joinType) {
        super(sql, previousFroms, currentFrom, tableName, currentJoin, as, joinType)
    }

    /**
     * @template {string} Name
     * @param {Name} name
     * @returns {JoinPhase<T, U, import("./From").RenameFrom<V, Name>, Lateral>}
     */
    AS = (name) => {
        const key0 = Object.keys(this.currentJoin)[0]

        // @ts-ignore
        const currentJoin = this.currentJoin[key0]
        const currentJoinAs = renameColumns(currentJoin, name)

        const newCurrentJoin = {
            [name]: currentJoinAs
        }

        // @ts-ignore
        return new JoinPhase(this.sql, this.previousFroms, this.currentFrom, this.tableName, newCurrentJoin, name, this.joinType)
    }

}
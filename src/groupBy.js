import { Having } from "./having"

/**
 * @template T
 * @template U
 */
export class GroupBy {
    /**
     * @param {import("./Sql").SelectQuery} sql
     * @param {T} previousFroms 
     * @param {U} currentFrom 
     */
    constructor(sql, previousFroms, currentFrom) {
        /** @readonly @protected */
        this.sql = sql
        /** @readonly @protected */
        this.previousFroms = previousFroms
        /** @readonly @protected */
        this.currentFrom = currentFrom
    }

    /**
     * @template {[import("./column").NamedColumn<any, any, any>, ...import("./column").NamedColumn<any, any, any>[]]} V
     * @param {(ab: import("./Helpers").NamedFroms<import("./Helpers").DisjointUnion<T, U>>) => V} mkFields 
     * @returns { import("./having").Having<import("./Helpers").GroupByResult<import("./Helpers").NamedFroms<import("./Helpers").DisjointUnion<T, U>>, V>> }
     */
    GROUP_BY(mkFields) {
        const union = {
            ...this.currentFrom,
            ...this.previousFroms,
        }
        // @ts-ignore
        const fields = mkFields(union)

        const paths = fields.map(c => c.v.value)
        const newSql = {
            ...this.sql,
            groupBy: paths,
        }

        // @ts-ignore
        return new Having(newSql, union)
    }

    asString = () => {
        return JSON.stringify({
            sql: this.sql,
            previousFroms: this.previousFroms,
            currentFrom: this.currentFrom,
        }, undefined, 2)
    }

}

/**
 * @template T
 * @template U
 * @extends GroupBy<T, U>
 */
export class Where extends GroupBy {

    /**
     * @param {import("./Sql").SelectQuery} sql
     * @param {T} previousFroms 
     * @param {U} currentFrom 
     */
    constructor(sql, previousFroms, currentFrom) {
        super(sql, previousFroms, currentFrom)
    }

    /**
     * @param {(ab: DisjointUnion<T, U>) => import("./Sql").Condition} mkCondition 
     */
    WHERE = (mkCondition) => {
        const union = {
            ...this.previousFroms,
            ...this.currentFrom,
        }

        // @ts-ignore
        const conditionResult = mkCondition(union)

        /** @type {import("./Sql").SelectQuery} */
        const newSql = {
            ...this.sql,
            where: conditionResult
        }

        return new GroupBy(newSql, this.previousFroms, this.currentFrom)

    }
}
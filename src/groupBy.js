import { Having } from "./having"

/**
 * @template {import("./From").FromTable<any>} T
 * @template {import("./From").FromTable<any>} U
 */
export class GroupBy {
    /**
     * @param {import("./Sql").PreSelect} sql
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

    //  * @returns { Having<import("./Helpers").GroupBy<import("./Helpers").NamedFroms<import("./Helpers").DisjointUnion<T, U>>, V>> }

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

}
import { Column, NamedColumn } from "./column"
import { Having } from "./having"
import { mapOneLevel } from "./helpers"

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
        const unionOfColumns = {
            ...this.currentFrom,
            ...this.previousFroms,
        }

        /** @type { (name: string, c: Column<any, any>) => NamedColumn<any, any, any> } */
        const toNamedColumn = (name, c) => {
            return c.AS(name)
        }

        const union = mapOneLevel(unionOfColumns, (_key, obj) => 
            mapOneLevel(obj, (name, c) => toNamedColumn(name, c))
        )

        // @ts-ignore
        const fields = mkFields(union)

        const paths = fields.map(c => c.value)
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
     * @param {(ab: import("./Helpers").DisjointUnion<T, U>) => Column<"boolean", import("./Column").SingleState>} mkCondition 
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
            where: conditionResult.value
        }

        return new GroupBy(newSql, this.previousFroms, this.currentFrom)

    }
}
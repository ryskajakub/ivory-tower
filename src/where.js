// import { GroupBy } from "./groupBy";

// /**
//  * @template {import("./From").FromTable<any>} T
//  * @template {import("./From").FromTable<any>} U
//  * @extends GroupBy<T, U>
//  */
// export class Where extends GroupBy {
//     /**
//      * @param {import("./Sql").PreSelect} sql
//      * @param {T} previousFroms 
//      * @param {U} currentFrom 
//      */
//     constructor(sql, previousFroms, currentFrom) {
//         super(sql, previousFroms, currentFrom)
//     }

//     /**
//      * @param {(tu: T & U) => import("./Sql").Condition} mkCondition 
//      */
//     WHERE = (mkCondition) => {
//         const union = {
//             ...this.previousFroms,
//             ...this.currentFrom,
//         }
//         const result = mkCondition(union)
//         /** @type {import("./Sql").PreSelect} */
//         const newSql = {
//             ...this.sql,
//             where: result,
//         }
//         return new GroupBy(newSql, this.previousFroms, this.currentFrom)
//     }

// }
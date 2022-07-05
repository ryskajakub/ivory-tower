import { Column } from "./column";
import { TypeMap } from "./Helpers";

export type Max<T> = T extends Column<infer DbType, any> ? DbType : never;

export type Min<T> = T extends Column<infer DbType, any> ? DbType : never;

export type Avg<T> = T extends Column<infer DbType, any>
  ? TypeMap<
      [
        ["smallint", "numeric"],
        ["integer", "numeric"],
        ["bigint", "numeric"],
        ["numeric", "numeric"],
        ["real", "double"],
        ["double", "double"],
        ["interval", "interval"]
      ],
      DbType
    >
  : never;

export type Sum<T> = T extends Column<infer DbType, any>
  ? TypeMap<
      [
        ["smallint", "bigint"],
        ["integer", "bigint"],
        ["bigint", "numeric"],
        ["numeric", "numeric"],
        ["real", "real"],
        ["double", "double"],
        ["interval", "interval"],
        ["money", "money"]
      ],
      DbType
    >
  : never;

export type ArrayAgg<T> = T extends Column<infer DbType, any>
  ? DbType extends any[]
    ? never
    : DbType[]
  : never;

// export type JsonObjectAgg<T> = 
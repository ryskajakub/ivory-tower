import { Column } from "./Column"

export type FromType<T> =
    {
        [U in keyof T]: {
            [Col in keyof T[U]]: Column<Exclude<T[U][Col], undefined>>
        }
    }

export type FromTypeAs<T, As extends string> =
    {
        [U in keyof T as As]: {
            [Col in keyof T[U]]: Column<Exclude<T[U][Col], undefined>>
        }
    }

export type RenameFrom<T extends FromType<any>, As extends string> =
    T extends FromType<infer U> ?
    FromTypeAs<U, As>
    : never
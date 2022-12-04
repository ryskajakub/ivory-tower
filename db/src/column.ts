export type AnyColumn = any

export type AggregateState = "post" | null

export class Column<type, name extends string | null = null, aggregateState extends AggregateState = null> {
    constructor(public type: type, public name: name) {}
}

export type Expression<type> = Column<type, null, null>

export type HttpMethod = "GET" | "POST" | "DELETE" | "PUT" | "PATCH"

export type Throw<Message extends string> = Message

export type Endpoint<Method extends HttpMethod, Path, Input extends RootElement | undefined, Outputs> = {
    method: Method,
    path: Path,
    input: Input,
    outputs: Outputs,
}

export type EndpointAny = Endpoint<HttpMethod, any, RootElement, any>

export type Var<Name, Type extends PathElement> = {
    name: Name,
    type: Type
}

export type ArrayElement = {
    type: "array",
    values: InnerPayloadElement
}

export type ObjectElement = {
    type: "object",
    values: Record<string, ObjectFieldSpec>
}

export type NumberElement = "number"

export type StringElement = "string"

export type BooleanElement = "boolean"

export type DateElement = "Date"

export type SimpleSumElement = {
    type: "simple_sum",
    values: Record<string, InnerPayloadElement>
}

export type EmptyBodyElement = {
    type: "empty"
}

export type ParseSuccess = {
    type: "success"
}

export type ParseFailure = {
    type: "failure",
}

export type ParseResult = ParseSuccess | ParseFailure

export type ValidatedElement<Type> = {
    type: "validated",
    of: Type,
    check: (pt: PayloadType<Type>) => ParseResult
}

export type DistributeValidated<T> = 
    T extends any ? ValidatedElement<T> : never

export type NullableElement<Type> = {
    type: "nullable",
    of_type: Type
}

export type DistributeNullable<T> = 
    T extends any ? NullableElement<T> : never

export type Validated<Type> = Type | DistributeValidated<Type>

export type Nullable<Type extends PayloadElement> = Type | DistributeNullable<Type>

export type PathLeafElement = NumberElement | StringElement | BooleanElement | DateElement

export type LeafElement = PathLeafElement

export type OptionalSpec<Type> = {
    type: "optional",
    spec: Type
}

export type PossiblyUndefinedSpec<Type> = {
    type: "undefined",
    spec: Type
}

export type DistributeUndefined<T> =
    T extends any ? PossiblyUndefinedSpec<T>: never

export type DistributeOptional<T> = 
    T extends any ? OptionalSpec<T>: never

export type Optional<Spec> = Spec | DistributeOptional<Spec>

export type PossiblyUndefined<Spec> = Spec | DistributeUndefined<Spec>

export type ObjectFieldSpec = Optional<InnerPayloadElement>

export type InnerPayloadElement = PossiblyUndefined<Nullable<Validated<ArrayElement | ObjectElement | SimpleSumElement | LeafElement>>>

export type RootElement = Validated<ObjectElement | ArrayElement | SimpleSumElement | EmptyBodyElement>

export type ParamElement = ObjectElement | SimpleSumElement | EmptyBodyElement 

export type PayloadElement = RootElement | InnerPayloadElement

export type PathElement = LeafElement

export type ProcessInput<I> =
    I extends ObjectElement | ArrayElement ? I : Throw<"Element not Object or Array">

export type Outputs = Record<number, RootElement>

export type CheckEndpoint<Path, Method extends HttpMethod, Input extends RootElement, Outputs> =
    ProcessPath<Path> extends never ? never :
    (Method extends "GET" ?
        (
            Input extends ParamElement ?
            Endpoint<Method, Path, Input, Outputs> :
            never
        )
        :
        Endpoint<Method, Path, Input, Outputs>
    )

export type ProcessPathElement<PathElement> =
    PathElement extends "" ? [] :
    PathElement extends `:${infer VarName}:${infer Leaf extends PathLeafElement}` ? [Var<VarName, Leaf>] :
    PathElement extends `:${infer VarName}` ? [Var<VarName, StringElement>] :
    PathElement extends `${infer PathElement}` ? [PathElement] : never

export type ProcessPath<P> = P extends `/${infer Path}/${infer More}` ? [...ProcessPathElement<Path>, ...ProcessPath<`/${More}`>] :
    P extends `/${infer Path}` ? ProcessPathElement<Path> : []

export type GetPathParams<P> = MkPathParam<ProcessPath<P>>

export type MkPathParam<Path> =
    Path extends [infer Element, ...infer Rest] ?
    Element extends Var<infer Name extends string, infer Type extends PathLeafElement> ? ExpandType<{ [K in Name]: PayloadType<Type> } & MkPathParam<Rest>> : MkPathParam<Rest>
    : {}

export type ExpandType<T> = {} & {
    [K in keyof T]: T[K]
}

type MkSumType<Key extends keyof Obj, Obj extends Record<Key, InnerPayloadElement>> =
    {
        type: Key,
        content: PayloadType<Obj[Key]>
    }

type ProcessSimpleSumType<SumKeys extends keyof Obj, Obj extends Record<SumKeys, InnerPayloadElement>> =
    SumKeys extends any ? ExpandType<MkSumType<SumKeys, Obj>> : never

export type PayloadType<Payload> =
    Payload extends StringElement ? string :
    Payload extends NumberElement ? number :
    Payload extends ArrayElement ? Array<PayloadType<Payload["values"]>> :
    Payload extends ObjectElement ? ({ 
        [K in keyof Payload["values"] as (Payload["values"][K] extends OptionalSpec<any> ? never : K)]: Payload["values"][K] 
    } & {
        [K in keyof Payload["values"] as (Payload["values"][K] extends OptionalSpec<any> ? K : never)]?: Payload["values"][K] 
    }
    ) :
    Payload extends SimpleSumElement ? ProcessSimpleSumType<keyof Payload["values"], Payload["values"]> :
    Payload extends EmptyBodyElement ? null :
    Payload extends NullableElement<infer T> ? null | PayloadType<T> : 
    Payload extends PossiblyUndefinedSpec<infer Spec> ? undefined | PayloadType<Spec> : 
    Payload extends ValidatedElement<infer T> ? PayloadType<T> :
    never

export type RootPayloadType<Payload extends RootElement> = PayloadType<Payload>

export type InputType<ExtendsEndpoint extends Endpoint<any, any, any, any>> =
    ExtendsEndpoint extends Endpoint<any, any, infer Input extends RootElement, any> ? RootPayloadType<Input> : never

type Distribute<T extends keyof Obj, Obj> =
    Obj[T] extends RootElement ?
    {
        [A in T]: RootPayloadType<Obj[T]>
    } : never

export type ValidationFailed = {
    400: {
        message: "validation_failed"
    }
}

export type MkOutputType<KeyofOutputs extends keyof Outputs, Outputs, Input, Inner extends boolean> =
    AddPossibleAnswer<KeyofOutputs extends any ? Distribute<KeyofOutputs, Outputs> : never, Input extends undefined ? {} : (Inner extends true ? {} : ValidationFailed)>

export type OutputType<ExtendsEndpoint extends EndpointAny, Inner extends boolean> =
    ExtendsEndpoint extends Endpoint<any, any, infer Input, infer Outputs extends Record<any, RootElement>> ? MkOutputType<keyof Outputs, Outputs, Input, Inner> : never

export type WithEach<Rec1 extends Record<number, any>, Rec2 extends Record<number, any>> =
    ExpandType<{
        [K in keyof Rec1]: K extends keyof Rec2 ? (Rec1[K] | Rec2[K]) : Rec1[K]
    }>

export type DistributeMkClientOutputType<SingleStatusCodeAnswer> =
    {
        [K in keyof SingleStatusCodeAnswer as "key"]: {
            code: K,
            body: SingleStatusCodeAnswer[K]
        }
    }["key"]

export type MkClientOutputType<OutputType> =
    OutputType extends any ? DistributeMkClientOutputType<OutputType> : never

export type AddPossibleAnswer<Rec1 extends Record<number, any>, Rec2 extends Record<number, any>> =
    Rec1 extends any ? WithEach<Rec1, Rec2> : never

export type MkHandler<ExtendsEndpoint extends EndpointAny> =
    ExtendsEndpoint extends Endpoint<any, infer Path, any, any> ?
    (params: GetPathParams<Path>, input: InputType<ExtendsEndpoint>) => OutputType<ExtendsEndpoint, true>
    : never

export type Success<A> = {
    type: "success",
    result: A
}

export type Failure = {
    type: "failure"
}

export type ValidationResult<A> = Success<A> | Failure

export type MkEndpointParams<ExtendsEndpoint> =
    ExtendsEndpoint extends Endpoint<any, infer Path, any, any> ?
    (InputType<ExtendsEndpoint> extends null ?
        (
            ProcessPath<Path>["length"] extends 0 ?
            () => Promise<MkClientOutputType<OutputType<ExtendsEndpoint, true>>> :
            (params: GetPathParams<Path>) => Promise<MkClientOutputType<OutputType<ExtendsEndpoint, true>>>
        ) :
        (
            ProcessPath<Path>["length"] extends 0 ?
            (input: InputType<ExtendsEndpoint>) => Promise<MkClientOutputType<OutputType<ExtendsEndpoint, true>>> :
            (params: GetPathParams<Path>, input: InputType<ExtendsEndpoint>) => Promise<MkClientOutputType<OutputType<ExtendsEndpoint, true>>>
        )
    )
    : never

export type JsonLeaf = boolean | number | string

export type LeafTransformer<T> = {
    fromJson: (json: JsonLeaf) => ValidationResult<T>
    toJson: (t: T) => JsonLeaf,
    fromString: (string: string) => ValidationResult<T>,
    toString: (t: T) => string
}

export type SourceType = "json" | "string"

import { Path } from "typescript"

export type HttpMethod = "GET" | "POST"

export type Throw<Message extends string> = Message

export type Endpoint<Method extends HttpMethod, Path, Input extends RootElement, Outputs> = {
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
    values: Record<string, InnerPayloadElement>
}

export type NumberElement = "number"

export type StringElement = "string"

export type SimpleSumElement = {
    type: "simple_sum",
    values: Record<string, InnerPayloadElement>
}

export type EmptyBodyElement = {
    type: "empty"
}

export type LeafElement = NumberElement | StringElement

export type InnerPayloadElement = ArrayElement | ObjectElement | SimpleSumElement | LeafElement

export type RootElement = ObjectElement | ArrayElement | SimpleSumElement | EmptyBodyElement

export type PayloadElement = RootElement | InnerPayloadElement

export type PathElement = LeafElement

export type ProcessInput<I> =
    I extends ObjectElement | ArrayElement ? I : Throw<"Element not Object or Array">

export type Outputs = Record<number, RootElement>

export type CheckEndpoint<Path, Method, Input, Outputs> =
    ProcessPath<Path> extends never ? never :
    Method extends HttpMethod ?
    Endpoint<Method, Path, Input, Outputs>
    : never

export type ProcessPathElement<PathElement> =
    PathElement extends "" ? [] :
    PathElement extends `:${infer VarName}:${infer Leaf extends LeafElement}` ? [Var<VarName, Leaf>] :
    PathElement extends `:${infer VarName}` ? [Var<VarName, StringElement>] :
    PathElement extends `${infer PathElement}` ? [PathElement] : never

export type ProcessPath<P> = P extends `/${infer Path}/${infer More}` ? [...ProcessPathElement<Path>, ...ProcessPath<`/${More}`>] :
    P extends `/${infer Path}` ? ProcessPathElement<Path> : []

export type GetPathParams<P> = MkPathParam<ProcessPath<P>>

export type MkPathParam<Path> =
    Path extends [infer Element, ...infer Rest] ?
    Element extends Var<infer Name extends string, infer Type extends LeafElement> ? ExpandType<{ [K in Name]: PayloadType<Type> } & MkPathParam<Rest>> : MkPathParam<Rest>
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

export type PayloadType<Payload extends InnerPayloadElement | RootElement> =
    Payload extends StringElement ? string :
    Payload extends NumberElement ? number :
    Payload extends ArrayElement ? Array<PayloadType<Payload["values"]>> :
    Payload extends ObjectElement ? { [K in keyof Payload["values"]]: PayloadType<Payload["values"][K]> } :
    Payload extends SimpleSumElement ? ProcessSimpleSumType<keyof Payload["values"], Payload["values"]> :
    Payload extends EmptyBodyElement ? null :
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

export type MkOutputType<KeyofOutputs extends keyof Outputs, Outputs, Input> =
    AddPossibleAnswer<KeyofOutputs extends any ? Distribute<KeyofOutputs, Outputs> : never, Input extends undefined ? {} : ValidationFailed>

export type OutputType<ExtendsEndpoint extends EndpointAny> =
    ExtendsEndpoint extends Endpoint<any, any, infer Input, infer Outputs extends Record<any, RootElement>> ? MkOutputType<keyof Outputs, Outputs, Input> : never

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
    (params: GetPathParams<Path>, input: InputType<ExtendsEndpoint>) => OutputType<ExtendsEndpoint>
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
            () => Promise<MkClientOutputType<OutputType<ExtendsEndpoint>>> :
            (params: GetPathParams<Path>) => Promise<MkClientOutputType<OutputType<ExtendsEndpoint>>>
        ) :
        (
            ProcessPath<Path>["length"] extends 0 ?
            (input: InputType<ExtendsEndpoint>) => Promise<MkClientOutputType<OutputType<ExtendsEndpoint>>> :
            (params: GetPathParams<Path>, input: InputType<ExtendsEndpoint>) => Promise<MkClientOutputType<OutputType<ExtendsEndpoint>>>
        )
    )
    : never

export type LeafTransformer<T> = {
    parse: (string: string) => ValidationResult<T>,
    toString: (t: T) => string
}
